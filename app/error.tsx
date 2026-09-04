"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ErrorView({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col gap-3 px-4 py-16">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Underlier Desk
      </p>
      <h1 className="text-[1.35rem] font-semibold tracking-tight">This page failed to load</h1>
      <p className="text-sm text-muted-foreground">
        The desk could not finish this CoinMarketCap request. Retry, or go back
        to the desk.
      </p>
      {error.digest ? (
        <p className="font-mono text-[11px] text-muted-foreground">Ref {error.digest}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => reset()}>
          Retry
        </Button>
        <Link href="/" className="text-[12px] text-mark hover:underline">
          Back to desk
        </Link>
        <Link href="/issuers" className="text-[12px] text-mark hover:underline">
          Issuer directory
        </Link>
      </div>
    </div>
  );
}
