"use client";

import { Button } from "@/components/ui/button";

export default function ErrorView({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col gap-3 px-4 py-16">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Desk
      </p>
      <h1 className="text-xl font-semibold tracking-tight">This page failed to load</h1>
      <p className="text-sm text-muted-foreground">
        {error.message || "The CoinMarketCap request did not complete."}
      </p>
      <Button type="button" variant="outline" className="w-fit" onClick={() => reset()}>
        Retry
      </Button>
    </div>
  );
}
