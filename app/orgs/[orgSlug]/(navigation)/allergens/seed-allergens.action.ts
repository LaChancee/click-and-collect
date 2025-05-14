"use server";

import { orgAction } from "@/lib/actions/safe-actions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { COMMON_ALLERGENS } from "../articles/common-allergens";
/**
 * Action serveur pour initialiser la liste d'allergènes standard
 * Cette action est protégée et ne peut être exécutée que par les administrateurs
 */
export const seedAllergensAction = orgAction
  .metadata({
    roles: ["owner", "admin"],
  })
  .schema(z.object({}))
  .action(async ({ ctx }: { ctx: any }) => {
    try {
      const existingAllergensCount = await prisma.allergen.count();

      // Si des allergènes existent déjà, on ne refait pas l'initialisation
      if (existingAllergensCount > 0) {
        return {
          message: `${existingAllergensCount} allergènes existent déjà dans la base de données`,
          success: true,
          added: 0,
        };
      }

      // Ajouter les allergènes standards en batch
      const result = await prisma.allergen.createMany({
        data: COMMON_ALLERGENS,
        skipDuplicates: true, // Ne pas créer de doublons (basé sur les contraintes uniques)
      });

      return {
        message: `${result.count} allergènes ajoutés avec succès`,
        success: true,
        added: result.count,
      };
    } catch (error) {
      console.error("Erreur lors de l'initialisation des allergènes:", error);
      return {
        message: "Erreur lors de l'initialisation des allergènes",
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
        added: 0,
      };
    }
  });
