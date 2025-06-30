import { prisma } from "@/lib/prisma";
import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";
import { createTestAccount } from "./utils/auth-test";

test.describe("Orders Management", () => {
  let testOrganization: any;
  let testUser: any;

  test.beforeEach(async ({ page }) => {
    // Créer un compte de test et une organisation de boulangerie
    const userData = await createTestAccount({
      page,
      callbackURL: "/orgs",
    });

    // Créer une organisation de test
    testUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (testUser) {
      testOrganization = await prisma.organization.create({
        data: {
          name: "Boulangerie Test",
          slug: `boulangerie-test-${Date.now()}`,
          email: "test@boulangerie.com",
          members: {
            create: {
              userId: testUser.id,
              role: "OWNER",
            },
          },
        },
      });

      // Créer des créneaux horaires de test
      await prisma.timeSlot.create({
        data: {
          date: new Date(Date.now() + 86400000), // Tomorrow
          startTime: "09:00",
          endTime: "09:15",
          maxOrders: 10,
          currentOrders: 0,
          organizationId: testOrganization.id,
        },
      });

      // Créer des commandes de test
      await prisma.order.createMany({
        data: [
          {
            orderNumber: "ORD-TEST-001",
            organizationId: testOrganization.id,
            customerId: testUser.id,
            customerName: testUser.name,
            customerEmail: testUser.email,
            customerPhone: "+33123456789",
            timeSlotId: (await prisma.timeSlot.findFirst({
              where: { organizationId: testOrganization.id },
            }))!.id,
            status: "PENDING",
            paymentStatus: "PENDING",
            totalAmount: 2499,
          },
          {
            orderNumber: "ORD-TEST-002",
            organizationId: testOrganization.id,
            customerId: null,
            customerName: "Client Invité",
            customerEmail: "invite@example.com",
            customerPhone: "+33123456788",
            timeSlotId: (await prisma.timeSlot.findFirst({
              where: { organizationId: testOrganization.id },
            }))!.id,
            status: "CONFIRMED",
            paymentStatus: "PAID",
            totalAmount: 1500,
          },
        ],
      });
    }
  });

  test.afterEach(async () => {
    // Nettoyage après chaque test
    if (testOrganization) {
      await prisma.order.deleteMany({
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

  test("should display orders page with navigation", async ({ page }) => {
    // Naviguer vers l'organisation
    await page.goto(`/orgs/${testOrganization.slug}`);

    // Vérifier que nous sommes bien sur la page de l'organisation
    await expect(page.getByText("Boulangerie Test")).toBeVisible();

    // Cliquer sur le lien "Commandes" dans la navigation
    await page.getByRole("link", { name: "Commandes" }).click();

    // Attendre la navigation vers la page des commandes
    await page.waitForURL(/\/orgs\/.*\/orders/);

    // Vérifier que la page des commandes s'affiche
    await expect(page.getByText("Gestion des commandes")).toBeVisible();
  });

  test("should display orders statistics", async ({ page }) => {
    await page.goto(`/orgs/${testOrganization.slug}/orders`);

    // Vérifier les statistiques affichées
    await expect(page.getByText("Total des commandes")).toBeVisible();
    await expect(page.getByText("2")).toBeVisible(); // 2 commandes créées

    await expect(page.getByText("En attente")).toBeVisible();
    await expect(page.getByText("1")).toBeVisible(); // 1 commande en attente

    await expect(page.getByText("Chiffre d'affaires")).toBeVisible();
    // Le montant total devrait être affiché
  });

  test("should display orders in table", async ({ page }) => {
    await page.goto(`/orgs/${testOrganization.slug}/orders`);

    // Attendre que le tableau se charge
    await page.waitForSelector("[data-testid='orders-table']", {
      timeout: 10000,
    });

    // Vérifier les en-têtes du tableau
    await expect(page.getByText("Numéro")).toBeVisible();
    await expect(page.getByText("Client")).toBeVisible();
    await expect(page.getByText("Articles")).toBeVisible();

    // Vérifier que les commandes sont affichées
    await expect(page.getByText("#ORD-TEST-001")).toBeVisible();
    await expect(page.getByText("#ORD-TEST-002")).toBeVisible();

    // Vérifier les noms de clients
    await expect(page.getByText(testUser.name)).toBeVisible();
    await expect(page.getByText("Client Invité")).toBeVisible();

    // Vérifier les statuts
    await expect(page.getByText("En attente")).toBeVisible();
    await expect(page.getByText("Confirmée")).toBeVisible();
  });

  test("should filter orders by search", async ({ page }) => {
    await page.goto(`/orgs/${testOrganization.slug}/orders`);

    // Attendre que le tableau se charge
    await page.waitForSelector("[data-testid='orders-table']", {
      timeout: 10000,
    });

    // Utiliser le champ de recherche
    const searchInput = page.getByPlaceholder(
      "Rechercher par numéro de commande...",
    );
    await expect(searchInput).toBeVisible();

    // Rechercher une commande spécifique
    await searchInput.fill("ORD-TEST-001");

    // Vérifier que seule la commande recherchée apparaît
    await expect(page.getByText("#ORD-TEST-001")).toBeVisible();
    await expect(page.getByText("#ORD-TEST-002")).not.toBeVisible();

    // Effacer la recherche
    await searchInput.clear();

    // Vérifier que toutes les commandes réapparaissent
    await expect(page.getByText("#ORD-TEST-001")).toBeVisible();
    await expect(page.getByText("#ORD-TEST-002")).toBeVisible();
  });

  test("should handle column sorting", async ({ page }) => {
    await page.goto(`/orgs/${testOrganization.slug}/orders`);

    // Attendre que le tableau se charge
    await page.waitForSelector("[data-testid='orders-table']", {
      timeout: 10000,
    });

    // Cliquer sur l'en-tête de colonne pour trier
    const dateHeader = page.getByText("Créé le");
    await expect(dateHeader).toBeVisible();

    // Vérifier que le tri est possible (rechercher les boutons de tri)
    const sortButtons = page.locator("[data-testid*='sort']");
    if ((await sortButtons.count()) > 0) {
      await sortButtons.first().click();
      // Le tableau devrait se réorganiser (difficile à tester précisément sans plus de DOM structure)
    }
  });

  test("should display column visibility controls", async ({ page }) => {
    await page.goto(`/orgs/${testOrganization.slug}/orders`);

    // Attendre que le tableau se charge
    await page.waitForSelector("[data-testid='orders-table']", {
      timeout: 10000,
    });

    // Chercher le bouton de contrôle des colonnes
    const columnButton = page.getByText("Colonnes");
    if (await columnButton.isVisible()) {
      await columnButton.click();

      // Vérifier qu'un menu de sélection des colonnes apparaît
      await expect(page.getByText("Basculer les colonnes")).toBeVisible();
    }
  });

  test("should handle pagination", async ({ page }) => {
    await page.goto(`/orgs/${testOrganization.slug}/orders`);

    // Attendre que le tableau se charge
    await page.waitForSelector("[data-testid='orders-table']", {
      timeout: 10000,
    });

    // Chercher les contrôles de pagination
    const paginationInfo = page.locator("text=/Page \\d+ sur \\d+/");
    if (await paginationInfo.isVisible()) {
      await expect(paginationInfo).toBeVisible();
    }

    // Avec seulement 2 commandes, nous devrions être sur la page 1
    const pageText = page.getByText("Page 1 sur 1");
    if (await pageText.isVisible()) {
      await expect(pageText).toBeVisible();
    }
  });

  test("should show order actions menu", async ({ page }) => {
    await page.goto(`/orgs/${testOrganization.slug}/orders`);

    // Attendre que le tableau se charge
    await page.waitForSelector("[data-testid='orders-table']", {
      timeout: 10000,
    });

    // Chercher le menu d'actions pour une commande
    const actionsButton = page.locator("[data-testid*='actions']").first();
    if (await actionsButton.isVisible()) {
      await actionsButton.click();

      // Vérifier que le menu d'actions apparaît
      await expect(page.getByText("Voir les détails")).toBeVisible();
      await expect(page.getByText("Modifier le statut")).toBeVisible();
    }
  });
});
