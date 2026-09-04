import type { ReactNode } from "react";
import { hostLabel, safeHttpsUrl } from "@/lib/safe-url";

export function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children?: ReactNode;
  className?: string;
}) {
  const safe = safeHttpsUrl(href);
  if (!safe) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <a
      className={className}
      href={safe}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children ?? hostLabel(safe)}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
