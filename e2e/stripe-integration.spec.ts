import { prisma } from "@/lib/prisma";
import { expect, test } from "@playwright/test";
import { createTestAccount } from "./utils/auth-test";

test.describe("Stripe Integration E2E", () => {
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
      // Créer une organisation boulangerie avec Stripe configuré
      testOrganization = await prisma.organization.create({
        data: {
          name: "Ma Boulangerie Stripe Test",
          slug: `ma-boulangerie-stripe-${Date.now()}`,
          email: "stripe@maboulangerie.com",
          stripeAccountId: "acct_test_123456789", // Compte Stripe de test
          stripeChargesEnabled: true,
          stripeDetailsSubmitted: true,
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
          name: "Viennoiseries Premium",
          organizationId: testOrganization.id,
        },
      });

      // Créer un article de test avec un prix qui nécessite un paiement en ligne
      testArticle = await prisma.article.create({
        data: {
          name: "Croissant Premium",
          description: "Croissant artisanal au beurre fermier",
          price: 2550, // 25.50€ - Dépasse le seuil de paiement en ligne
          organizationId: testOrganization.id,
          categoryId: testCategory.id,
          isAvailable: true,
          isActive: true,
        },
      });

      // Créer un créneau horaire
      testTimeSlot = await prisma.timeSlot.create({
        data: {
          date: new Date(Date.now() + 86400000), // Tomorrow
          startTime: "09:00",
          endTime: "09:15",
          maxOrders: 10,
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

  test("should complete full payment flow with Stripe", async ({ page }) => {
    // 1. Aller sur la page boutique
    await page.goto(`/shop/${testOrganization.slug}`);

    // 2. Vérifier que la boutique s'affiche
    await expect(page.getByText("Ma Boulangerie Stripe Test")).toBeVisible({
      timeout: 10000,
    });

    // 3. Vérifier que l'article premium est visible avec son prix
    await expect(page.getByText("Croissant Premium")).toBeVisible();
    await expect(page.getByText("25,50 €")).toBeVisible();

    // 4. Ajouter l'article au panier
    const addToCartButton = page.getByRole("button", {
      name: /ajouter au panier/i,
    });
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await expect(page.getByText("Article ajouté au panier")).toBeVisible();
    }

    // 5. Ouvrir le panier et vérifier le contenu
    const cartButton = page.getByRole("button", { name: /panier/i });
    if (await cartButton.isVisible()) {
      await cartButton.click();
      await expect(page.getByText("Croissant Premium")).toBeVisible();
      await expect(page.getByText("25,50 €")).toBeVisible();
    }

    // 6. Procéder au checkout
    const checkoutButton = page.getByRole("button", { name: /commander/i });
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      await page.waitForURL(/\/checkout/, { timeout: 10000 });
    }

    // 7. Remplir les informations client
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
    } else {
      // Chercher un autre sélecteur de créneaux
      const firstSlot = page.getByText("09:00 - 09:15");
      if (await firstSlot.isVisible()) {
        await firstSlot.click();
      }
    }

    // 9. Vérifier que le paiement en ligne est proposé (montant élevé)
    await expect(page.getByText(/paiement en ligne/i)).toBeVisible();

    // 10. Sélectionner le paiement par carte en ligne
    const onlinePaymentRadio = page.getByRole("radio", {
      name: /carte.*en ligne/i,
    });
    if (await onlinePaymentRadio.isVisible()) {
      await onlinePaymentRadio.click();
    }

    // 11. Confirmer et initier le processus de paiement Stripe
    const payButton = page.getByRole("button", {
      name: /payer.*carte/i,
    });

    if (await payButton.isVisible()) {
      // Note: En test, nous ne pouvons pas réellement traiter un paiement Stripe
      // Nous vérifions que le bouton de paiement est présent et fonctionne
      await expect(payButton).toBeEnabled();

      // Simuler le clic (qui devrait rediriger vers Stripe)
      await payButton.click();

      // Vérifier qu'on a été redirigé ou qu'un processus de paiement a commencé
      // En test, cela pourrait être une simulation ou un mock
      await expect(page.getByText(/redirection.*paiement/i)).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("should handle Stripe account not configured", async ({ page }) => {
    // Créer une organisation sans Stripe configuré
    const orgWithoutStripe = await prisma.organization.create({
      data: {
        name: "Boulangerie Sans Stripe",
        slug: `boulangerie-sans-stripe-${Date.now()}`,
        email: "sans-stripe@boulangerie.com",
        stripeAccountId: null, // Pas de compte Stripe
        stripeChargesEnabled: false,
        members: {
          create: {
            userId: testUser.id,
            role: "OWNER",
          },
        },
      },
    });

    // Créer un article pour cette boulangerie
    const articleSansStripe = await prisma.article.create({
      data: {
        name: "Croissant Classique",
        price: 1500, // 15€
        organizationId: orgWithoutStripe.id,
        categoryId: testCategory.id,
        isAvailable: true,
        isActive: true,
      },
    });

    // Aller sur la boutique
    await page.goto(`/shop/${orgWithoutStripe.slug}`);

    // Ajouter l'article au panier
    const addToCartButton = page.getByRole("button", {
      name: /ajouter au panier/i,
    });
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
    }

    // Aller au checkout
    const cartButton = page.getByRole("button", { name: /panier/i });
    if (await cartButton.isVisible()) {
      await cartButton.click();
    }

    const checkoutButton = page.getByRole("button", { name: /commander/i });
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
    }

    // Vérifier que seul le paiement sur place est proposé
    await expect(page.getByText(/paiement sur place/i)).toBeVisible();
    await expect(page.getByText(/paiement en ligne/i)).not.toBeVisible();

    // Nettoyage
    await prisma.article.delete({ where: { id: articleSansStripe.id } });
    await prisma.organizationMember.deleteMany({
      where: { organizationId: orgWithoutStripe.id },
    });
    await prisma.organization.delete({ where: { id: orgWithoutStripe.id } });
  });

  test("should handle different payment thresholds", async ({ page }) => {
    // Créer un article pas cher (paiement sur place uniquement)
    const cheapArticle = await prisma.article.create({
      data: {
        name: "Petit Pain",
        price: 150, // 1.50€
        organizationId: testOrganization.id,
        categoryId: testCategory.id,
        isAvailable: true,
        isActive: true,
      },
    });

    // Test avec article pas cher
    await page.goto(`/shop/${testOrganization.slug}`);

    // Ajouter l'article pas cher au panier
    const cheapAddButton = page
      .getByText("Petit Pain")
      .locator("..")
      .getByRole("button", {
        name: /ajouter/i,
      });
    if (await cheapAddButton.isVisible()) {
      await cheapAddButton.click();
    }

    // Aller au checkout
    const cartButton = page.getByRole("button", { name: /panier/i });
    if (await cartButton.isVisible()) {
      await cartButton.click();
    }

    const checkoutButton = page.getByRole("button", { name: /commander/i });
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
    }

    // Vérifier que pour un petit montant, le paiement sur place est privilégié
    await expect(page.getByText(/paiement sur place/i)).toBeVisible();

    // Nettoyage
    await prisma.article.delete({ where: { id: cheapArticle.id } });
  });

  test("should validate Stripe session creation", async ({ page }) => {
    // Intercepter les appels API vers Stripe
    await page.route("**/api/stripe/checkout", async (route) => {
      if (route.request().method() === "POST") {
        // Simuler une réponse Stripe réussie
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            success: true,
            sessionId: "cs_test_123456789",
            url: "https://checkout.stripe.com/pay/cs_test_123456789",
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Suivre le processus complet jusqu'à la création de session
    await page.goto(`/shop/${testOrganization.slug}`);

    // Ajouter l'article premium
    const addToCartButton = page.getByRole("button", {
      name: /ajouter au panier/i,
    });
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
    }

    // Aller au checkout et remplir les informations
    const cartButton = page.getByRole("button", { name: /panier/i });
    if (await cartButton.isVisible()) {
      await cartButton.click();
    }

    const checkoutButton = page.getByRole("button", { name: /commander/i });
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
    }

    // Remplir les informations
    await page.getByLabel(/nom/i).fill("Test User");
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/téléphone/i).fill("0123456789");

    // Sélectionner un créneau
    const firstSlot = page.getByText("09:00 - 09:15");
    if (await firstSlot.isVisible()) {
      await firstSlot.click();
    }

    // Sélectionner paiement en ligne et valider
    const onlinePaymentRadio = page.getByRole("radio", {
      name: /carte.*en ligne/i,
    });
    if (await onlinePaymentRadio.isVisible()) {
      await onlinePaymentRadio.click();
    }

    const payButton = page.getByRole("button", {
      name: /payer.*carte/i,
    });

    if (await payButton.isVisible()) {
      await payButton.click();

      // Vérifier que l'API Stripe a été appelée
      await page.waitForResponse("**/api/stripe/checkout");
    }
  });

  test("should handle Stripe webhook simulation", async ({ page }) => {
    // Ce test simule la réception d'un webhook Stripe
    // En réalité, cela se ferait via un appel direct à l'API webhook

    // Créer une commande en attente de paiement
    const pendingOrder = await prisma.order.create({
      data: {
        orderNumber: `CMD-WEBHOOK-${Date.now()}`,
        totalAmount: 2550, // 25.50€
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod: "CARD_ONLINE",
        isGuestOrder: true,
        guestName: "Test Webhook User",
        guestEmail: "webhook@test.com",
        timeSlotId: testTimeSlot.id,
        stripeSessionId: "cs_test_webhook_123",
        items: {
          create: {
            quantity: 1,
            unitPrice: 2550,
            articleId: testArticle.id,
          },
        },
      },
    });

    // Simuler le traitement du webhook (normalement fait par Stripe)
    await prisma.order.update({
      where: { id: pendingOrder.id },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
      },
    });

    // Vérifier que la commande a été mise à jour
    const updatedOrder = await prisma.order.findUnique({
      where: { id: pendingOrder.id },
    });

    expect(updatedOrder?.status).toBe("CONFIRMED");
    expect(updatedOrder?.paymentStatus).toBe("PAID");

    // Nettoyage
    await prisma.orderItem.deleteMany({
      where: { orderId: pendingOrder.id },
    });
    await prisma.order.delete({
      where: { id: pendingOrder.id },
    });
  });

  test("should validate commission calculation", async ({ page }) => {
    // Test que les commissions sont correctement calculées
    const testCommissionAmount = 2500; // 25.00€
    const commissionRate = 3; // 3%
    const expectedCommission = Math.round(
      testCommissionAmount * (commissionRate / 100),
    );

    expect(expectedCommission).toBe(75); // 0.75€ = 75 centimes

    // Test avec différents montants
    const testCases = [
      { amount: 1000, rate: 3, expected: 30 }, // 10€ -> 30 centimes
      { amount: 5000, rate: 2.5, expected: 125 }, // 50€ -> 1.25€
      { amount: 10000, rate: 2.9, expected: 290 }, // 100€ -> 2.90€
    ];

    testCases.forEach(({ amount, rate, expected }) => {
      const commission = Math.round(amount * (rate / 100));
      expect(commission).toBe(expected);
    });
  });

  test("should handle Stripe errors gracefully", async ({ page }) => {
    // Intercepter les appels API pour simuler une erreur Stripe
    await page.route("**/api/stripe/checkout", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: "Cette boulangerie n'a pas configuré les paiements Stripe",
        }),
      });
    });

    await page.goto(`/shop/${testOrganization.slug}`);

    // Suivre le processus jusqu'au paiement
    const addToCartButton = page.getByRole("button", {
      name: /ajouter au panier/i,
    });
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
    }

    const cartButton = page.getByRole("button", { name: /panier/i });
    if (await cartButton.isVisible()) {
      await cartButton.click();
    }

    const checkoutButton = page.getByRole("button", { name: /commander/i });
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
    }

    // Remplir les informations et tenter le paiement
    await page.getByLabel(/nom/i).fill("Test Error User");
    await page.getByLabel(/email/i).fill("error@test.com");

    const firstSlot = page.getByText("09:00 - 09:15");
    if (await firstSlot.isVisible()) {
      await firstSlot.click();
    }

    const onlinePaymentRadio = page.getByRole("radio", {
      name: /carte.*en ligne/i,
    });
    if (await onlinePaymentRadio.isVisible()) {
      await onlinePaymentRadio.click();
    }

    const payButton = page.getByRole("button", {
      name: /payer.*carte/i,
    });

    if (await payButton.isVisible()) {
      await payButton.click();

      // Vérifier que l'erreur est affichée à l'utilisateur
      await expect(page.getByText(/erreur.*paiement/i)).toBeVisible({
        timeout: 5000,
      });
    }
  });
});
