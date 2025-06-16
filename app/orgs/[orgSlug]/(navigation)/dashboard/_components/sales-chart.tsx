"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";

interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

const chartConfig = {
  sales: {
    label: "Ventes",
    color: "hsl(var(--chart-1))",
  },
  orders: {
    label: "Commandes",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function SalesChart() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler des données de ventes pour les 7 derniers jours
    // En production, ceci devrait être remplacé par un appel API
    const generateSalesData = () => {
      const data: SalesData[] = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Simuler des données réalistes pour une boulangerie
        const baseOrders = Math.floor(Math.random() * 20) + 10; // 10-30 commandes par jour
        const avgOrderValue = Math.random() * 20 + 15; // 15-35€ par commande

        data.push({
          date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
          sales: Math.round(baseOrders * avgOrderValue * 100) / 100,
          orders: baseOrders
        });
      }

      return data;
    };

    setTimeout(() => {
      setSalesData(generateSalesData());
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ventes des 7 derniers jours</CardTitle>
          <CardDescription>Évolution du chiffre d'affaires et des commandes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Chargement...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSales = salesData.reduce((sum, day) => sum + day.sales, 0);
  const totalOrders = salesData.reduce((sum, day) => sum + day.orders, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventes des 7 derniers jours</CardTitle>
        <CardDescription>
          Total: {totalSales.toFixed(2)}€ • {totalOrders} commandes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <AreaChart
            accessibilityLayer
            data={salesData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}€`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="sales"
              type="natural"
              fill="var(--color-sales)"
              fillOpacity={0.4}
              stroke="var(--color-sales)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
} 