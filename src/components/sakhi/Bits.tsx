import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface p-5 sm:p-6", className)}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pb-4">
        <h2 className="font-display truncate text-base font-semibold text-ink sm:text-lg">
          {title}
        </h2>
        {action ? <div className="shrink-0">{action}</div> : <span />}
      </div>
      {children}
    </section>
  );
}

export function Pill({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "primary" | "indigo" | "saffron" | "coral";
}) {
  const map = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary-soft text-accent-foreground",
    indigo: "bg-indigo/12 text-indigo",
    saffron: "bg-saffron/20 text-saffron-foreground",
    coral: "bg-coral/15 text-coral",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        map[tone],
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center">
      <span className="gradient-emerald grid size-12 place-items-center rounded-2xl text-primary-foreground shadow-glow">
        <Icon className="size-5" />
      </span>
      <p className="font-display mt-4 text-base font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SkeletonRow({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="shimmer h-12 rounded-2xl bg-muted"
          style={{ width: `${100 - i * 8}%` }}
        />
      ))}
    </div>
  );
}
