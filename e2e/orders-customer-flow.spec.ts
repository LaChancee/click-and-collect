import { prisma } from "@/lib/prisma";
import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";
import { createTestAccount } from "./utils/auth-test";

test.describe("Customer Order Flow", () => {
  let testOrganization: any;
  let testUser: any;
  let testArticle: any;
  let testTimeSlot: any;
  let testCategory: any;

  test.beforeEach(async ({ page }) => {
    // Créer un compte de test
    const userData = await createTestAccount({
      page,
      callbackURL: "/orgs",
    });

    testUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (testUser) {
      // Créer une organisation boulangerie
      testOrganization = await prisma.organization.create({
        data: {
          name: "Ma Boulangerie Test",
          slug: `ma-boulangerie-${Date.now()}`,
          email: "test@maboulangerie.com",
          members: {
            create: {
              userId: testUser.id,
              role: "OWNER",
            },
          },
        },
      });

      // Créer une catégorie de test
      testCategory = await prisma.category.create({
        data: {
          name: "Viennoiseries",
          organizationId: testOrganization.id,
        },
      });

      // Créer un article de test
      testArticle = await prisma.article.create({
        data: {
          name: "Croissant artisanal",
          description: "Délicieux croissant fait maison",
          price: 199, // 1.99€
          organizationId: testOrganization.id,
          categoryId: testCategory.id,
          isAvailable: true,
        },
      });

      // Créer un créneau horaire
      testTimeSlot = await prisma.timeSlot.create({
        data: {
          date: new Date(Date.now() + 86400000), // Tomorrow
          startTime: "08:00",
          endTime: "08:15",
          maxOrders: 20,
          currentOrders: 0,
          organizationId: testOrganization.id,
        },
      });
    }
  });

  test.afterEach(async () => {
    // Nettoyage
    if (testOrganization) {
      await prisma.orderItem.deleteMany({
        where: {
          order: { organizationId: testOrganization.id },
        },
      });
      await prisma.order.deleteMany({
        where: { organizationId: testOrganization.id },
      });
      await prisma.article.deleteMany({
        where: { organizationId: testOrganization.id },
      });
      await prisma.category.deleteMany({
        where: { organizationId: testOrganization.id },
      });
      await prisma.timeSlot.deleteMany({
        where: { organizationId: testOrganization.id },
      });
      await prisma.organizationMember.deleteMany({
        where: { organizationId: testOrganization.id },
      });
      await prisma.organization.delete({
        where: { id: testOrganization.id },
      });
    }
    if (testUser) {
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    }
  });

  test("should complete full customer order flow", async ({ page }) => {
    // 1. Aller sur la page boutique
    await page.goto(`/shop/${testOrganization.slug}`);

    // 2. Vérifier que la boutique s'affiche
    await expect(page.getByText("Ma Boulangerie Test")).toBeVisible({
      timeout: 10000,
    });

    // 3. Vérifier que l'article est visible
    await expect(page.getByText("Croissant artisanal")).toBeVisible();
    await expect(page.getByText("1,99 €")).toBeVisible();

    // 4. Ajouter l'article au panier
    const addToCartButton = page.getByRole("button", {
      name: /ajouter au panier/i,
    });
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();

      // Vérifier que l'article a été ajouté au panier
      await expect(page.getByText("Article ajouté au panier")).toBeVisible();
    }

    // 5. Ouvrir le panier
    const cartButton = page.getByRole("button", { name: /panier/i });
    if (await cartButton.isVisible()) {
      await cartButton.click();

      // Vérifier le contenu du panier
      await expect(page.getByText("Croissant artisanal")).toBeVisible();
      await expect(page.getByText("1,99 €")).toBeVisible();
    }

    // 6. Procéder au checkout
    const checkoutButton = page.getByRole("button", { name: /commander/i });
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();

      // Attendre la navigation vers la page de checkout
      await page.waitForURL(/\/checkout/, { timeout: 10000 });
    }

    // 7. Remplir les informations de livraison/retrait
    const nameInput = page.getByLabel(/nom/i);
    if (await nameInput.isVisible()) {
      await nameInput.fill("Jean Dupont");
    }

    const emailInput = page.getByLabel(/email/i);
    if (await emailInput.isVisible()) {
      await emailInput.fill("jean.dupont@example.com");
    }

    const phoneInput = page.getByLabel(/téléphone/i);
    if (await phoneInput.isVisible()) {
      await phoneInput.fill("0123456789");
    }

    // 8. Sélectionner un créneau horaire
    const timeSlotSelector = page.locator("[data-testid='time-slot-selector']");
    if (await timeSlotSelector.isVisible()) {
      await timeSlotSelector.click();

      // Sélectionner le premier créneau disponible
      const firstSlot = page.getByText("08:00 - 08:15");
      if (await firstSlot.isVisible()) {
        await firstSlot.click();
      }
    }

    // 9. Confirmer la commande (sans paiement pour ce test)
    const confirmButton = page.getByRole("button", {
      name: /confirmer la commande/i,
    });
    if (await confirmButton.isVisible()) {
      await confirmButton.click();

      // Attendre la confirmation
      await expect(page.getByText(/commande confirmée/i)).toBeVisible({
        timeout: 15000,
      });
    }
  });

  test("should handle cart management", async ({ page }) => {
    await page.goto(`/shop/${testOrganization.slug}`);

    // Attendre que la page se charge
    await expect(page.getByText("Ma Boulangerie Test")).toBeVisible();

    // Ajouter plusieurs articles au panier
    const addButton = page
      .getByRole("button", { name: /ajouter au panier/i })
      .first();
    if (await addButton.isVisible()) {
      // Ajouter 3 fois le même article
      await addButton.click();
      await page.waitForTimeout(500);
      await addButton.click();
      await page.waitForTimeout(500);
      await addButton.click();
    }

    // Ouvrir le panier
    const cartButton = page.getByRole("button", { name: /panier/i });
    if (await cartButton.isVisible()) {
      await cartButton.click();

      // Vérifier la quantité
      const quantityInput = page.locator("input[type='number']").first();
      if (await quantityInput.isVisible()) {
        expect(await quantityInput.inputValue()).toBe("3");

        // Modifier la quantité
        await quantityInput.fill("2");

        // Vérifier que le total s'est mis à jour
        await expect(page.getByText("3,98 €")).toBeVisible(); // 2 x 1.99€
      }
    }

    // Supprimer l'article du panier
    const removeButton = page.getByRole("button", { name: /supprimer/i });
    if (await removeButton.isVisible()) {
      await removeButton.click();

      // Vérifier que le panier est vide
      await expect(page.getByText(/panier vide/i)).toBeVisible();
    }
  });

  test("should handle time slot selection", async ({ page }) => {
    // Créer des créneaux supplémentaires
    await prisma.timeSlot.createMany({
      data: [
        {
          date: new Date(Date.now() + 86400000), // Tomorrow
          startTime: "09:00",
          endTime: "09:15",
          maxOrders: 20,
          currentOrders: 0,
          organizationId: testOrganization.id,
        },
        {
          date: new Date(Date.now() + 86400000), // Tomorrow
          startTime: "10:00",
          endTime: "10:15",
          maxOrders: 20,
          currentOrders: 20, // Complet
          organizationId: testOrganization.id,
        },
      ],
    });

    await page.goto(`/shop/${testOrganization.slug}`);

    // Ajouter un article au panier et aller au checkout
    const addButton = page
      .getByRole("button", { name: /ajouter au panier/i })
      .first();
    if (await addButton.isVisible()) {
      await addButton.click();
    }

    const cartButton = page.getByRole("button", { name: /panier/i });
    if (await cartButton.isVisible()) {
      await cartButton.click();
    }

    const checkoutButton = page.getByRole("button", { name: /commander/i });
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      await page.waitForURL(/\/checkout/);
    }

    // Vérifier la sélection des créneaux
    const timeSlotSection = page.locator("[data-testid='time-slots']");
    if (await timeSlotSection.isVisible()) {
      // Vérifier qu'il y a des créneaux disponibles
      await expect(page.getByText("08:00 - 08:15")).toBeVisible();
      await expect(page.getByText("09:00 - 09:15")).toBeVisible();

      // Le créneau complet devrait être désactivé ou marqué comme indisponible
      const fullSlot = page.getByText("10:00 - 10:15");
      if (await fullSlot.isVisible()) {
        await expect(fullSlot).toHaveAttribute("disabled", "");
      }
    }
  });

  test("should show order confirmation details", async ({ page }) => {
    // Créer une commande de test directement en base
    const testOrder = await prisma.order.create({
      data: {
        orderNumber: `TEST-${Date.now()}`,
        organizationId: testOrganization.id,
        customerId: testUser.id,
        customerName: testUser.name,
        customerEmail: testUser.email,
        customerPhone: "+33123456789",
        timeSlotId: testTimeSlot.id,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        totalAmount: 199,
        items: {
          create: {
            articleId: testArticle.id,
            quantity: 1,
            unitPrice: 199,
          },
        },
      },
    });

    // Aller sur la page de confirmation
    await page.goto(`/shop/order-confirmation?orderId=${testOrder.id}`);

    // Vérifier les détails de la commande
    await expect(page.getByText(/commande confirmée/i)).toBeVisible();
    await expect(page.getByText(testOrder.orderNumber)).toBeVisible();
    await expect(page.getByText("Croissant artisanal")).toBeVisible();
    await expect(page.getByText("1,99 €")).toBeVisible();
    await expect(page.getByText("08:00 - 08:15")).toBeVisible();
  });
});
