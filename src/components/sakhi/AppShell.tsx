import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Mic,
  Users,
  ShieldCheck,
  FileText,
  CloudUpload,
  Sparkles,
  Menu,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { shg } from "@/data/demo";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/meeting", label: "Meeting Mode", icon: Mic },
  { to: "/members", label: "Members", icon: Users },
  { to: "/trust-passport", label: "Trust Passport", icon: ShieldCheck },
  { to: "/reports", label: "Reports", icon: FileText },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeOptions={{ exact: item.to === "/" }}
          activeProps={{
            className:
              "gradient-emerald text-primary-foreground shadow-glow hover:text-primary-foreground",
          }}
        >
          <item.icon className="size-[18px] shrink-0" />
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="gradient-royal grid size-10 shrink-0 place-items-center rounded-2xl shadow-glow">
        <Sparkles className="size-5 text-primary-foreground" />
      </div>
      <div className="min-w-0">
        <p className="font-display truncate text-lg font-semibold leading-none text-ink">
          SakhiSetu
        </p>
        <p className="truncate text-xs text-muted-foreground">सखी · भरोसा · बैंक</p>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col justify-between border-r border-sidebar-border bg-sidebar/80 p-5 backdrop-blur-xl lg:flex">
        <div className="space-y-8">
          <Brand />
          <NavList />
        </div>
        <div className="surface space-y-2 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <CloudUpload className="size-4 text-primary" />
            Offline-first
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Records are saved on the phone and sync when the village gets a signal.
          </p>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="gradient-emerald h-full w-[86%] rounded-full" />
          </div>
          <p className="text-[11px] text-muted-foreground">86% synced · 3 items queued</p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setOpen((v) => !v)}
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-card lg:hidden"
                aria-label="Toggle navigation"
              >
                <Menu className="size-5" />
              </button>
              <div className="min-w-0">
                <h1 className="font-display truncate text-xl font-semibold text-ink sm:text-2xl">
                  {title}
                </h1>
                <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="hidden items-center gap-2 rounded-full border border-primary/30 bg-primary-soft px-3 py-1.5 text-xs font-semibold text-accent-foreground sm:inline-flex">
                <span className="relative grid size-2 place-items-center">
                  <span className="pulse-ring absolute size-2 rounded-full bg-primary" />
                  <span className="size-2 rounded-full bg-primary" />
                </span>
                Synced 2 min ago
              </span>
              <div className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3">
                <span className="gradient-saffron grid size-8 place-items-center rounded-full text-xs font-bold text-saffron-foreground">
                  SP
                </span>
                <span className="hidden text-xs font-semibold text-ink sm:block">
                  {shg.leader}
                </span>
              </div>
            </div>
          </div>
          {open && (
            <div className="border-t border-border bg-card px-5 py-4 lg:hidden">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
          )}
        </header>

        <motion.main
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={cn("mx-auto max-w-[1400px] space-y-7 px-5 py-7 sm:px-8 sm:py-9")}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
