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
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Underlier Desk
      </p>
      <h1 className="text-xl font-semibold tracking-tight">This page failed to load</h1>
      <p className="text-sm text-muted-foreground">
        The desk could not finish this CoinMarketCap request. Retry, or go back
        to overview.
      </p>
      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground">Ref {error.digest}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button type="button" variant="outline" className="w-fit" onClick={() => reset()}>
          Retry
        </Button>
        <Link href="/" className="text-sm underline underline-offset-4">
          Back to overview
        </Link>
        <Link href="/issuers" className="text-sm underline underline-offset-4">
          Issuer directory
        </Link>
      </div>
    </div>
  );
}
