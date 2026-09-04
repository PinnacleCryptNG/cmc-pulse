import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col gap-3 px-4 py-16">
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        Underlier Desk
      </p>
      <h1 className="text-xl font-semibold tracking-tight">Not found</h1>
      <p className="text-sm text-muted-foreground">
        That underlier or issuer is not in the current CMC payload.
      </p>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <Link href="/" className="text-mark hover:underline">
          Back to overview
        </Link>
        <Link href="/issuers" className="text-mark hover:underline">
          Issuer directory
        </Link>
      </div>
    </div>
  );
}
