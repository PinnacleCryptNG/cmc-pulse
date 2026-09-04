import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-border">
        <div className="h-px bg-mark" />
        <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between px-3 py-2 sm:px-4">
          <Skeleton className="h-3.5 w-36" />
          <div className="hidden gap-3 sm:flex">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-6 px-3 py-4 sm:px-4">
        <div>
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="mt-2 h-6 w-32" />
          <div className="mt-3 grid grid-cols-2 border-y border-border md:grid-cols-4">
            <Skeleton className="m-3 h-8 w-24" />
            <Skeleton className="m-3 h-8 w-24" />
            <Skeleton className="m-3 h-8 w-24" />
            <Skeleton className="m-3 h-8 w-24" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
