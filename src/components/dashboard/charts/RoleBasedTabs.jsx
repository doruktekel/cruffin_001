// components/dashboard/RoleBasedTabs.jsx
"use client";

import { useStore } from "@/app/zustand/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Users, Package } from "lucide-react";

const RoleBasedTabs = ({ children, defaultValue = "categories" }) => {
  const { user } = useStore();

  // User rolü varsa kullanıcılar tabını gizle
  const showUsersTab = user?.role === "admin" || user?.role === "superadmin";

  return (
    <Tabs defaultValue={defaultValue} className="space-y-4">
      <TabsList
        className={`grid w-full ${
          showUsersTab ? "grid-cols-3" : "grid-cols-2"
        }`}
      >
        <TabsTrigger
          value="categories"
          className="flex items-center gap-2 cursor-pointer "
        >
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">Kategoriler</span>
          <span className="sm:hidden">Kat.</span>
        </TabsTrigger>

        <TabsTrigger
          value="products"
          className="flex items-center gap-2 cursor-pointer"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Ürünler</span>
          <span className="sm:hidden">Ürün</span>
        </TabsTrigger>

        {showUsersTab && (
          <TabsTrigger
            value="users"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Kullanıcılar</span>
            <span className="sm:hidden">Kull.</span>
          </TabsTrigger>
        )}
      </TabsList>

      {children}
    </Tabs>
  );
};

export default RoleBasedTabs;
