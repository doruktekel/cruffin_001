"use client";

import { useStore } from "@/app/zustand/store";
import { TabsContent } from "@/components/ui/tabs";
import { Suspense } from "react";

function UserLoadingSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-20 sm:h-24 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
      <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-60 sm:h-80 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

const UserTabWrapper = ({ users, UserAnalyticsComponent }) => {
  const { user } = useStore();

  // Sadece admin ve superadmin kullanıcı analitiğini görebilir
  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return null;
  }

  return (
    <TabsContent value="users" className="space-y-4">
      <Suspense fallback={<UserLoadingSkeleton />}>
        <UserAnalyticsComponent users={users} />
      </Suspense>
    </TabsContent>
  );
};

export default UserTabWrapper;
