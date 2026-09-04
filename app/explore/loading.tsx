import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-3 px-3 py-4 sm:px-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-80" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Skeleton className="h-12 w-28" />
        <Skeleton className="h-12 w-28" />
        <Skeleton className="h-12 w-40" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
