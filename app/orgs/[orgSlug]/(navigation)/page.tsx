import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import type { PageParams } from "@/types/next";
import { BakeryStatsCards } from "./dashboard/_components/bakery-stats-cards";
import { RecentOrdersCard } from "./dashboard/_components/recent-orders-card";
import { SalesChart } from "./dashboard/_components/sales-chart";
import { OrdersStatusChart } from "./dashboard/_components/orders-status-chart";
import { TimeSlotsOverview } from "./dashboard/_components/time-slots-overview";

export default async function DashboardPage(
  props: PageParams<{
    orgSlug: string;
  }>,
) {
  return (
    <Layout size="lg">
      <LayoutHeader>
        <LayoutTitle>Dashboard de la boulangerie</LayoutTitle>
      </LayoutHeader>

      <LayoutContent className="flex flex-col gap-6">
        {/* Statistiques principales */}
        <BakeryStatsCards />

        {/* Graphiques et données */}
        <div className="grid gap-6 lg:grid-cols-2">
          <SalesChart />
          <OrdersStatusChart />
        </div>

        {/* Créneaux horaires et commandes récentes */}
        <div className="grid gap-6 lg:grid-cols-3">
          <TimeSlotsOverview />
          <RecentOrdersCard />
        </div>
      </LayoutContent>
    </Layout>
  );
}
