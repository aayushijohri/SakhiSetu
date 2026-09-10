import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Share2,
  Loader2,
  FileSpreadsheet,
  ShieldCheck,
  Building2,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/sakhi/AppShell";
import { Pill, SectionCard, SkeletonRow } from "@/components/sakhi/Bits";
import { QrPreview } from "@/components/sakhi/QrPreview";
import { inr, reports, shg } from "@/data/demo";
import { dbLocal, initialSHG } from "@/lib/dexie";
import {
  generateBankDossierPDF,
  generateLoanUtilisationPDF,
  generateQuarterlyAuditPDF,
  generateAttendanceGovernancePDF,
} from "@/lib/pdfGenerator";
import type { Member } from "@/types";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Bank Verification — SakhiSetu" },
      {
        name: "description",
        content:
          "Generate bank-ready dossiers, loan utilisation reports, quarterly audit packs and governance sheets.",
      },
      { property: "og:title", content: "SakhiSetu Reports & Bank Verification" },
      {
        property: "og:description",
        content: "Bank-ready SHG dossiers with QR verification and export history.",
      },
    ],
  }),
  component: ReportsPage,
});

const statusTone = { Verified: "primary", Shared: "indigo", Draft: "saffron" } as const;

const reportsList = [
  {
    id: "dossier-01",
    title: "Official Bank Credit Dossier (NABARD / Lead Bank Format)",
    detail: "4-page PDF with SHG profile, member passbook ledgers, savings summary, loan annexure, and Trust Passport certificate.",
    badge: "Official Bank Format",
    size: "4 Pages · PDF",
    generator: "bank-dossier",
  },
  {
    id: "dossier-02",
    title: "Loan Utilisation & EMI Repayment Report",
    detail: "2-page PDF detailing active loans, outstanding amounts, collection efficiency, and EMI schedules.",
    badge: "Loan Analytics",
    size: "2 Pages · PDF",
    generator: "loan-utilisation",
  },
  {
    id: "dossier-03",
    title: "Quarterly Audit Pack & Financial Checklist",
    detail: "3-page PDF with quarterly cashflow statement, internal control checklist, and auditor sign-off.",
    badge: "Audit Ledger",
    size: "3 Pages · PDF",
    generator: "quarterly-audit",
  },
  {
    id: "dossier-04",
    title: "Attendance & Governance Sheet",
    detail: "2-page PDF with member meeting attendance log, participation streaks, and governance compliance status.",
    badge: "Governance Sheet",
    size: "2 Pages · PDF",
    generator: "attendance-governance",
  },
];

const dossierPages = [
  { title: "Group profile", lines: ["Formed March 2019", "15 members · Kondhapuri", "Federation: Pune ZP"] },
  { title: "Savings ledger", lines: ["Total corpus ₹1,48,500", "34 weekly cycles", "Collection rate 86%"] },
  { title: "Loan annexure", lines: ["5 active loans", "Outstanding ₹32,800", "On-time repayment 99%"] },
  { title: "Trust Passport", lines: ["Score 768 / 1000", "Grade A · Bank-ready", "Signed 12 Nov 2026"] },
];

function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const liveMembers = useLiveQuery(() => dbLocal.members.toArray(), []);
  const membersList: Member[] = (liveMembers && liveMembers.length > 0) ? liveMembers : [];

  const handleDownload = async (generatorType: string, title: string) => {
    setDownloading(generatorType);
    try {
      let res;
      if (generatorType === "loan-utilisation") {
        res = await generateLoanUtilisationPDF(initialSHG, membersList);
      } else if (generatorType === "quarterly-audit") {
        res = await generateQuarterlyAuditPDF(initialSHG, membersList);
      } else if (generatorType === "attendance-governance") {
        res = await generateAttendanceGovernancePDF(initialSHG, membersList);
      } else {
        res = await generateBankDossierPDF(initialSHG, membersList);
      }

      const link = document.createElement("a");
      link.href = res.pdfUrl;
      link.download = `SakhiSetu_${generatorType}_${res.reportId}.pdf`;
      link.click();

      toast.success(`${title} downloaded!`, {
        description: `SHA-256 Verified (Report ID: ${res.reportId})`,
      });
    } catch (e) {
      toast.error("Error generating report PDF.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <AppShell title="Reports & Bank Verification" subtitle="Turn the group's ledger into four unique bank-grade report documents">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <section className="gradient-indigo relative overflow-hidden rounded-3xl p-6 text-indigo-foreground shadow-glow sm:p-8">
          <div className="absolute -right-20 -top-24 size-72 rounded-full bg-white/10" />
          <div className="relative space-y-5">
            <Pill tone="muted">
              <Building2 className="size-3.5" /> Accepted by 2 partner banks
            </Pill>
            <h2 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
              Generate Official Bank Dossiers for {shg.name}
            </h2>
            <p className="max-w-xl text-sm leading-relaxed opacity-90">
              Four dedicated report generators — from 4-page Bank Credit Dossiers to Loan Utilisation ledgers and Quarterly Audit packs with instant QR verification.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Corpus", inr(148500)],
                ["Outstanding", inr(32800)],
                ["Trust Score", "768"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-white/15 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider opacity-85">{k}</p>
                  <p className="font-display text-xl font-semibold">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleDownload("bank-dossier", "Official Bank Credit Dossier")}
                disabled={downloading !== null}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/95 px-5 py-3 text-sm font-semibold text-indigo transition-transform hover:-translate-y-0.5 disabled:opacity-70 cursor-pointer"
              >
                {downloading === "bank-dossier" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileText className="size-4" />
                )}
                {downloading === "bank-dossier" ? "Generating PDF…" : "Export Official Dossier (4 Pages)"}
              </button>
            </div>
          </div>
        </section>

        <SectionCard title="QR verification" action={<Pill tone="primary">Live</Pill>}>
          <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
            <QrPreview seed={`${shg.passportId}`} size={150} />
            <div className="min-w-0 space-y-3">
              <p className="text-sm font-semibold text-ink">Dossier #{shg.passportId}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Anyone with this code can confirm the dossier is genuine, unchanged and issued by
                this group. No login needed at the branch.
              </p>
              <div className="flex flex-wrap gap-2">
                <Pill tone="primary">
                  <ShieldCheck className="size-3.5" /> Tamper-evident
                </Pill>
                <Pill tone="indigo">Valid 90 days</Pill>
              </div>
              <Link
                to="/verify"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Verify online now <ExternalLink className="size-3" />
              </Link>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Dossier preview" action={<Pill tone="saffron">4 pages</Pill>}>
        <AnimatePresence mode="wait">
          {downloading !== null ? (
            <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SkeletonRow lines={4} />
            </motion.div>
          ) : (
            <motion.div
              key="pages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {dossierPages.map((p, i) => (
                <motion.article
                  key={p.title}
                  initial={{ opacity: 0, y: 18, rotate: -1 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -6, rotate: 0.5 }}
                  className="surface overflow-hidden p-0"
                >
                  <div className="gradient-royal px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-foreground/85">
                      Page {i + 1}
                    </p>
                    <p className="font-display truncate text-sm font-semibold text-primary-foreground">
                      {p.title}
                    </p>
                  </div>
                  <div className="space-y-2.5 p-4">
                    {p.lines.map((l) => (
                      <p key={l} className="truncate text-xs text-muted-foreground">
                        {l}
                      </p>
                    ))}
                    <div className="space-y-1.5 pt-2">
                      {[92, 76, 84, 60].map((w, k) => (
                        <span
                          key={k}
                          className="block h-1.5 rounded-full bg-muted"
                          style={{ width: `${w}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      <SectionCard title="Available Export Documents (4 Unique PDF Generators)">
        <div className="space-y-4">
          {reportsList.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="surface grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-5"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="gradient-emerald grid size-12 shrink-0 place-items-center rounded-2xl text-primary-foreground">
                  <FileText className="size-6" />
                </span>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-semibold text-ink">{doc.title}</h3>
                    <Pill tone="primary">{doc.badge}</Pill>
                  </div>
                  <p className="text-xs text-muted-foreground">{doc.detail}</p>
                  <p className="text-[11px] font-medium text-muted-foreground">{doc.size}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  onClick={() => handleDownload(doc.generator, doc.title)}
                  disabled={downloading !== null}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-accent cursor-pointer"
                >
                  <Download className="size-3.5" /> Download PDF
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>
    </AppShell>
  );
}
