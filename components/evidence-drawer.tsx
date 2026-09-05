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
            Provenance for the relationships on this page: named CoinMarketCap
            endpoints and truncated response envelopes from this load. Secrets are
            never included.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-6">
          {evidence.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No CMC call evidence on this page load.
            </p>
          ) : (
            evidence.map((item, index) => (
              <section key={`${item.endpoint}-${index}`} className="border border-border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-[11px]">{item.endpoint}</p>
                  <Badge variant={item.ok ? "secondary" : "destructive"}>
                    {item.ok ? item.source : "error"}
                  </Badge>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  HTTP {item.httpStatus} · credits {item.creditCount ?? "—"} ·{" "}
                  {item.elapsedMs}ms · {item.fetchedAt}
                </p>
                {item.errorMessage ? (
                  <p className="mt-1 text-[11px] text-destructive">{item.errorMessage}</p>
                ) : null}
                <pre className="mt-2 max-h-64 overflow-auto bg-muted p-2 font-mono text-[11px] leading-relaxed">
                  {JSON.stringify(
                    {
                      query: item.query,
                      preview: item.responsePreview,
                    },
                    null,
                    2,
                  )}
                </pre>
              </section>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
