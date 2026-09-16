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
    {
      label: "UNDERLIER",
      value: underlier,
      detail: desk.info?.symbol ?? "Asset identity",
      resolved: Boolean(desk.info),
    },
    {
      label: "ISSUER",
      value: issuers.length ? issuers.join(" · ") : "Relationship not returned",
      detail: issuers.length
        ? `${issuers.length} issuer${issuers.length === 1 ? "" : "s"}`
        : "CMC data gap",
      resolved: issuers.length > 0,
    },
    {
      label: "TOKEN",
      value: tokenCount
        ? `${tokenCount} tokenized representation${tokenCount === 1 ? "" : "s"}`
        : "No token returned",
      detail: tokenCount
        ? desk.tokens.slice(0, 3).map((token) => token.symbol).join(" · ")
        : "Not available",
      resolved: tokenCount > 0,
    },
    {
      label: "MARKET",
      value: market,
      detail: "CMC-reported",
      resolved: Boolean(desk.info?.primaryExchange),
    },
  ];

  return (
    <section className="mb-5 border-y border-border py-3.5" aria-label="Investigation relationship">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Investigation path
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Resolve the underlier before comparing its tokenized representations.
          </p>
        </div>
        <span
          className={cn(
            "font-mono text-[10px] uppercase tracking-[0.12em]",
            desk.warning ? "text-muted-foreground" : "text-up",
          )}
        >
          {desk.warning ? "Partial evidence" : "Resolved path"}
        </span>
      </div>

      <div className="grid gap-px overflow-hidden border border-border bg-border md:grid-cols-4">
        {steps.map((step, index) => (
          <div key={step.label} className="relative min-w-0 bg-surface px-3.5 py-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  step.resolved ? "bg-up" : "bg-muted-foreground/40",
                )}
                aria-hidden
              />
              <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">
                {step.label}
              </span>
            </div>
            <p
              className="mt-2 truncate text-[13px] font-medium text-foreground"
              title={step.value}
            >
              {step.value}
            </p>
            <p
              className="mt-1 truncate font-mono text-[10px] text-muted-foreground"
              title={step.detail}
            >
              {step.detail}
            </p>
            {index < steps.length - 1 ? (
              <span
                className="pointer-events-none absolute -right-1 top-1/2 z-10 hidden h-2 w-2 -translate-y-1/2 rotate-45 border-r border-t border-border bg-surface md:block"
                aria-hidden
              />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
