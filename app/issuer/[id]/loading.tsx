import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-3 px-3 py-4 sm:px-4">
      <Skeleton className="h-3 w-28" />
      <div className="border-b border-border pb-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-7 w-52" />
        <Skeleton className="mt-1.5 h-3 w-64" />
        <Skeleton className="mt-2 h-3 w-48" />
      </div>
      <div className="flex flex-col gap-1.5 pt-1">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    </div>
  );
}
