"use server";

import { authAction } from "@/lib/actions/safe-actions";
import { generateSlug } from "@/lib/format/id";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateBakeryOrganizationSchema = z.object({
  bakeryName: z
    .string()
    .min(2, "Le nom de la boulangerie doit contenir au moins 2 caractères"),
  bakeryAddress: z
    .string()
    .min(5, "L'adresse doit contenir au moins 5 caractères"),
  bakeryPhone: z
    .string()
    .min(10, "Le numéro de téléphone doit contenir au moins 10 caractères"),
  bakeryDescription: z.string().optional(),
  bakeryEmail: z.string().email("Email invalide"),
});

export const createBakeryOrganizationAction = authAction
  .schema(CreateBakeryOrganizationSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    const user = ctx.user;

    // Vérifier si l'utilisateur a déjà une organisation boulangerie
    const existingBakeryMembership = await prisma.member.findFirst({
      where: {
        userId: user.id,
        organization: {
          isBakery: true,
        },
      },
    });

    if (existingBakeryMembership) {
      throw new Error("Vous avez déjà une boulangerie associée à votre compte");
    }

    // Générer un slug unique pour la boulangerie
    let slug = generateSlug(input.bakeryName);
    let slugSuffix = 0;

    while (await prisma.organization.findUnique({ where: { slug } })) {
      slugSuffix++;
      slug = `${generateSlug(input.bakeryName)}-${slugSuffix}`;
    }

    // Créer l'organisation boulangerie
    const bakery = await prisma.organization.create({
      data: { 
        id: crypto.randomUUID(),
        createdAt: new Date(),
        name: input.bakeryName,
        slug,
        email: input.bakeryEmail,
        address: input.bakeryAddress,
        phone: input.bakeryPhone,
        description: input.bakeryDescription,
        isBakery: true,
        isCustomer: false,
        // Créer immédiatement le membership pour l'utilisateur
        
      },
    });

    // Créer les catégories par défaut
    const defaultCategories = [
      { name: "Pains", slug: "pains", position: 1 },
      { name: "Viennoiseries", slug: "viennoiseries", position: 2 },
      { name: "Pâtisseries", slug: "patisseries", position: 3 },
      { name: "Sandwichs", slug: "sandwichs", position: 4 },
      { name: "Boissons", slug: "boissons", position: 5 },
    ];

    await prisma.category.createMany({
      data: defaultCategories.map((category) => ({
        ...category,
        bakeryId: bakery.id,
        slug: `${slug}-${category.slug}`,
      })),
    });

    // Créer les paramètres par défaut
    await prisma.settings.create({
      data: {
        bakeryId: bakery.id,
        minOrderValue: 0,
        maxOrdersPerSlot: 10,
        storeOpenTime: "07:00",
        storeCloseTime: "19:00",
        timeSlotDuration: 15,
        preOrderDaysAhead: 3,
        paymentThreshold: 20,
      },
    });

    return {
      id: bakery.id,
      name: bakery.name,
      slug: bakery.slug,
      email: bakery.email,
      address: bakery.address,
      phone: bakery.phone,
      description: bakery.description,
    };
  });
