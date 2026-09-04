import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-border/80">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-56" />
          </div>
          <div className="hidden gap-2 sm:flex">
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-5">
        <div>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-6 w-32" />
          <div className="mt-4 grid grid-cols-2 gap-4 border-y border-border/80 py-3 md:grid-cols-4">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="col-span-2 h-10 w-full" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-8 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-7 w-16" />
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
