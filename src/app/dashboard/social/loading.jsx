"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function SocialSkeleton() {
  return (
    <div className="space-y-6 px-4 py-6">
      {/* DraggableButtonRow yerine geçecek skeletonlar */}
      <div className="space-y-4">
        {[...Array(3)].map((_, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 p-4 border rounded-md shadow-sm"
          >
            <Skeleton className="h-10 w-10 rounded-md" /> {/* icon yeri */}
            <Skeleton className="h-10 w-full rounded-md" /> {/* input */}
            <Skeleton className="h-10 w-10 rounded-md" /> {/* silme butonu */}
          </div>
        ))}
      </div>

      {/* Buton listesi (eklenebilir butonlar) */}
      <div className="flex flex-wrap items-center gap-2 mt-6">
        {[...Array(3)].map((_, idx) => (
          <Skeleton key={idx} className="h-10 w-[140px] rounded-md border" />
        ))}
      </div>

      {/* Kaydet butonu */}
      <div className="flex justify-center mt-6">
        <Skeleton className="h-10 w-[200px] rounded-md" />
      </div>
    </div>
  );
}
