import { Search } from "lucide-react";

const EXAMPLES = ["NVDA", "GOLD", "TLT", "SPCX"] as const;

export function DeskIntro() {
  return (
    <section className="border-b border-border pb-5" aria-labelledby="desk-title">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,34rem)] lg:items-end">
        <div className="min-w-0">
          <p className="mb-2 font-mono text-[10px] font-medium tracking-[0.18em] text-up uppercase">
            Underlier Desk
          </p>
          <h1
            id="desk-title"
            className="max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-foreground sm:text-4xl"
          >
            Find the real asset behind tokenized assets.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Trace tokenized stocks, treasuries, commodities and ETFs back to the underlying asset,
            issuer and market.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
            <span>Underlier</span>
            <span aria-hidden>→</span>
            <span>Issuer</span>
            <span aria-hidden>→</span>
            <span>Token</span>
            <span aria-hidden>→</span>
            <span>Market</span>
          </div>
        </div>

        <form action="/" method="get" className="min-w-0">
          <label htmlFor="desk-search" className="sr-only">
            Search an asset, ticker or RWA ID
          </label>
          <div className="flex h-11 items-center border border-border bg-surface px-3 focus-within:border-foreground/50">
            <Search className="mr-2.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              id="desk-search"
              name="q"
              placeholder="Search an asset, ticker or RWA ID"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="off"
            />
            <kbd className="hidden border border-border px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground sm:block">
              ENTER
            </kbd>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-muted-foreground">
            <span className="font-medium uppercase tracking-[0.14em]">Try</span>
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="submit"
                name="q"
                value={example}
                className="font-mono text-foreground/75 hover:text-foreground"
              >
                {example}
              </button>
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}
