"use client";

import { Skeleton } from "@/components/ui/skeleton";

const ProductsSkeleton = () => {
  return (
    <div className="space-y-6 px-4 py-6">
      {/* Kategori ve Buton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-[200px] rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[120px] rounded-md" />
        </div>
      </div>

      {/* DraggableProductRow yerine geçecek skeletonlar */}
      <div className="space-y-4">
        {[...Array(3)].map((_, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 p-4 border rounded-md shadow-sm"
          >
            <Skeleton className="h-16 w-16 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[60%]" />
              <Skeleton className="h-4 w-[80%]" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
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

export default ProductsSkeleton;
