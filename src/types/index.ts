export type UserRole = "SHG Leader" | "Member" | "Bank Officer";

export interface User {
  uid: string;
  name: string;
  phone: string;
  role: UserRole;
  village: string;
  district: string;
  state: string;
  shgId: string;
}

export interface SHG {
  id: string;
  name: string;
  village: string;
  district: string;
  state: string;
  leader: string;
  formed: string;
  cycle: string;
  passportId: string;
  createdDate: string;
  membersCount: number;
  corpus: number;
  trustScore: number;
}

export interface Contribution {
  label: string;
  amount: number;
}

export interface Member {
  id: string;
  shgId: string;
  name: string;
  initials: string;
  role: string;
  savings: number;
  loan: number;
  loanPaid: number;
  attendance: number;
  streak: number;
  status: "current" | "watch" | "cleared";
  contributions: Contribution[];
  joinedDate?: string;
  phone?: string;
}

export interface Transaction {
  id: string;
  meetingId?: string;
  memberId: string;
  memberName: string;
  type: "Savings" | "Loan repayment" | "Loan disbursed";
  amount: number;
  timestamp: number;
  synced: boolean;
  hash: string;
  confidence?: number;
}

export interface AttendanceRecord {
  meetingId: string;
  memberId: string;
  status: "present" | "absent";
  date: string;
}

export interface Meeting {
  id: string;
  shgId: string;
  meetingDate: string;
  attendance: Record<string, "present" | "absent">;
  transcript: string[];
  summary: {
    membersPresent: number;
    totalSavingsCollected: number;
    totalRepayments: number;
    newLoanRequests: number;
    attendancePercentage: number;
  };
}

export interface TrustFactor {
  label: string;
  weight: number;
  score: number;
  note: string;
}

export interface TrustTimelineEntry {
  period: string;
  score: number;
}

export interface TrustPassport {
  shgId: string;
  score: number;
  grade: string;
  breakdown: TrustFactor[];
  generatedDate: string;
  timeline: TrustTimelineEntry[];
}

export interface ReportItem {
  id: string;
  shgId: string;
  title: string;
  kind: string;
  pages: number;
  generated: string;
  size: string;
  status: "Verified" | "Shared" | "Draft";
  pdfUrl?: string;
  qrId: string;
  hash: string;
}

export interface SyncQueueItem {
  id: string;
  collection: "transactions" | "meetings" | "members" | "reports";
  action: "create" | "update" | "delete";
  payload: any;
  timestamp: number;
}
