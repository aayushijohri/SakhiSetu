import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Download, ShieldCheck, TrendingUp, Info, BadgeCheck } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import passportArt from "@/assets/trust-passport.jpg";
import { AppShell } from "@/components/sakhi/AppShell";
import { Pill, SectionCard } from "@/components/sakhi/Bits";
import { QrPreview } from "@/components/sakhi/QrPreview";
import { shg, trustFactors, trustTimeline } from "@/data/demo";
import { dbLocal, initialSHG } from "@/lib/dexie";
import { generateBankDossierPDF } from "@/lib/pdfGenerator";

export const Route = createFileRoute("/trust-passport")({
  head: () => ({
    meta: [
      { title: "Trust Passport — a credit identity banks can verify | SakhiSetu" },
      {
        name: "description",
        content:
          "An explainable 0–1000 Trust Score built from repayment discipline, savings regularity, attendance and record completeness for women's SHGs.",
      },
      { property: "og:title", content: "SakhiSetu Trust Passport" },
      {
        property: "og:description",
        content: "Explainable SHG trust score that banks can verify in seconds.",
      },
    ],
  }),
  component: TrustPassport,
});

const SCORE = 768;

function Gauge() {
  const size = 268;
  const thickness = 22;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const pct = SCORE / 1000;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="55%" stopColor="var(--indigo)" />
            <stop offset="100%" stopColor="var(--grape)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={thickness}
          strokeLinecap="round"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Trust Score
        </p>
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 180, damping: 15 }}
          className="font-display text-6xl font-semibold leading-none text-ink"
        >
          {SCORE}
        </motion.p>
        <p className="mt-1 text-xs text-muted-foreground">out of 1000</p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold text-accent-foreground">
          <BadgeCheck className="size-3.5" /> Grade A · Bank-ready
        </span>
      </div>
    </div>
  );
}

function TrustPassport() {
  return (
    <AppShell
      title="Trust Passport"
      subtitle={`${shg.name} · Passport ID ${shg.passportId}`}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <section className="surface grid place-items-center p-6 text-center sm:p-8">
          <Gauge />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            This score is built only from what your group actually did — repayments, savings and
            attendance. Every point can be explained to a bank officer.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              onClick={async () => {
                try {
                  const members = await dbLocal.members.toArray();
                  const { pdfUrl, reportId } = await generateBankDossierPDF(initialSHG, members);
                  const link = document.createElement("a");
                  link.href = pdfUrl;
                  link.download = `Trust_Passport_${shg.name.replace(/ /g, "_")}.pdf`;
                  link.click();
                  toast.success("Trust Passport PDF downloaded", { description: `Verified Report ID: ${reportId}` });
                } catch (e) {
                  toast.error("Download failed, please try again.");
                }
              }}
              className="gradient-emerald inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Download className="size-4" /> Download passport
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/verify/${shg.passportId}`);
                toast.info("Share link copied to clipboard!", { description: "Valid for bank verification." });
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-accent cursor-pointer"
            >
              <ShieldCheck className="size-4" /> Share with bank
            </button>
          </div>
        </section>

        <SectionCard title="Why the score is 768" action={<Pill tone="indigo"><Info className="size-3.5" /> Explainable</Pill>}>
          <ul className="space-y-4">
            {trustFactors.map((f, i) => (
              <motion.li
                key={f.label}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl bg-muted/50 p-4"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <p className="truncate text-sm font-semibold text-ink">{f.label}</p>
                  <div className="flex shrink-0 items-center gap-2">
                    <Pill>{f.weight}% weight</Pill>
                    <span className="font-display text-sm font-semibold text-ink tabular-nums">
                      {f.score}/100
                    </span>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-card">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${f.score}%` }}
                    transition={{ duration: 1.1, delay: i * 0.08, ease: "easeOut" }}
                    className="gradient-royal h-full rounded-full"
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{f.note}</p>
              </motion.li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <SectionCard
          title="Score journey"
          action={
            <Pill tone="primary">
              <TrendingUp className="size-3.5" /> +156 in 6 months
            </Pill>
          }
        >
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trustTimeline} margin={{ left: -14, right: 10, top: 10 }}>
                <CartesianGrid strokeDasharray="4 6" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="period"
                  stroke="var(--muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <YAxis
                  domain={[560, 820]}
                  stroke="var(--muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--chart-2)"
                  strokeWidth={4}
                  dot={{ r: 5, fill: "var(--chart-1)" }}
                  activeDot={{ r: 7 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ["Next milestone", "800 · Grade A+", "32 points away"],
              ["Biggest lever", "Attendance", "+18 if 95% for 3 meetings"],
              ["Interest benefit", "−1.5% p.a.", "on the next group loan"],
            ].map(([a, b, c2]) => (
              <div key={a} className="rounded-2xl border border-border bg-muted/40 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {a}
                </p>
                <p className="font-display mt-1 text-base font-semibold text-ink">{b}</p>
                <p className="text-xs text-muted-foreground">{c2}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Passport preview" action={<Pill tone="saffron">PDF · 2 pages</Pill>}>
          <motion.div whileHover={{ y: -4 }} className="overflow-hidden rounded-2xl border border-border">
            <img
              src={passportArt}
              alt="Trust Passport certificate preview with seal and QR code between a village and a bank"
              width={1024}
              height={768}
              loading="lazy"
              className="w-full object-cover"
            />
          </motion.div>
          <div className="mt-4 grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
            <QrPreview seed={shg.passportId} size={124} />
            <div className="min-w-0 space-y-2">
              <p className="text-sm font-semibold text-ink">Verify in seconds</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                A bank officer scans this code and instantly sees the signed score, the group's
                ledger summary and the date it was generated.
              </p>
              <Pill tone="primary">
                <ShieldCheck className="size-3.5" /> Signed 12 Nov 2026
              </Pill>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
