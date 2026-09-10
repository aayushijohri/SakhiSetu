import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ShieldCheck, CheckCircle2, Lock, ArrowLeft } from "lucide-react";
import { Pill, SectionCard } from "@/components/sakhi/Bits";
import { shg } from "@/data/demo";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Bank Report Verification — SakhiSetu" },
      { name: "description", content: "Instant cryptographic verification of SHG Bank Dossier." },
    ],
  }),
  component: VerifyPublicPage,
});

function VerifyPublicPage() {
  const sampleHash = "a4f8e21c9b3d7e5f102938475610293847561029384756102938475610293847";

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-ink transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="gradient-royal overflow-hidden rounded-3xl p-6 text-primary-foreground shadow-glow sm:p-8 relative"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/20 pb-6">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-emerald-500 text-white shadow-glow">
                <CheckCircle2 className="size-7" />
              </span>
              <div>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  Tamper Evident Badge
                </span>
                <h1 className="font-display text-2xl font-bold mt-1">REPORT VERIFIED & AUTHENTIC</h1>
              </div>
            </div>
            <Pill tone="primary">
              <ShieldCheck className="size-4" /> SHA-256 Matched
            </Pill>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4 space-y-1">
              <p className="text-xs uppercase tracking-wider opacity-80">Self Help Group Name</p>
              <p className="font-display text-lg font-semibold">{shg.name}</p>
              <p className="text-xs opacity-90">{shg.village}, Maharashtra</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 space-y-1">
              <p className="text-xs uppercase tracking-wider opacity-80">Passport ID & Date</p>
              <p className="font-display text-lg font-semibold">{shg.passportId}</p>
              <p className="text-xs opacity-90">Issued: 12 Nov 2026 · Valid 90 days</p>
            </div>
          </div>
        </motion.div>

        <SectionCard title="Cryptographic Signature Details">
          <div className="space-y-4">
            <div className="rounded-2xl bg-muted/60 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Lock className="size-3.5 text-primary" /> SHA-256 Immutable Hash
                </span>
                <span className="text-emerald-600 font-bold">STATUS: MATCHED & UNTAMPERED</span>
              </div>
              <p className="font-mono text-xs text-ink break-all bg-card p-3 rounded-xl border border-border">
                {sampleHash}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Trust Score</p>
                <p className="font-display text-3xl font-bold text-ink mt-1">768</p>
                <p className="text-xs text-emerald-600 font-semibold mt-0.5">Grade A · Bank Ready</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Signed Status</p>
                <p className="font-display text-xl font-bold text-ink mt-2">Digitally Signed</p>
                <p className="text-xs text-muted-foreground mt-0.5">by SHG President & Dexie Ledger</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Partner Acceptance</p>
                <p className="font-display text-xl font-bold text-ink mt-2">2 Banks Verified</p>
                <p className="text-xs text-muted-foreground mt-0.5">Bank of Maharashtra & NABARD</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
