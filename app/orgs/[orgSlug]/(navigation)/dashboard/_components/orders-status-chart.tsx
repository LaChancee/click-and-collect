"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts";
import { useEffect, useState } from "react";

interface OrderStatusData {
  status: string;
  count: number;
  fill: string;
}

const chartConfig = {
  PENDING: {
    label: "En attente",
    color: "hsl(var(--chart-1))",
  },
  CONFIRMED: {
    label: "Confirmées",
    color: "hsl(var(--chart-2))",
  },
  PREPARING: {
    label: "En préparation",
    color: "hsl(var(--chart-3))",
  },
  READY: {
    label: "Prêtes",
    color: "hsl(var(--chart-4))",
  },
  COMPLETED: {
    label: "Terminées",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function OrdersStatusChart() {
  const [statusData, setStatusData] = useState<OrderStatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler des données de statut des commandes
    // En production, ceci devrait être remplacé par un appel API
    const generateStatusData = () => {
      const statuses = [
        { status: "PENDING", count: 5, fill: "var(--color-PENDING)" },
        { status: "CONFIRMED", count: 12, fill: "var(--color-CONFIRMED)" },
        { status: "PREPARING", count: 8, fill: "var(--color-PREPARING)" },
        { status: "READY", count: 3, fill: "var(--color-READY)" },
        { status: "COMPLETED", count: 45, fill: "var(--color-COMPLETED)" },
      ];

      return statuses.filter(s => s.count > 0);
    };

    setTimeout(() => {
      setStatusData(generateStatusData());
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statut des commandes</CardTitle>
          <CardDescription>Répartition par statut</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Chargement...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalOrders = statusData.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statut des commandes</CardTitle>
        <CardDescription>
          Total: {totalOrders} commandes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={statusData}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Légende */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          {statusData.map((item) => (
            <div key={item.status} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-muted-foreground">
                {chartConfig[item.status as keyof typeof chartConfig]?.label}: {item.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 