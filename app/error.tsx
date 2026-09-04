"use client";

export default function ErrorView({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col gap-3 px-4 py-16">
      <h1 className="text-xl font-semibold">This page failed to load</h1>
      <p className="text-sm text-muted-foreground">
        {error.message || "The CMC request did not complete."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="inline-flex h-8 w-fit items-center rounded-lg border px-3 text-sm hover:bg-muted"
      >
        Retry
      </button>
    </div>
  );
}
