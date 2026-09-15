export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[88rem] flex-1 flex-col gap-5 px-3 py-5 sm:px-5" aria-busy="true" aria-label="Resolving Underlier Desk">
      <section className="border-b border-border pb-5">
        <p className="font-mono text-[10px] tracking-[0.18em] text-up uppercase">Underlier Desk</p>
        <div className="mt-3 h-10 w-full max-w-2xl animate-pulse bg-muted" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse bg-muted" />
        <div className="mt-2 h-4 w-3/4 max-w-lg animate-pulse bg-muted" />
        <div className="mt-4 h-3 w-64 animate-pulse bg-muted" />
      </section>

      <section className="border border-border bg-surface p-3">
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
          <span className="inline-block size-1.5 animate-pulse bg-up" />
          Resolving market universe
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-14 animate-pulse bg-muted" />
          ))}
        </div>
      </section>

      <div className="space-y-1.5">
        <div className="h-8 animate-pulse bg-muted" />
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="h-10 animate-pulse bg-muted" />
        ))}
      </div>
    </div>
  );
}
