import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col gap-3 px-4 py-16">
      <h1 className="text-xl font-semibold">Not found</h1>
      <p className="text-sm text-muted-foreground">
        That underlier or issuer is not in the current CMC payload.
      </p>
      <Link href="/" className="underline">
        Back to the screener
      </Link>
    </div>
  );
}
