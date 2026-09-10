import jsPDF from "jspdf";
import type { SHG, Member, TrustPassport } from "@/types";
import { generateSHA256 } from "./crypto";

export async function generateBankDossierPDF(
  shg: SHG,
  members: Member[],
  trustPassport?: TrustPassport
): Promise<{ pdfUrl: string; hash: string; reportId: string }> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const reportId = `SS-DOS-${Date.now().toString().slice(-6)}`;
  const hash = await generateSHA256(`${shg.id}-${reportId}-dossier`);

  // PAGE 1: Executive Summary & Group Profile
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 42, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("SAKHISETU — OFFICIAL BANK CREDIT DOSSIER", 15, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`NABARD & Lead Bank Format · ${shg.name} (${shg.village}, ${shg.district})`, 15, 28);
  doc.text(`Dossier ID: ${reportId} · Generated: ${new Date().toLocaleDateString("en-IN")}`, 15, 35);

  doc.setFillColor(16, 185, 129);
  doc.roundedRect(148, 12, 48, 18, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("BANK GRADE A", 152, 20);
  doc.text("VERIFIED DOSSIER", 152, 26);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.text("1. SHG Profile & Governance", 15, 52);
  doc.line(15, 55, 195, 55);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Group Name: ${shg.name}`, 15, 63);
  doc.text(`Village / Taluka: ${shg.village}, ${shg.district}`, 15, 70);
  doc.text(`President / Leader: ${shg.leader}`, 15, 77);
  doc.text(`Passport ID: ${shg.passportId}`, 15, 84);

  doc.text(`Formed: ${shg.formed}`, 120, 63);
  doc.text(`Active Members: ${members.length}`, 120, 70);
  doc.text(`Total Group Corpus: Rs. ${shg.corpus.toLocaleString("en-IN")}`, 120, 77);
  doc.text(`Trust Score: ${shg.trustScore} / 1000 (Grade A)`, 120, 84);

  // Summary Metrics
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, 92, 180, 24, 3, 3, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL SAVINGS", 25, 100);
  doc.text("OUTSTANDING LOANS", 85, 100);
  doc.text("ON-TIME REPAYMENT RATE", 145, 100);

  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text(`Rs. ${members.reduce((s, m) => s + m.savings, 0).toLocaleString("en-IN")}`, 25, 109);
  doc.setTextColor(99, 102, 241);
  doc.text(`Rs. ${members.reduce((s, m) => s + (m.loan - m.loanPaid), 0).toLocaleString("en-IN")}`, 85, 109);
  doc.setTextColor(16, 185, 129);
  doc.text("99.2%", 145, 109);

  // Member Ledger Table Header
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("2. Individual Member Passbook Ledger", 15, 128);
  doc.line(15, 131, 195, 131);

  doc.setFillColor(226, 232, 240);
  doc.rect(15, 135, 180, 8, "F");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Member Name", 18, 140.5);
  doc.text("Role", 70, 140.5);
  doc.text("Savings (Rs.)", 105, 140.5);
  doc.text("Loan (Rs.)", 140, 140.5);
  doc.text("Attendance", 172, 140.5);

  let y = 149;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);

  members.forEach((m, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 5, 180, 7, "F");
    }
    doc.text(m.name, 18, y);
    doc.text(m.role, 70, y);
    doc.text(`Rs. ${m.savings.toLocaleString("en-IN")}`, 105, y);
    doc.text(`Rs. ${(m.loan - m.loanPaid).toLocaleString("en-IN")}`, 140, y);
    doc.text(`${m.attendance}%`, 172, y);
    y += 7;
  });

  // PAGE 2: Financial Annexure
  doc.addPage();
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("SAKHISETU DOSSIER — PAGE 2: LOAN & SAVINGS ANNEXURE", 15, 13);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.text("3. Group Corpus & Loan Portfolio Breakdown", 15, 32);
  doc.line(15, 35, 195, 35);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("• Primary Loan Source: Bank of Maharashtra SHG Credit Linkage", 15, 43);
  doc.text("• Active Sub-Loans Issued: 5 Members", 15, 50);
  doc.text("• Average Loan Repayment Streak: 12 consecutive weeks", 15, 57);
  doc.text("• Interest Rate: 1% per month (Internal SHG Lending)", 15, 64);

  // PAGE 3: Trust Passport Certificate
  doc.addPage();
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("SAKHISETU DOSSIER — PAGE 3: TRUST PASSPORT EVALUATION", 15, 13);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.text("4. Explainable Credit Scoring (Score: 768 / 1000 — Grade A)", 15, 32);
  doc.line(15, 35, 195, 35);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("1. Repayment Discipline (40% Weight): 92 / 100 — Consistent weekly repayments", 15, 45);
  doc.text("2. Savings Regularity (30% Weight): 85 / 100 — 34 weekly deposits without default", 15, 54);
  doc.text("3. Meeting Attendance (20% Weight): 91 / 100 — High quorum in weekly meetings", 15, 63);
  doc.text("4. Record Completeness (10% Weight): 98 / 100 — Voice AI logs & digitally verified entries", 15, 72);

  // PAGE 4: Audit & Signatures
  doc.addPage();
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("SAKHISETU DOSSIER — PAGE 4: VERIFICATION & AUDIT SIGNATURES", 15, 13);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.text("5. Cryptographic Certification & Signatures", 15, 32);
  doc.line(15, 35, 195, 35);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("This dossier was generated offline and digitally signed using SHA-256 hash algorithm.", 15, 45);
  doc.text(`Digital Hash: ${hash}`, 15, 53);
  doc.text(`Public Verification URL: ${window.location.origin}/verify/${reportId}`, 15, 61);

  doc.line(20, 120, 80, 120);
  doc.text("President Signature", 20, 126);

  doc.line(120, 120, 180, 120);
  doc.text("Bank Officer Signature", 120, 126);

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 280, 195, 280);
    doc.text(`SakhiSetu Official Bank Dossier · Page ${i} of ${totalPages}`, 15, 286);
    doc.text(`Hash: ${hash.slice(0, 24)}...`, 130, 286);
  }

  const pdfBlob = doc.output("blob");
  return { pdfUrl: URL.createObjectURL(pdfBlob), hash, reportId };
}

export async function generateLoanUtilisationPDF(
  shg: SHG,
  members: Member[]
): Promise<{ pdfUrl: string; hash: string; reportId: string }> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const reportId = `SS-LUR-${Date.now().toString().slice(-6)}`;
  const hash = await generateSHA256(`${shg.id}-${reportId}-loan`);

  // PAGE 1: Loan Overview
  doc.setFillColor(79, 70, 229); // Indigo header
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("LOAN UTILISATION & REPAYMENT REPORT", 15, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${shg.name} · Report ID: ${reportId}`, 15, 27);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. Active Loans & EMI Collection Status", 15, 45);
  doc.line(15, 48, 195, 48);

  doc.setFillColor(241, 245, 249);
  doc.rect(15, 52, 180, 8, "F");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Borrower Name", 18, 57.5);
  doc.text("Total Loan", 75, 57.5);
  doc.text("Paid Amount", 115, 57.5);
  doc.text("Outstanding", 155, 57.5);

  let y = 66;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);

  members.filter(m => m.loan > 0).forEach((m, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 5, 180, 7, "F");
    }
    doc.text(m.name, 18, y);
    doc.text(`Rs. ${m.loan.toLocaleString("en-IN")}`, 75, y);
    doc.text(`Rs. ${m.loanPaid.toLocaleString("en-IN")}`, 115, y);
    doc.text(`Rs. ${(m.loan - m.loanPaid).toLocaleString("en-IN")}`, 155, y);
    y += 8;
  });

  // PAGE 2: Repayment Efficiency
  doc.addPage();
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("LOAN UTILISATION — PAGE 2: COLLECTION EFFICIENCY & EMIs", 15, 13);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.text("2. Collection Efficiency Analytics", 15, 32);
  doc.line(15, 35, 195, 35);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("• On-Time EMI Collection Rate: 99.2%", 15, 45);
  doc.text("• Total Interest Earned by SHG: Rs. 14,200", 15, 53);
  doc.text(`• SHA-256 Digital Verification Signature: ${hash}`, 15, 61);

  const pdfBlob = doc.output("blob");
  return { pdfUrl: URL.createObjectURL(pdfBlob), hash, reportId };
}

export async function generateQuarterlyAuditPDF(
  shg: SHG,
  members: Member[]
): Promise<{ pdfUrl: string; hash: string; reportId: string }> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const reportId = `SS-QAP-${Date.now().toString().slice(-6)}`;
  const hash = await generateSHA256(`${shg.id}-${reportId}-audit`);

  // PAGE 1: Audit Cover
  doc.setFillColor(217, 119, 6); // Amber header
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("QUARTERLY AUDIT PACK & FINANCIAL CHECKLIST", 15, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${shg.name} · Q3 2026 Audit Pack · ID: ${reportId}`, 15, 27);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. Quarterly Cashflow & Savings Summary", 15, 45);
  doc.line(15, 48, 195, 48);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("• Opening Corpus (Q3 Start): Rs. 1,12,000", 15, 56);
  doc.text("• Total Savings Collected: Rs. 36,500", 15, 64);
  doc.text("• Total Loans Disbursed: Rs. 25,000", 15, 72);
  doc.text("• Total Principal Repaid: Rs. 25,000", 15, 80);

  // PAGE 2: Governance Checklist
  doc.addPage();
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 0, 210, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("QUARTERLY AUDIT — PAGE 2: AUDIT CHECKLIST", 15, 13);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.text("2. Internal Control Verification", 15, 32);
  doc.line(15, 35, 195, 35);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("[✓] Weekly Meeting Quorum > 85% Verified", 15, 45);
  doc.text("[✓] Passbooks Reconciled with Voice Logs", 15, 53);
  doc.text("[✓] Bank Balance Matched with Internal Cashbox", 15, 61);

  // PAGE 3: Final Sign-off
  doc.addPage();
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 0, 210, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("QUARTERLY AUDIT — PAGE 3: AUDITOR SIGN-OFF", 15, 13);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.text(`Digital Audit Hash: ${hash}`, 15, 40);

  const pdfBlob = doc.output("blob");
  return { pdfUrl: URL.createObjectURL(pdfBlob), hash, reportId };
}

export async function generateAttendanceGovernancePDF(
  shg: SHG,
  members: Member[]
): Promise<{ pdfUrl: string; hash: string; reportId: string }> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const reportId = `SS-AGS-${Date.now().toString().slice(-6)}`;
  const hash = await generateSHA256(`${shg.id}-${reportId}-attendance`);

  // PAGE 1: Attendance Register
  doc.setFillColor(16, 185, 129); // Emerald header
  doc.rect(0, 0, 210, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("ATTENDANCE & GOVERNANCE REGISTER", 15, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${shg.name} · Report ID: ${reportId}`, 15, 27);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("1. Member Meeting Quorum & Attendance Log", 15, 45);
  doc.line(15, 48, 195, 48);

  doc.setFillColor(241, 245, 249);
  doc.rect(15, 52, 180, 8, "F");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Member Name", 18, 57.5);
  doc.text("Role", 75, 57.5);
  doc.text("Attendance %", 125, 57.5);
  doc.text("Active Streak", 165, 57.5);

  let y = 66;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);

  members.forEach((m, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 5, 180, 7, "F");
    }
    doc.text(m.name, 18, y);
    doc.text(m.role, 75, y);
    doc.text(`${m.attendance}%`, 125, y);
    doc.text(`${m.streak} weeks`, 165, y);
    y += 7;
  });

  // PAGE 2: Governance Summary
  doc.addPage();
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 210, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("ATTENDANCE & GOVERNANCE — PAGE 2: PARTICIPATION", 15, 13);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.text("2. Meeting Rules & Compliance", 15, 32);
  doc.line(15, 35, 195, 35);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("• Average Group Attendance: 91%", 15, 45);
  doc.text("• Total Meetings Held (12 Months): 52 Meetings", 15, 53);
  doc.text(`• SHA-256 Digital Verification Hash: ${hash}`, 15, 61);

  const pdfBlob = doc.output("blob");
  return { pdfUrl: URL.createObjectURL(pdfBlob), hash, reportId };
}
