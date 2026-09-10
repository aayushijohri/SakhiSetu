import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import { Search, Users, Download, TrendingUp, CalendarCheck, Flame } from "lucide-react";
import { AppShell } from "@/components/sakhi/AppShell";
import { EmptyState, Pill, SectionCard } from "@/components/sakhi/Bits";
import { ProgressRing } from "@/components/sakhi/ProgressRing";
import { inr, members as defaultMembers } from "@/data/demo";
import type { Member } from "@/types";
import { dbLocal, initialSHG } from "@/lib/dexie";
import { generateBankDossierPDF } from "@/lib/pdfGenerator";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "Members & Digital Passbooks — SakhiSetu" },
      {
        name: "description",
        content:
          "Every SHG member's savings balance, loan status, repayment progress, attendance and contribution history in one digital passbook.",
      },
      { property: "og:title", content: "Digital Passbooks for every SHG member" },
      {
        property: "og:description",
        content: "Savings, loans, repayment progress and attendance per member.",
      },
    ],
  }),
  component: MembersPage,
});

const statusTone = {
  current: "primary",
  watch: "coral",
  cleared: "indigo",
} as const;

const statusLabel = {
  current: "On track",
  watch: "Needs follow-up",
  cleared: "No active loan",
} as const;

function MemberCard({ m, index }: { m: Member; index: number }) {
  const progress = m.loan ? Math.round((m.loanPaid / m.loan) * 100) : 100;
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="surface p-5"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="gradient-royal grid size-11 shrink-0 place-items-center rounded-2xl text-sm font-bold text-primary-foreground">
            {m.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{m.name}</p>
            <p className="truncate text-xs text-muted-foreground">{m.role}</p>
          </div>
        </div>
        <Pill tone={statusTone[m.status]}>{statusLabel[m.status]}</Pill>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Savings balance
            </p>
            <p className="font-display text-2xl font-semibold text-ink">{inr(m.savings)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill tone="saffron">
              <CalendarCheck className="size-3.5" /> {m.attendance}% present
            </Pill>
            <Pill tone="coral">
              <Flame className="size-3.5" /> {m.streak} week streak
            </Pill>
          </div>
        </div>
        <ProgressRing
          value={progress}
          size={86}
          thickness={8}
          gradientId={`ring-${m.id}`}
          label={`${progress}%`}
          sublabel="repaid"
        />
      </div>

      <div className="mt-5 space-y-2 rounded-2xl bg-muted/50 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{m.loan ? `Loan ${inr(m.loan)}` : "No loan running"}</span>
          <span>{m.loan ? `${inr(m.loan - m.loanPaid)} left` : "Eligible for ₹15,000"}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-card">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="gradient-emerald h-full rounded-full"
          />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Last 4 contributions
        </p>
        <div className="mt-2 flex items-end gap-2">
          {m.contributions
            .slice()
            .reverse()
            .map((c) => (
              <div key={c.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 4 }}
                  animate={{ height: Math.max(6, (c.amount / 600) * 48) }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className={
                    c.amount === 0
                      ? "w-full rounded-t-lg bg-muted"
                      : "gradient-indigo w-full rounded-t-lg"
                  }
                />
                <span className="truncate text-[10px] text-muted-foreground">{c.label}</span>
              </div>
            ))}
        </div>
      </div>
    </motion.article>
  );
}

function MembersPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Member["status"]>("all");

  const liveMembers = useLiveQuery(() => dbLocal.members.toArray(), []);
  const membersList: Member[] = (liveMembers && liveMembers.length > 0) ? liveMembers : (defaultMembers as unknown as Member[]);

  const list = membersList.filter(
    (m) =>
      (filter === "all" || m.status === filter) &&
      m.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const totalSavings = membersList.reduce((s, m) => s + m.savings, 0);
  const totalLoans = membersList.reduce((s, m) => s + (m.loan - m.loanPaid), 0);

  const exportAllPassbooks = async () => {
    try {
      const { pdfUrl } = await generateBankDossierPDF(initialSHG, membersList);
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `SakhiSetu_Passbooks_${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      toast.success("Passbooks exported to PDF", { description: `${membersList.length} member passbooks generated.` });
    } catch (e) {
      toast.error("Export error, downloading summary PDF...");
    }
  };

  return (
    <AppShell title="Members & Digital Passbooks" subtitle={`${membersList.length} members · every rupee traceable to a name`}>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Group savings", value: inr(totalSavings), icon: TrendingUp, cls: "gradient-emerald text-primary-foreground" },
          { label: "Loan outstanding", value: inr(totalLoans), icon: Users, cls: "gradient-indigo text-indigo-foreground" },
          { label: "Average attendance", value: "91%", icon: CalendarCheck, cls: "gradient-saffron text-saffron-foreground" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`flex items-center gap-4 rounded-3xl p-5 shadow-glow ${s.cls}`}
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/20">
              <s.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-85">{s.label}</p>
              <p className="font-display text-2xl font-semibold">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <SectionCard
        title="Passbooks"
        action={
          <button
            onClick={exportAllPassbooks}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-accent cursor-pointer"
          >
            <Download className="size-4" /> Export all
          </button>
        }
      >
        <div className="grid gap-3 pb-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <label className="flex min-w-0 items-center gap-2 rounded-2xl border border-border bg-muted/40 px-4 py-2.5">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a member by name…"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
            />
          </label>
          <div className="flex shrink-0 flex-wrap gap-2">
            {(["all", "current", "watch", "cleared"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  filter === f
                    ? "gradient-emerald rounded-full px-3.5 py-2 text-[11px] font-semibold text-primary-foreground shadow-glow cursor-pointer"
                    : "rounded-full border border-border bg-card px-3.5 py-2 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent cursor-pointer"
                }
              >
                {f === "all" ? "Everyone" : statusLabel[f]}
              </button>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No member matches that search"
            description="Try a different name or clear the filters to see the whole group."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {list.map((m, i) => (
              <MemberCard key={m.id} m={m} index={i} />
            ))}
          </div>
        )}
      </SectionCard>
    </AppShell>
  );
}

