import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-border">
        <div className="h-px bg-mark" />
        <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between px-3 py-1.5 sm:px-4">
          <Skeleton className="h-3.5 w-36" />
          <div className="hidden gap-3 sm:flex">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-4 px-3 py-4 sm:px-4">
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
      </div>
    </div>
  );
}
