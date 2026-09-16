import Link from "next/link";
import { Search } from "lucide-react";

const EXAMPLES = ["NVDA", "TLT", "GOLD", "SPCX"] as const;

const USE_CASES = [
  {
    label: "TOKENIZED STOCKS",
    title: "Trace public-company exposure",
    body: "See which tokenized representations point back to the underlying stock.",
  },
  {
    label: "TREASURIES & ETFs",
    title: "Resolve the security underneath",
    body: "Follow tokenized exposure to the real-world security and its issuer.",
  },
  {
    label: "COMMODITIES",
    title: "Identify the underlying asset",
    body: "Separate the real commodity from the tokenized representation trading around it.",
  },
] as const;

const STEPS = [
  ["01", "FIND", "Search by ticker, slug or RWA ID."],
  ["02", "RESOLVE", "Identify the underlying real-world asset."],
  ["03", "TRACE", "Follow issuers and tokenized representations."],
  ["04", "VERIFY", "Compare market data and supporting evidence."],
] as const;

export default function HomePage() {
  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="CMC Pulse home">
            <DeskMark />
            <span className="leading-none">
              <span className="block text-[13px] font-semibold uppercase tracking-[0.16em]">CMC Pulse</span>
              <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Underlier Desk</span>
            </span>
          </Link>
          <Link
            href="/explore"
            className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          >
            Explore desk →
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto w-full max-w-[88rem] px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:pb-20">
          <div className="max-w-4xl">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-up">RWA intelligence</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl">
              Understand what&apos;s actually behind tokenized assets.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              CMC Pulse helps you trace tokenized stocks, treasuries, commodities and ETFs back to the underlying asset, issuer and market.
            </p>
          </div>

          <form action="/explore" method="get" className="mt-9 max-w-3xl">
            <label htmlFor="start-search" className="sr-only">Search ticker, slug or RWA ID</label>
            <div className="flex h-14 items-center border border-border bg-surface px-4 transition-colors focus-within:border-foreground/50">
              <Search className="mr-3 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <input
                id="start-search"
                name="q"
                placeholder="Search ticker, slug or RWA ID"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground sm:text-base"
                autoComplete="off"
              />
              <kbd className="hidden border border-border px-2 py-1 font-mono text-[9px] text-muted-foreground sm:block">ENTER</kbd>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <span>Try</span>
              {EXAMPLES.map((example) => (
                <button key={example} type="submit" name="q" value={example} className="text-foreground/80 hover:text-foreground">
                  {example}
                </button>
              ))}
            </div>
          </form>
        </section>

        <section className="border-y border-border">
          <div className="mx-auto grid w-full max-w-[88rem] md:grid-cols-3">
            {USE_CASES.map((item, index) => (
              <div key={item.label} className="border-b border-border px-4 py-7 last:border-b-0 md:border-b-0 md:border-r md:px-6 md:last:border-r-0">
                <p className="font-mono text-[9px] font-semibold tracking-[0.16em] text-muted-foreground">{item.label}</p>
                <h2 className="mt-3 text-base font-semibold tracking-[-0.015em]">{item.title}</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{item.body}</p>
                <span className="mt-5 block font-mono text-[9px] text-muted-foreground/60">0{index + 1}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[88rem] px-4 py-14 sm:px-6 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-20">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-up">The workflow</p>
              <h2 className="mt-3 max-w-md text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">From a ticker to an auditable asset trail.</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">Start with the asset you know. CMC Pulse resolves the relationships that help you understand the tokenized exposure.</p>
            </div>
            <div className="grid border-y border-border sm:grid-cols-2">
              {STEPS.map(([number, label, body]) => (
                <div key={number} className="border-b border-border px-0 py-5 last:border-b-0 sm:px-5 sm:nth-[2n]:border-l sm:nth-[n+3]:border-b-0 sm:nth-[n+3]:border-t">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-mono text-[9px] text-muted-foreground">{number}</span>
                    <span className="font-mono text-[10px] font-semibold tracking-[0.16em]">{label}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Ready to investigate?</p>
              <p className="mt-1 text-sm text-foreground">Open the market desk and resolve an asset.</p>
            </div>
            <Link href="/explore" className="inline-flex h-10 items-center justify-center border border-border px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] hover:border-foreground/50">
              Explore the desk →
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-1 px-4 py-5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>CMC Pulse · Underlier Desk</span>
          <span>Real-world asset intelligence powered by CoinMarketCap data</span>
        </div>
      </footer>
    </div>
  );
}

function DeskMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="shrink-0 text-foreground">
      <path fill="currentColor" fillOpacity="0.92" d="M2 3.2h6.5v2.1H2zM9.5 3.2H16v2.1H9.5zM2 7.95h4.2v2.1H2zM7.2 7.95H16v2.1H7.2zM2 12.7h8.5v2.1H2zM12.5 12.7H16v2.1h-3.5z" />
    </svg>
  );
}
