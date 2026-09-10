import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  PiggyBank,
  HandCoins,
  Users,
  CalendarCheck,
  Mic,
  ShieldCheck,
  CloudUpload,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import heroArt from "@/assets/shg-hero.jpg";
import { AppShell } from "@/components/sakhi/AppShell";
import { StatCard } from "@/components/sakhi/StatCard";
import { ProgressRing } from "@/components/sakhi/ProgressRing";
import { Pill, SectionCard } from "@/components/sakhi/Bits";
import { activity as defaultActivity, inr, repaymentSeries, savingsSeries, shg } from "@/data/demo";
import { dbLocal } from "@/lib/dexie";
import { useSync } from "@/hooks/useSync";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SakhiSetu Dashboard — SHG savings, loans & trust at a glance" },
      {
        name: "description",
        content:
          "Live overview of a women's self help group: total savings, active loans, attendance, sync status and recent voice-recorded activity.",
      },
      { property: "og:title", content: "SakhiSetu Dashboard" },
      {
        property: "og:description",
        content: "Savings, loans, attendance and trust score for a rural women's SHG.",
      },
    ],
  }),
  component: Dashboard,
});

const toneDot = {
  primary: "bg-primary",
  indigo: "bg-indigo",
  saffron: "bg-saffron",
  coral: "bg-coral",
} as const;

function Dashboard() {
  const { isOnline, pendingCount, isSyncing, lastSynced, triggerSync } = useSync();

  const membersList = useLiveQuery(() => dbLocal.members.toArray(), []);
  const transactionsList = useLiveQuery(() => dbLocal.transactions.toArray(), []);
  const shgData = useLiveQuery(() => dbLocal.shgs.get("shg_001"), []);
  const passportData = useLiveQuery(() => dbLocal.trustPassports.get("shg_001"), []);

  const totalSavings = membersList && membersList.length > 0
    ? membersList.reduce((acc, m) => acc + m.savings, 0)
    : 148500;

  const activeLoansTotal = membersList && membersList.length > 0
    ? membersList.reduce((acc, m) => acc + (m.loan - m.loanPaid), 0)
    : 32800;

  const activeLoansCount = membersList && membersList.length > 0
    ? membersList.filter((m) => m.loan > m.loanPaid).length
    : 5;

  const memberCount = membersList ? membersList.length : 15;
  const trustScore = passportData ? passportData.score : 768;

  // Build live activity timeline from saved transactions + defaults
  const liveActivity = [
    ...(transactionsList || []).slice(-3).reverse().map((t) => ({
      id: t.id,
      title: `${t.type} recorded for ${t.memberName}`,
      detail: `${t.memberName} · ${inr(t.amount)} · ${t.synced ? "Synced to cloud" : "Stored on device"}`,
      time: new Date(t.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      tone: (t.type === "Savings" ? "primary" : t.type === "Loan repayment" ? "indigo" : "saffron") as any,
    })),
    ...defaultActivity,
  ].slice(0, 5);

  return (
    <AppShell title={`Namaste, ${shg.leader.split(" ")[0]}`} subtitle={`${shg.name} · ${shg.village} · ${shg.cycle}`}>
      <section className="surface relative overflow-hidden">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
          <div className="min-w-0 space-y-5">
            <Pill tone="primary">
              <ShieldCheck className="size-3.5" /> Trust Passport verified by 2 banks
            </Pill>
            <h2 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Your group has saved <span className="text-gradient">{inr(totalSavings)}</span> together this
              cycle.
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Everything recorded in today's meeting is safe on this device and will reach the bank
              the moment there is network. No paper ledger, no waiting.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/meeting"
                className="gradient-emerald inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5"
              >
                <Mic className="size-4" /> Start meeting
              </Link>
              <Link
                to="/trust-passport"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-accent"
              >
                View Trust Passport
              </Link>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="overflow-hidden rounded-3xl border border-border"
          >
            <img
              src={heroArt}
              alt="Women of a self help group meeting in a village courtyard with a phone and ledger"
              width={1280}
              height={832}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="Total savings"
          value={inr(totalSavings)}
          caption="vs last month"
          delta={9.4}
          icon={PiggyBank}
          tone="emerald"
        />
        <StatCard
          index={1}
          label="Active loans"
          value={inr(activeLoansTotal)}
          caption={`${activeLoansCount} loans running`}
          delta={-4.1}
          icon={HandCoins}
          tone="indigo"
        />
        <StatCard
          index={2}
          label="Members"
          value={String(memberCount)}
          caption="Kondhapuri group"
          delta={12}
          icon={Users}
          tone="royal"
        />
        <StatCard
          index={3}
          label="Attendance"
          value="91%"
          caption="last 12 meetings"
          delta={3.2}
          icon={CalendarCheck}
          tone="saffron"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <SectionCard
          title="Savings & loan book"
          action={<Pill tone="indigo">Last 8 months</Pill>}
        >
          <div className="h-[290px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsSeries} margin={{ left: -12, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.04} />
                  </linearGradient>
                  <linearGradient id="loanFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 6" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="var(--muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => inr(v)}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  name="Savings"
                  dataKey="savings"
                  stroke="var(--chart-1)"
                  strokeWidth={3}
                  fill="url(#savingsFill)"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  name="Loans outstanding"
                  dataKey="loans"
                  stroke="var(--chart-2)"
                  strokeWidth={3}
                  fill="url(#loanFill)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Cycle health">
            <div className="flex flex-wrap items-center justify-around gap-4">
              <ProgressRing
                value={99}
                gradientId="ringRepay"
                label="99%"
                sublabel="On-time repayment"
              />
              <ProgressRing
                value={86}
                gradientId="ringCollect"
                label="86%"
                sublabel="Collection rate"
              />
              <ProgressRing value={trustScore} max={1000} gradientId="ringTrust" label={String(trustScore)} sublabel="Trust score" />
            </div>
            <div className="mt-5 h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={repaymentSeries} margin={{ left: -24, right: 8 }}>
                  <XAxis
                    dataKey="month"
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <YAxis hide domain={[80, 100]} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 14,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => `${v}% on time`}
                  />
                  <Line
                    type="monotone"
                    dataKey="onTime"
                    stroke="var(--chart-3)"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "var(--chart-3)" }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Sync status" action={<Pill tone={isOnline ? "primary" : "coral"}>{isOnline ? "Online" : "Offline-first"}</Pill>}>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  <span className="truncate">IndexedDB Local Storage</span>
                </span>
                <Pill tone="primary">Active</Pill>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                  {pendingCount === 0 ? (
                    <CheckCircle2 className="size-4 shrink-0 text-primary" />
                  ) : (
                    <CloudUpload className="size-4 shrink-0 text-saffron" />
                  )}
                  <span className="truncate">Pending sync items</span>
                </span>
                <Pill tone={pendingCount === 0 ? "primary" : "saffron"}>
                  {pendingCount === 0 ? "All Synced" : `${pendingCount} queued`}
                </Pill>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                  <RefreshCw className={`size-4 shrink-0 ${isSyncing ? "animate-spin text-primary" : "text-muted-foreground"}`} />
                  <span className="truncate">Last cloud sync</span>
                </span>
                <button
                  onClick={triggerSync}
                  className="hover:underline text-xs font-semibold text-primary"
                >
                  {lastSynced}
                </button>
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Recent activity" action={<Pill>Auto-logged</Pill>}>
        <ol className="relative space-y-5 pl-6">
          <span className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-border" />
          {liveActivity.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="relative"
            >
              <span
                className={`absolute -left-6 top-1.5 size-3.5 rounded-full ring-4 ring-card ${toneDot[item.tone as keyof typeof toneDot] || toneDot.primary}`}
              />
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">{item.time}</span>
              </div>
            </motion.li>
          ))}
        </ol>
      </SectionCard>
    </AppShell>
  );
}

