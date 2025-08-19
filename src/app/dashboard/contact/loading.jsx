import { Skeleton } from "@/components/ui/skeleton";

const ContactPageSkeleton = () => {
  return (
    <div className="overflow-hidden mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        {/* 4 adet input skeleton */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col gap-4  p-4 rounded-md">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <Skeleton className="h-10 w-[200px] rounded-md" />
      </div>
    </div>
  );
};

export default ContactPageSkeleton;
