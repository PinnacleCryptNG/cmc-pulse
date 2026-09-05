import type { ReactNode } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { isHttpsUrl } from "@/lib/safe-url";
import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border border-border bg-surface", className)}>{children}</div>
  );
}

export function PageHeader({
  kicker,
  title,
  description,
  action,
  id,
  className,
}: {
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {kicker}
        </p>
        <h1
          id={id}
          className="mt-0.5 text-[1.35rem] font-semibold tracking-tight text-foreground"
        >
          {title}
        </h1>
      </div>
      {(description || action) && (
        <div className="flex max-w-xl flex-col items-start gap-1 sm:items-end">
          {description ? (
            <p className="text-[11px] leading-relaxed text-muted-foreground sm:text-right">
              {description}
            </p>
          ) : null}
          {action}
        </div>
      )}
    </header>
  );
}

export function SectionHead({
  kicker,
  title,
  description,
  action,
  id,
  className,
}: {
  kicker: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 border-b border-border pb-2 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {kicker}
        </p>
        <h2
          id={id}
          className="text-[15px] font-semibold tracking-tight text-foreground"
        >
          {title}
        </h2>
      </div>
      {(description || action) && (
        <div className="flex max-w-xl flex-col items-start gap-1 sm:items-end">
          {description ? (
            <p className="text-[11px] leading-relaxed text-muted-foreground sm:text-right">
              {description}
            </p>
          ) : null}
          {action}
        </div>
      )}
    </div>
  );
}

export function QuoteBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 divide-x divide-y divide-border border border-border bg-surface md:grid-cols-4 md:divide-y-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function QuoteStat({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5 px-3 py-2.5", className)}>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-mono text-[15px] tabular-nums tracking-tight md:text-base">
        {children}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-border px-4 py-8 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{children}</div>
      {actions ? <div className="mt-3 flex justify-center gap-4 text-sm">{actions}</div> : null}
    </div>
  );
}

export function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-mark underline-offset-4 hover:underline",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function ActionLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-6 items-center border border-border px-2 text-[10px] tracking-[0.04em] text-muted-foreground hover:border-foreground/25 hover:text-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Pager({
  prevHref,
  nextHref,
  className,
}: {
  prevHref?: string | null;
  nextHref?: string | null;
  className?: string;
}) {
  if (!prevHref && !nextHref) return null;
  return (
    <div className={cn("flex items-center justify-between gap-2 text-[11px]", className)}>
      {prevHref ? (
        <Link
          href={prevHref}
          className="inline-flex h-7 items-center border border-border px-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Previous
        </Link>
      ) : (
        <span />
      )}
      {nextHref ? (
        <Link
          href={nextHref}
          className="inline-flex h-7 items-center border border-border px-2.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Next
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}

export function IdentityRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-2 text-[13px] sm:grid-cols-[9.5rem_1fr]">
      <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-foreground">{value}</dd>
    </div>
  );
}

export function DeskLogo({
  src,
  name,
  size = "md",
}: {
  src: string | null | undefined;
  name: string;
  size?: "sm" | "md";
}) {
  if (!isHttpsUrl(src)) return null;
  const dim = size === "sm" ? "size-6" : "size-9";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      title={name}
      width={size === "sm" ? 24 : 36}
      height={size === "sm" ? 24 : 36}
      className={`${dim} shrink-0 rounded-sm border border-border bg-background object-contain p-0.5`}
    />
  );
}

export function StatusFlag({ active }: { active: boolean | null }) {
  if (active === true) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-up">
        <span className="size-1.5 bg-up" aria-hidden />
        Active
      </span>
    );
  }
  if (active === false) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="size-1.5 bg-muted-foreground/50" aria-hidden />
        Inactive
      </span>
    );
  }
  return <span className="text-muted-foreground">—</span>;
}

export function LoadingShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-[88rem] items-center justify-between px-3 py-2 sm:px-4">
          <Skeleton className="h-3.5 w-36" />
          <div className="hidden gap-3 sm:flex">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-[88rem] flex-1 flex-col gap-4 px-3 py-4 sm:px-4">
        {children}
      </div>
    </div>
  );
}
