import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import type { PageParams } from "@/types/next";
import { TimeSlotSettingsForm } from "./_components/TimeSlotSettingsForm";

export default async function TimeSlotSettingsPage(props: PageParams<{ orgSlug: string }>) {
  const params = await props.params;
  const orgSlug = params.orgSlug;

  const org = await getRequiredCurrentOrgCache();

  // Récupérer les paramètres existants ou créer des valeurs par défaut
  let settings = await prisma.settings.findUnique({
    where: {
      bakeryId: org.id,
    },
  });

  // Si aucun paramètre n'existe, créer des valeurs par défaut
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        bakeryId: org.id,
        storeOpenTime: "08:00",
        storeCloseTime: "18:00",
        timeSlotDuration: 30,
        maxOrdersPerSlot: 5,
        preOrderDaysAhead: 3,
      },
    });
  }

  return (
    <Layout>
      <LayoutHeader>
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <a href={`/orgs/${orgSlug}/time-slots`}>
              <ArrowLeft className="h-4 w-4" />
            </a>
          </Button>
          <LayoutTitle>Paramètres des créneaux horaires</LayoutTitle>
        </div>
      </LayoutHeader>
      <LayoutContent>
        <div className="max-w-2xl mx-auto">
          <TimeSlotSettingsForm
            orgSlug={orgSlug}
            settings={settings}
          />
        </div>
      </LayoutContent>
    </Layout>
  );
} 