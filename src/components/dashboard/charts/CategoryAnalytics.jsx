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
  AreaChart,
  Area,
} from "recharts";
import { Package, TrendingUp, Activity, Award } from "lucide-react";

const CategoryAnalytics = ({ categories, products }) => {
  // Boş array kontrolü
  if (!categories || !products || categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <p className="text-muted-foreground text-sm sm:text-base">
          Kategori verisi bulunamadı
        </p>
      </div>
    );
  }

  // Kategoriye göre ürün sayısı
  const categoryProductCounts = categories
    .map((cat) => ({
      name: cat.name,
      count: products.filter(
        (p) => p.category?._id?.toString() === cat._id.toString()
      ).length,
      order: cat.order || 0,
    }))
    .sort((a, b) => a.order - b.order);

  // Kategori başına ortalama fiyat
  const categoryAvgPrices = categories
    .map((cat) => {
      const categoryProducts = products.filter(
        (p) => p.category?._id?.toString() === cat._id.toString()
      );
      const avgPrice =
        categoryProducts.length > 0
          ? categoryProducts.reduce((sum, p) => sum + (p.price || 0), 0) /
            categoryProducts.length
          : 0;

      return {
        name: cat.name,
        avgPrice: Math.round(avgPrice),
        productCount: categoryProducts.length,
        order: cat.order || 0,
      };
    })
    .sort((a, b) => a.order - b.order);

  // Chart config
  const chartConfig = {
    count: {
      label: "Ürün Sayısı",
      color: "#a0aec0",
    },
    avgPrice: {
      label: "Ortalama Fiyat",
      color: "#a0aec0",
    },
  };

  // En popüler kategoriyi bul
  const mostPopularCategory =
    categoryProductCounts.length > 0
      ? categoryProductCounts.reduce(
          (prev, current) => (prev.count > current.count ? prev : current),
          categoryProductCounts[0]
        )
      : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Kategori
            </CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Aktif kategori sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Popüler</CardTitle>
            <Award className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {mostPopularCategory?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              En fazla ürüne sahip kategori
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ortalama Ürün/Kategori
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {categories.length > 0
                ? Math.round(products.length / categories.length)
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Kategori başına düşen ürün
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Boş Kategoriler
            </CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {categoryProductCounts.filter((cat) => cat.count === 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ürün içermeyen kategori
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kategori Başına Ürün Sayısı</CardTitle>
            <CardDescription>Her kategorideki ürün dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart width={400} height={300} data={categoryProductCounts}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  className="fill-foreground"
                />
                <YAxis className="fill-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill={chartConfig.count.color}
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kategori Ortalama Fiyatları</CardTitle>
            <CardDescription>
              Kategorilerin ortalama ürün fiyatları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart width={400} height={300} data={categoryAvgPrices}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  className="fill-foreground"
                />
                <YAxis className="fill-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="avgPrice"
                  stroke={chartConfig.avgPrice.color}
                  fill={chartConfig.avgPrice.color}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoryAnalytics;
