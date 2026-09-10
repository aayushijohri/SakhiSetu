export const shg = {
  name: "Sakhi Mahila Bachat Gat",
  village: "Kondhapuri, Pune",
  leader: "Sunita Pawar",
  formed: "March 2019",
  cycle: "Cycle 7 · Week 3",
  passportId: "SS-MH-2019-04871",
};

export const savingsSeries = [
  { month: "Apr", savings: 41000, loans: 18000 },
  { month: "May", savings: 47500, loans: 22000 },
  { month: "Jun", savings: 52300, loans: 26500 },
  { month: "Jul", savings: 58900, loans: 24000 },
  { month: "Aug", savings: 66200, loans: 31000 },
  { month: "Sep", savings: 74800, loans: 29500 },
  { month: "Oct", savings: 83400, loans: 34200 },
  { month: "Nov", savings: 92100, loans: 32800 },
];

export const repaymentSeries = [
  { month: "Jul", onTime: 92 },
  { month: "Aug", onTime: 95 },
  { month: "Sep", onTime: 97 },
  { month: "Oct", onTime: 98 },
  { month: "Nov", onTime: 99 },
];

export type Member = {
  id: string;
  name: string;
  initials: string;
  role: string;
  savings: number;
  loan: number;
  loanPaid: number;
  attendance: number;
  streak: number;
  status: "current" | "watch" | "cleared";
  contributions: { label: string; amount: number }[];
};

export const members: Member[] = [
  {
    id: "m1",
    name: "Sunita Pawar",
    initials: "SP",
    role: "President",
    savings: 14200,
    loan: 20000,
    loanPaid: 16500,
    attendance: 100,
    streak: 24,
    status: "current",
    contributions: [
      { label: "Nov", amount: 600 },
      { label: "Oct", amount: 600 },
      { label: "Sep", amount: 500 },
      { label: "Aug", amount: 600 },
    ],
  },
  {
    id: "m2",
    name: "Kavita Jadhav",
    initials: "KJ",
    role: "Treasurer",
    savings: 12850,
    loan: 15000,
    loanPaid: 9000,
    attendance: 96,
    streak: 18,
    status: "current",
    contributions: [
      { label: "Nov", amount: 500 },
      { label: "Oct", amount: 500 },
      { label: "Sep", amount: 500 },
      { label: "Aug", amount: 400 },
    ],
  },
  {
    id: "m3",
    name: "Rekha Shinde",
    initials: "RS",
    role: "Secretary",
    savings: 11100,
    loan: 0,
    loanPaid: 0,
    attendance: 92,
    streak: 12,
    status: "cleared",
    contributions: [
      { label: "Nov", amount: 500 },
      { label: "Oct", amount: 450 },
      { label: "Sep", amount: 500 },
      { label: "Aug", amount: 500 },
    ],
  },
  {
    id: "m4",
    name: "Mangala Bhosale",
    initials: "MB",
    role: "Member",
    savings: 9400,
    loan: 12000,
    loanPaid: 4200,
    attendance: 78,
    streak: 4,
    status: "watch",
    contributions: [
      { label: "Nov", amount: 300 },
      { label: "Oct", amount: 0 },
      { label: "Sep", amount: 400 },
      { label: "Aug", amount: 400 },
    ],
  },
  {
    id: "m5",
    name: "Asha Kamble",
    initials: "AK",
    role: "Member",
    savings: 10250,
    loan: 8000,
    loanPaid: 6400,
    attendance: 94,
    streak: 15,
    status: "current",
    contributions: [
      { label: "Nov", amount: 450 },
      { label: "Oct", amount: 450 },
      { label: "Sep", amount: 450 },
      { label: "Aug", amount: 400 },
    ],
  },
  {
    id: "m6",
    name: "Vaishali More",
    initials: "VM",
    role: "Member",
    savings: 8720,
    loan: 10000,
    loanPaid: 8500,
    attendance: 88,
    streak: 9,
    status: "current",
    contributions: [
      { label: "Nov", amount: 400 },
      { label: "Oct", amount: 400 },
      { label: "Sep", amount: 350 },
      { label: "Aug", amount: 400 },
    ],
  },
  {
    id: "m7",
    name: "Shobha Gaikwad",
    initials: "SG",
    role: "Member",
    savings: 13300,
    loan: 18000,
    loanPaid: 15300,
    attendance: 98,
    streak: 21,
    status: "current",
    contributions: [
      { label: "Nov", amount: 550 },
      { label: "Oct", amount: 550 },
      { label: "Sep", amount: 550 },
      { label: "Aug", amount: 500 },
    ],
  },
  {
    id: "m8",
    name: "Nanda Chavan",
    initials: "NC",
    role: "Member",
    savings: 7650,
    loan: 0,
    loanPaid: 0,
    attendance: 84,
    streak: 6,
    status: "cleared",
    contributions: [
      { label: "Nov", amount: 350 },
      { label: "Oct", amount: 350 },
      { label: "Sep", amount: 300 },
      { label: "Aug", amount: 350 },
    ],
  },
];

export const activity = [
  {
    id: "a1",
    title: "Weekly savings recorded by voice",
    detail: "8 members · ₹4,150 collected",
    time: "Today, 10:24 AM",
    tone: "primary" as const,
  },
  {
    id: "a2",
    title: "Loan repayment logged",
    detail: "Shobha Gaikwad · ₹1,500 instalment 11 of 12",
    time: "Today, 10:31 AM",
    tone: "indigo" as const,
  },
  {
    id: "a3",
    title: "New loan sanctioned",
    detail: "Mangala Bhosale · ₹12,000 for goat rearing",
    time: "Yesterday, 6:05 PM",
    tone: "saffron" as const,
  },
  {
    id: "a4",
    title: "Attendance marked offline",
    detail: "7 present · 1 absent · synced later",
    time: "Yesterday, 5:40 PM",
    tone: "coral" as const,
  },
  {
    id: "a5",
    title: "Trust Passport refreshed",
    detail: "Score moved 742 → 768",
    time: "Mon, 8:12 AM",
    tone: "primary" as const,
  },
];

export const trustFactors = [
  {
    label: "Repayment discipline",
    weight: 35,
    score: 94,
    note: "99% instalments paid on or before due date",
  },
  {
    label: "Savings regularity",
    weight: 25,
    score: 88,
    note: "31 of 34 weekly cycles fully collected",
  },
  {
    label: "Meeting attendance",
    weight: 15,
    score: 79,
    note: "Average 91% across last 12 meetings",
  },
  {
    label: "Record completeness",
    weight: 15,
    score: 82,
    note: "All ledgers digitised, 2 receipts pending",
  },
  {
    label: "Group tenure & size",
    weight: 10,
    score: 71,
    note: "6 years active, 8 members, low churn",
  },
];

export const trustTimeline = [
  { period: "Jun", score: 612 },
  { period: "Jul", score: 648 },
  { period: "Aug", score: 685 },
  { period: "Sep", score: 712 },
  { period: "Oct", score: 742 },
  { period: "Nov", score: 768 },
];

export const parsedTransactions = [
  { member: "Sunita Pawar", type: "Savings", amount: 600, confidence: 98 },
  { member: "Kavita Jadhav", type: "Savings", amount: 500, confidence: 97 },
  { member: "Shobha Gaikwad", type: "Loan repayment", amount: 1500, confidence: 95 },
  { member: "Asha Kamble", type: "Savings", amount: 450, confidence: 93 },
  { member: "Mangala Bhosale", type: "Loan disbursed", amount: 12000, confidence: 90 },
];

export const transcriptLines = [
  "सुनीता ने छह सौ रुपये बचत जमा की।",
  "कविता जाधव — पाँच सौ रुपये बचत।",
  "शोभा गायकवाड़ ने पंद्रह सौ का कर्ज़ किस्त भरा।",
  "आशा कांबले — चार सौ पचास बचत।",
  "मंगला भोसले को बारह हज़ार का कर्ज़ मंज़ूर हुआ।",
];

export const reports = [
  {
    id: "r1",
    title: "Bank Dossier · Nov 2026",
    kind: "Full dossier",
    pages: 14,
    generated: "12 Nov 2026",
    size: "1.8 MB",
    status: "Verified" as const,
  },
  {
    id: "r2",
    title: "Loan Utilisation Report",
    kind: "Loan annexure",
    pages: 6,
    generated: "04 Nov 2026",
    size: "740 KB",
    status: "Shared" as const,
  },
  {
    id: "r3",
    title: "Quarterly Audit Pack Q3",
    kind: "Audit",
    pages: 22,
    generated: "28 Oct 2026",
    size: "3.1 MB",
    status: "Verified" as const,
  },
  {
    id: "r4",
    title: "Attendance & Governance Sheet",
    kind: "Compliance",
    pages: 4,
    generated: "19 Oct 2026",
    size: "410 KB",
    status: "Draft" as const,
  },
];

export const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
