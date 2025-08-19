"use client";

import { Skeleton } from "@/components/ui/skeleton";

const GallerySkeleton = () => {
  return (
    <div className="space-y-6 px-4 py-6">
      {/* Başlık ve Buton */}
      <div className="flex justify-center items-center mt-4">
        <Skeleton className="h-6 w-48 rounded-md" />
      </div>

      {/* Shimmer effect için skeletonlar */}
      <div className="space-y-4">
        {[...Array(3)].map((_, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center gap-4 p-4 border rounded-md  shadow-sm"
          >
            {/* Görsel alanı */}
            <div className="w-32 h-32 relative rounded border group overflow-hidden shrink-0">
              <Skeleton className="w-full h-full rounded-md" />
            </div>

            {/* Aktif/Pasif Toggle */}
            <div className="flex items-center gap-4 mt-2 px-1 self-end">
              <Skeleton className="h-6 w-12 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Kaydet Butonu */}
      <div className="flex justify-center mt-6">
        <Skeleton className="h-10 w-[200px] rounded-md" />
      </div>
    </div>
  );
};

export default GallerySkeleton;
