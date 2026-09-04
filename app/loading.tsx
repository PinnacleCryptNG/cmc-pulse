import { LoadingShell } from "@/components/desk-chrome";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <LoadingShell>
      <div className="grid grid-cols-1 gap-3 border-b border-border pb-3 lg:grid-cols-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-full" />
      </div>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-7 w-52" />
      <Skeleton className="h-10 w-full" />
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    </LoadingShell>
  );
}
