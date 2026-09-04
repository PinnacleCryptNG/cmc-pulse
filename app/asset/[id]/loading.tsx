import { LoadingShell } from "@/components/desk-chrome";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <LoadingShell>
      <Skeleton className="h-3 w-48" />
      <div className="border-b border-border pb-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-7 w-40" />
        <Skeleton className="mt-1.5 h-3 w-64" />
        <div className="mt-3 grid grid-cols-2 divide-x divide-y divide-border border-y border-border md:grid-cols-4 md:divide-y-0">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-5 w-36" />
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    </LoadingShell>
  );
}
