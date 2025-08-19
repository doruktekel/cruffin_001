"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ShoppingCart, TrendingUp, Activity, Banknote } from "lucide-react";

const ProductAnalytics = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <p className="text-muted-foreground text-sm sm:text-base">
          Ürün verisi bulunamadı
        </p>
      </div>
    );
  }

  // Fiyat aralığı dağılımı
  const priceRanges = [
    { range: "0-50", min: 0, max: 50 },
    { range: "51-100", min: 51, max: 100 },
    { range: "101-200", min: 101, max: 200 },
    { range: "200+", min: 201, max: Infinity },
  ];

  const priceDistribution = priceRanges.map((range) => ({
    range: range.range,
    count: products.filter((p) => {
      const price = p.price || 0;
      return price >= range.min && price <= range.max;
    }).length,
  }));

  // Diyet özellikleri dağılımı
  const dietaryFeatures = [
    {
      name: "Vegan",
      count: products.filter((p) => p.isVegan).length,
      color: "#22c55e",
    },
    {
      name: "Vejetaryen",
      count: products.filter((p) => p.isVegetarian).length,
      color: "#3b82f6",
    },
    {
      name: "Glutensiz",
      count: products.filter((p) => p.isGlutenFree).length,
      color: "#f59e0b",
    },
    {
      name: "Baharatlı",
      count: products.filter((p) => p.isSpicy).length,
      color: "#ef4444",
    },
  ];

  const chartConfig = {
    count: {
      label: "Adet",
      color: "#a0aec0",
    },
  };

  // İstatistikleri hesapla
  const validPrices = products
    .filter((p) => p.price && p.price > 0)
    .map((p) => p.price);
  const avgPrice =
    validPrices.length > 0
      ? validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length
      : 0;

  const availableProducts = products.filter((p) => p.isAvailable).length;
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ürün</CardTitle>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Sistemdeki toplam ürün
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ortalama Fiyat
            </CardTitle>
            <Banknote className="h-5 w-5text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">₺{Math.round(avgPrice)}</div>
            <p className="text-xs text-muted-foreground">
              Tüm ürünlerin ortalama fiyatı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mevcut Ürünler
            </CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{availableProducts}</div>
            <p className="text-xs text-muted-foreground">
              %
              {products.length > 0
                ? Math.round((availableProducts / products.length) * 100)
                : 0}{" "}
              stokta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fiyat Aralığı</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              ₺{minPrice} - ₺{maxPrice}
            </div>
            <p className="text-xs text-muted-foreground">
              En düşük - En yüksek fiyat
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fiyat Dağılımı</CardTitle>
            <CardDescription>
              Ürünlerin fiyat aralığına göre dağılımı
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diyet Özellikleri</CardTitle>
            <CardDescription>
              Ürünlerin diyet özelliklerine göre dağılımı
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dietaryFeatures}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {dietaryFeatures.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductAnalytics;
