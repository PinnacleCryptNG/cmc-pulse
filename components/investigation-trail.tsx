import type { AssetDesk } from "@/lib/cmc/types";
import { cn } from "@/lib/utils";

type Props = { desk: AssetDesk };

export function InvestigationTrail({ desk }: Props) {
  const underlier = desk.info?.name ?? `RWA ${desk.info?.rwaId ?? ""}`;
  const issuers = Array.from(
    new Set(desk.tokens.map((token) => token.issuerName).filter(Boolean)),
  ) as string[];
  const tokenCount = desk.tokens.length;
  const market = desk.info?.primaryExchange ?? "CMC-reported market";

  const steps = [
    { label: "UNDERLIER", value: underlier, detail: desk.info?.symbol ?? "Asset identity" },
    { label: "ISSUER", value: issuers.length ? issuers.join(" · ") : "Relationship not returned", detail: issuers.length ? `${issuers.length} issuer${issuers.length === 1 ? "" : "s"}` : "CMC data gap" },
    { label: "TOKEN", value: tokenCount ? `${tokenCount} tokenized representation${tokenCount === 1 ? "" : "s"}` : "No token returned", detail: tokenCount ? desk.tokens.slice(0, 3).map((t) => t.symbol).join(" · ") : "Not available" },
    { label: "MARKET", value: market, detail: "CMC-reported" },
  ];

  return (
    <section className="mb-6 border-y border-border py-4" aria-label="Investigation relationship">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Investigation path</p>
          <p className="mt-1 text-xs text-muted-foreground">Relationships shown only where CMC returned supporting metadata.</p>
        </div>
        {desk.warning ? <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Partial evidence</span> : null}
      </div>
      <div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.label} className="relative bg-surface px-4 py-3">
            <div className="flex items-center gap-2">
              <span className={cn("h-1.5 w-1.5 rounded-full", index === 0 || (index === 2 && tokenCount) || (index === 1 && issuers.length) ? "bg-up" : "bg-muted-foreground/40")} />
              <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">{step.label}</span>
            </div>
            <p className="mt-2 truncate text-sm font-medium text-foreground" title={step.value}>{step.value}</p>
            <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground" title={step.detail}>{step.detail}</p>
            {index < steps.length - 1 ? <span className="pointer-events-none absolute -right-1 top-1/2 z-10 hidden h-2 w-2 -translate-y-1/2 rotate-45 border-r border-t border-border bg-surface md:block" /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
