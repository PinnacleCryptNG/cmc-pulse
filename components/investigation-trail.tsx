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
    { label: "FIND", value: underlier, detail: desk.info?.symbol ?? "Asset identity", resolved: Boolean(desk.info) },
    { label: "RESOLVE", value: issuers.length ? issuers.join(" · ") : "Relationship not returned", detail: issuers.length ? `${issuers.length} issuer${issuers.length === 1 ? "" : "s"}` : "CMC data gap", resolved: issuers.length > 0 },
    { label: "TRACE", value: tokenCount ? `${tokenCount} tokenized representation${tokenCount === 1 ? "" : "s"}` : "No token returned", detail: tokenCount ? desk.tokens.slice(0, 3).map((token) => token.symbol).join(" · ") : "Not available", resolved: tokenCount > 0 },
    { label: "VERIFY", value: market, detail: "CMC-reported", resolved: Boolean(desk.info?.primaryExchange) },
  ];

  return (
    <section className="mb-5 border-y border-border py-3" aria-label="Investigation path">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-mark shadow-[0_0_0_3px_hsl(var(--mark)/0.08)]" aria-hidden />
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Investigation path</p>
        </div>
        <span className={cn("font-mono text-[10px] uppercase tracking-[0.14em]", desk.warning ? "text-muted-foreground" : "text-up")}>
          {desk.warning ? "Partial evidence" : "Path resolved"}
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-stretch">
        {steps.map((step, index) => (
          <div key={step.label} className="flex min-w-0 flex-1 items-stretch">
            <div className="relative min-w-0 flex-1 border border-border bg-surface px-3 py-2.5 transition-colors hover:bg-surface/70">
              <div className="flex items-center gap-2">
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", step.resolved ? "bg-up" : "bg-muted-foreground/40")} aria-hidden />
                <span className={cn("font-mono text-[10px] font-semibold tracking-[0.18em]", step.resolved ? "text-foreground" : "text-muted-foreground")}>
                  {step.label}
                </span>
              </div>
              <p className="mt-1.5 truncate text-[12.5px] font-medium" title={step.value}>{step.value}</p>
              <p className="mt-0.5 truncate font-mono text-[9.5px] text-muted-foreground" title={step.detail}>{step.detail}</p>
            </div>
            {index < steps.length - 1 ? (
              <div className="flex w-5 shrink-0 items-center justify-center" aria-hidden>
                <span className="h-px w-full bg-border" />
                <span className="absolute border-b border-r border-muted-foreground/50 p-1 rotate-[-45deg]" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
