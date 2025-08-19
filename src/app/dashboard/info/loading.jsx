"use client";

import { Skeleton } from "@/components/ui/skeleton";

const InfoPageSkeleton = () => {
  return (
    <div className="space-y-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="border p-4 rounded-lg ">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Görsel Placeholder */}
            <Skeleton className="w-32 h-32 rounded-md shrink-0" />

            {/* Bilgi Alanları */}
            <div className="flex flex-col flex-1 gap-4">
              <Skeleton className="h-10 w-full rounded-md" />

              <Skeleton className="h-16 w-full rounded-md" />

              <div className="flex items-center gap-4 mt-2 self-end">
                <Skeleton className="h-6 w-11 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="flex justify-center mt-6">
        <Skeleton className="h-10 w-[200px] rounded-md" />
      </div>
    </div>
  );
};

export default InfoPageSkeleton;
