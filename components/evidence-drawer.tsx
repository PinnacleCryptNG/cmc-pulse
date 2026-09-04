import type { CallEvidence } from "@/lib/cmc/types";
import { Badge } from "@/components/ui/badge";
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
      <SheetTrigger className="inline-flex h-7 items-center rounded-lg border border-border px-2.5 text-sm hover:bg-muted">
        CMC calls ({evidence.length})
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>CMC call evidence</SheetTitle>
          <SheetDescription>
            Named endpoints and the response envelope from this page load. Secrets are
            never included.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-6">
          {evidence.map((item, index) => (
            <section key={`${item.endpoint}-${index}`} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-xs">{item.endpoint}</p>
                <Badge variant={item.ok ? "secondary" : "destructive"}>
                  {item.ok ? item.source : "error"}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                HTTP {item.httpStatus} · credits {item.creditCount ?? "—"} ·{" "}
                {item.elapsedMs}ms · {item.fetchedAt}
              </p>
              {item.errorMessage ? (
                <p className="mt-1 text-xs text-destructive">{item.errorMessage}</p>
              ) : null}
              <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-muted p-2 text-[11px] leading-relaxed">
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
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
