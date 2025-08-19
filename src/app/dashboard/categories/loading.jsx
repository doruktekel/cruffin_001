"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesSkeleton() {
  return (
    <div className="space-y-6 px-4 py-6">
      {/* Üstteki "Kategori Ekle" butonu skeleton */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-[160px] rounded-md" />
      </div>

      {/* Kategori butonları skeletonları */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 border rounded-md shadow-sm"
          >
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" /> {/* Silme butonu */}
          </div>
        ))}
      </div>

      {/* Kaydet butonu skeleton */}
      <div className="flex justify-center mt-6">
        <Skeleton className="h-10 w-[200px] rounded-md" />
      </div>
    </div>
  );
}
