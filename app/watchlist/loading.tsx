import { LoadingShell } from "@/components/desk-chrome";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <LoadingShell>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-7 w-40" />
      <Skeleton className="h-3 w-72" />
      <div className="flex flex-col gap-1.5 pt-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-9 w-full" />
        ))}
      </div>
    </LoadingShell>
  );
}
