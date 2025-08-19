import { Skeleton } from "@/components/ui/skeleton";

const HoursSkeleton = () => {
  return (
    <div className="space-y-6 p-4">
      {/* Header Skeleton */}
      <div className="text-center">
        <Skeleton className="h-7 w-40 mx-auto" />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="p-4 rounded-lg shadow-sm space-y-3  animate-pulse"
          >
            {/* Day Label */}
            <Skeleton className="h-6 w-20 mx-auto" />

            {/* Switch Section */}
            <div className="flex items-center gap-4 mt-2 px-1 justify-center">
              <Skeleton className="w-12 h-6 rounded-full" />
            </div>

            {/* Time Inputs */}
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button Skeleton */}
      <div className="text-center">
        <Skeleton className="h-10 w-48 mx-auto" />
      </div>
    </div>
  );
};

export default HoursSkeleton;
