import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-3 px-3 py-4 sm:px-4">
      <Skeleton className="h-2.5 w-28" />
      <Skeleton className="h-7 w-48" />
      <div className="flex flex-col gap-1.5 pt-2">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    </div>
  );
}
