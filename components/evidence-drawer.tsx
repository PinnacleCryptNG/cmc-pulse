"use client";

import { FileText } from "lucide-react";
import type { CallEvidence } from "@/lib/cmc/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function EvidenceDrawer({ evidence }: { evidence: CallEvidence[] }) {
  const successful = evidence.filter((item) => item.ok).length;
  const failed = evidence.length - successful;
  const live = evidence.filter((item) => item.ok && item.source === "live").length;

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-1.5 font-normal text-[11px] tracking-[0.04em] text-muted-foreground hover:text-foreground"
          />
        }
      >
        <FileText className="size-3.5" aria-hidden />
        Data & Evidence
        <span className="ml-1 font-mono text-[10px] tabular-nums text-muted-foreground">
          {evidence.length}
        </span>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Data & Evidence</SheetTitle>
          <SheetDescription>
            Audit trail for this page load. Each record identifies the CoinMarketCap
            endpoint used, request outcome, timing, credit count and a redacted response preview.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-6">
          {evidence.length === 0 ? (
            <p className="border border-border p-3 text-sm text-muted-foreground">
              No CMC call evidence on this page load.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 divide-x divide-border border border-border bg-surface">
                <EvidenceMetric label="Calls" value={evidence.length} />
                <EvidenceMetric label="Live" value={live} />
                <EvidenceMetric label="Errors" value={failed} />
              </div>

              <div className="flex flex-col gap-2">
                {evidence.map((item, index) => (
                  <details key={`${item.endpoint}-${index}`} className="group border border-border bg-surface">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 marker:hidden">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-[11px]">{item.endpoint}</p>
                        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                          {item.elapsedMs}ms · {item.fetchedAt}
                        </p>
                      </div>
                      <Badge variant={item.ok ? "secondary" : "destructive"}>
                        {item.ok ? item.source : `HTTP ${item.httpStatus}`}
                      </Badge>
                    </summary>

                    <div className="border-t border-border px-3 pb-3 pt-2.5">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] text-muted-foreground">
                        <span>method {item.method}</span>
                        <span>status {item.httpStatus}</span>
                        <span>credits {item.creditCount ?? "—"}</span>
                        <span>source {item.source}</span>
                      </div>
                      {item.errorMessage ? (
                        <p className="mt-2 border-l-2 border-destructive pl-2 text-[11px] text-destructive">
                          {item.errorMessage}
                        </p>
                      ) : null}
                      <pre className="mt-2 max-h-64 overflow-auto bg-muted p-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
                        {JSON.stringify(
                          { query: item.query, preview: item.responsePreview },
                          null,
                          2,
                        )}
                      </pre>
                    </div>
                  </details>
                ))}
              </div>

              <p className="text-[10px] leading-relaxed text-muted-foreground">
                Response previews are intentionally truncated. API secrets and secret-looking
                query parameters are excluded from evidence.
              </p>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EvidenceMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-3 py-2">
      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-sm tabular-nums">{value}</p>
    </div>
  );
}
