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
import { Users, Activity, Calendar, Award } from "lucide-react";

const UserAnalytics = ({ users }) => {
  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <p className="text-muted-foreground text-sm sm:text-base">
          Kullanıcı verisi bulunamadı
        </p>
      </div>
    );
  }

  // Rol dağılımı
  const roleDistribution = [
    {
      role: "Admin",
      count: users.filter((u) => u.role === "admin").length,
      color: "#3b82f6",
    },
    // {
    //   role: "Süper Admin",
    //   count: users.filter((u) => u.role === "superadmin").length,
    //   color: "#8b5cf6",
    // },
    {
      role: "Kullanıcı",
      count: users.filter((u) => u.role === "user").length,
      color: "#f59e0b",
    },
  ].filter((item) => item.count > 0);

  // Onay durumu
  const approvalStats = [
    {
      status: "Onaylanmış",
      count: users
        .filter((u) => u.role !== "superadmin" && u.role !== "admin")
        .filter((u) => u.isApproved).length,
    },
    {
      status: "Beklemede",
      count: users
        .filter((u) => u.role !== "superadmin" && u.role !== "admin")
        .filter((u) => !u.isApproved).length,
    },
  ];

  const chartConfig = {
    count: {
      label: "Kullanıcı Sayısı",
      color: "#a0aec0",
    },
  };

  const totalUsers = users.filter((u) => u.role !== "superadmin").length;

  // İstatistikleri hesapla
  const approvedUsers = users
    .filter((u) => u.isApproved)
    .filter((u) => u.role !== "superadmin" && u.role !== "admin").length;
  const userCount = users.filter(
    (u) => u.role !== "superadmin" && u.role !== "admin"
  ).length;
  const pendingUsers = users
    .filter((u) => u.role !== "superadmin" && u.role !== "admin")
    .filter((u) => !u.isApproved).length;
  const adminUsers = users.filter((u) => u.role === "admin").length;

  //|| u.role === "superadmin"

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Kullanıcı
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Kayıtlı kullanıcı sayısı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onaylanmış</CardTitle>
            <Award className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{approvedUsers}</div>
            <p className="text-xs text-muted-foreground">
              %
              {users.length > 0
                ? Math.round((approvedUsers / userCount) * 100)
                : 0}{" "}
              onay oranı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beklemede</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{pendingUsers}</div>
            <p className="text-xs text-muted-foreground">
              Onay bekleyen kullanıcı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yöneticiler</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">Admin</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rol Dağılımı</CardTitle>
            <CardDescription>
              Kullanıcıların rol bazında dağılımı
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ role, count }) => `${role}: ${count}`}
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Onay Durumu</CardTitle>
            <CardDescription>Kullanıcı onay durumu dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={approvalStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserAnalytics;
