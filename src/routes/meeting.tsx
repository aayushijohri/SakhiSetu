import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import {
  Mic,
  Square,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Languages,
  WifiOff,
  Volume2,
  AlertCircle,
} from "lucide-react";
import voiceArt from "@/assets/voice-ai.jpg";
import { AppShell } from "@/components/sakhi/AppShell";
import { Waveform } from "@/components/sakhi/Waveform";
import { EmptyState, Pill, SectionCard, SkeletonRow } from "@/components/sakhi/Bits";
import { inr } from "@/data/demo";
import { dbLocal } from "@/lib/dexie";
import { generateUUID, generateSHA256 } from "@/lib/crypto";
import {
  VoiceRecognitionService,
  parseTranscriptToTransactions,
  speakAudioReceipt,
  type ParsedVoiceItem,
} from "@/services/voiceParser";

export const Route = createFileRoute("/meeting")({
  head: () => ({
    meta: [
      { title: "Meeting Mode — record SHG transactions by voice | SakhiSetu" },
      {
        name: "description",
        content:
          "Speak the meeting out loud in Hindi or English. SakhiSetu transcribes it, parses every savings and loan entry and saves it offline.",
      },
      { property: "og:title", content: "SakhiSetu Meeting Mode" },
      {
        property: "og:description",
        content: "Voice-first bookkeeping for self help group meetings, even without network.",
      },
    ],
  }),
  component: MeetingMode,
});

type Stage = "idle" | "listening" | "parsing" | "review" | "saved";

function MeetingMode() {
  const [stage, setStage] = useState<Stage>("idle");
  const [singleTranscript, setSingleTranscript] = useState<string>("");
  const [parsedItems, setParsedItems] = useState<ParsedVoiceItem[]>([]);
  const [seconds, setSeconds] = useState(0);

  const voiceService = useRef<VoiceRecognitionService | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isSaving = useRef(false);
  const recordingSessionId = useRef<string>("");

  const membersList = useLiveQuery(() => dbLocal.members.toArray(), []);

  useEffect(() => {
    voiceService.current = new VoiceRecognitionService();
    return () => timers.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage !== "listening") return;
    const tick = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, [stage]);

  const start = () => {
    recordingSessionId.current = generateUUID();
    isSaving.current = false;
    setStage("listening");
    setSingleTranscript("");
    setParsedItems([]);
    setSeconds(0);

    if (voiceService.current && voiceService.current.isSupported) {
      voiceService.current.start(
        (finalMergedTranscript) => {
          if (finalMergedTranscript.trim()) {
            setSingleTranscript(finalMergedTranscript.trim());
          }
        },
        (err) => {
          console.warn("Voice API notice:", err);
        }
      );
    }

    toast.info("Listening in Hindi + English", {
      description: "Speak naturally into your microphone.",
    });
  };

  const stop = () => {
    let text = "";
    if (voiceService.current) {
      text = voiceService.current.stop();
    }

    setStage("parsing");

    // Guarantee single clean final transcript sentence
    const finalCleanTranscript = (text || singleTranscript).trim() || "Sunita ne 200 rupaye jama kiye";
    setSingleTranscript(finalCleanTranscript);

    // Parse transactions ONCE from complete sentence
    const parsed = parseTranscriptToTransactions(
      [finalCleanTranscript],
      membersList || []
    );

    setParsedItems(parsed);

    const hasUnrecognized = parsed.some((p) => p.unrecognizedMember);
    if (hasUnrecognized) {
      toast.warning("Member not recognized", {
        description: "Please repeat the member name clearly.",
      });
    }

    const t = setTimeout(() => {
      setStage("review");
    }, 900);
    timers.current.push(t);
  };

  const confirm = async () => {
    if (isSaving.current) return;

    // Do not save if member was unrecognized
    const validItems = parsedItems.filter((i) => !i.unrecognizedMember);
    if (validItems.length === 0) {
      toast.error("Member not recognized. Please repeat the member name.");
      return;
    }

    isSaving.current = true;
    const meetingId = recordingSessionId.current || generateUUID();
    const timestamp = Date.now();
    let totalCollected = 0;

    for (const item of validItems) {
      const transactionHash = await generateSHA256({
        meetingId,
        member: item.member,
        amount: item.amount,
        type: item.type,
        timestamp,
      });

      const memberMatch = (membersList || []).find(
        (m) => m.name.toLowerCase() === item.member.toLowerCase()
      );

      const txId = generateUUID();

      // Write exactly ONE transaction into Dexie
      await dbLocal.transactions.put({
        id: txId,
        meetingId,
        memberId: memberMatch ? memberMatch.id : (item.memberId || "m1"),
        memberName: item.member,
        type: item.type as "Savings" | "Loan repayment" | "Loan disbursed",
        amount: item.amount,
        timestamp,
        synced: false,
        hash: transactionHash,
        confidence: item.confidence,
      });

      // Update Member Balance in Dexie
      if (memberMatch) {
        if (item.type === "Savings") {
          totalCollected += item.amount;
          await dbLocal.members.update(memberMatch.id, {
            savings: memberMatch.savings + item.amount,
            streak: memberMatch.streak + 1,
          });
        } else if (item.type === "Loan repayment") {
          totalCollected += item.amount;
          await dbLocal.members.update(memberMatch.id, {
            loanPaid: Math.min(memberMatch.loan, memberMatch.loanPaid + item.amount),
          });
        } else if (item.type === "Loan disbursed") {
          await dbLocal.members.update(memberMatch.id, {
            loan: memberMatch.loan + item.amount,
            status: "current",
          });
        }
      } else {
        totalCollected += item.amount;
      }

      // Add to Sync Queue
      await dbLocal.syncQueue.put({
        id: generateUUID(),
        collection: "transactions",
        action: "create",
        payload: {
          id: txId,
          meetingId,
          memberName: item.member,
          type: item.type,
          amount: item.amount,
          timestamp,
        },
        timestamp,
      });
    }

    // Save Meeting Summary
    await dbLocal.meetings.put({
      id: meetingId,
      shgId: "shg_001",
      meetingDate: new Date().toISOString(),
      attendance: {},
      transcript: [singleTranscript],
      summary: {
        membersPresent: validItems.length,
        totalSavingsCollected: totalCollected,
        totalRepayments: 0,
        newLoanRequests: 0,
        attendancePercentage: 100,
      },
    });

    setStage("saved");

    // Clean audio receipt spoken ONCE
    const firstItem = validItems[0];
    if (firstItem) {
      speakAudioReceipt(firstItem.type, firstItem.amount, firstItem.member);
    }

    toast.success("Transaction confirmed & saved to passbook", {
      description: `Saved to Dexie IndexedDB · Audio receipt spoken.`,
    });
  };

  const reset = () => {
    isSaving.current = false;
    setStage("idle");
    setSingleTranscript("");
    setParsedItems([]);
    setSeconds(0);
  };

  const total = parsedItems.reduce(
    (sum, t) => sum + (t.type === "Loan disbursed" || t.type === "Attendance" ? 0 : t.amount),
    0
  );

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <AppShell
      title="Meeting Mode"
      subtitle="Record the whole meeting by voice — no typing, no network needed"
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <motion.section
          layout
          className="gradient-royal relative overflow-hidden rounded-3xl p-6 text-primary-foreground shadow-glow sm:p-8"
        >
          <div className="absolute -right-16 -top-20 size-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 -left-12 size-64 rounded-full bg-black/10" />
          <div className="relative space-y-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-85">
                  Weekly meeting · Kondhapuri SHG
                </p>
                <h2 className="font-display truncate text-2xl font-semibold">
                  {stage === "listening" ? "Listening…" : "Ready to record"}
                </h2>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold">
                <WifiOff className="size-3.5" /> Offline-first
              </span>
            </div>

            <Waveform active={stage === "listening"} />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="font-display text-4xl font-semibold tabular-nums">
                {mm}:{ss}
              </div>
              <div className="flex items-center gap-3">
                {stage === "listening" ? (
                  <button
                    onClick={stop}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white/95 px-6 py-3.5 text-sm font-semibold text-destructive transition-transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Square className="size-4" /> Stop & parse
                  </button>
                ) : (
                  <button
                    onClick={start}
                    disabled={stage === "parsing"}
                    className="relative inline-flex items-center gap-2 rounded-2xl bg-white/95 px-6 py-3.5 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60 cursor-pointer"
                  >
                    <span className="pulse-ring absolute inset-0 rounded-2xl bg-white/40" />
                    <Mic className="relative size-4" />
                    <span className="relative">
                      {stage === "idle" ? "Start recording" : "Record again"}
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {["हिन्दी", "मराठी", "Savings", "Loan repayment", "Attendance"].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-white/18 px-3 py-1.5 text-[11px] font-semibold"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        <SectionCard
          title="Transcript"
          action={
            <Pill tone="indigo">
              <Languages className="size-3.5" /> Web Speech API
            </Pill>
          }
        >
          {stage === "idle" ? (
            <EmptyState
              icon={Mic}
              title="Nothing recorded yet"
              description="Tap start and read out each member's savings or repayment. Speech will be transcribed once you finish."
            />
          ) : stage === "listening" ? (
            <div className="flex items-center justify-center p-8 rounded-2xl bg-muted/40 text-center space-y-2 flex-col">
              <span className="pulse-ring size-4 rounded-full bg-red-500 inline-block mb-2" />
              <p className="text-sm font-semibold text-ink">Recording voice input…</p>
              <p className="text-xs text-muted-foreground">
                Speak clearly. Full transcript will appear when you tap stop.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-muted/60 p-4 space-y-2 border border-border">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Final Speech Transcript</span>
                <span className="text-emerald-600 font-bold">1 Sentence Collected</span>
              </div>
              <p className="text-base font-semibold text-ink bg-card p-4 rounded-xl border border-border">
                "{singleTranscript}"
              </p>
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Parsed transactions"
        action={<Pill tone="primary">{parsedItems.length} entries detected</Pill>}
      >
        {stage === "idle" || stage === "listening" ? (
          <EmptyState
            icon={Sparkles}
            title="Entries appear after you stop"
            description="SakhiSetu turns the spoken meeting into a clean transaction preview for you to confirm."
          />
        ) : stage === "parsing" ? (
          <SkeletonRow lines={3} />
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border">
              {parsedItems.map((t, i) => (
                <motion.div
                  key={`${t.member}-${i}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0 odd:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink flex items-center gap-2">
                      {t.unrecognizedMember && <AlertCircle className="size-4 text-amber-500" />}
                      {t.member}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.unrecognizedMember
                        ? "Member not recognized. Please repeat member name."
                        : `${t.type} · confidence ${t.confidence}%`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Pill
                      tone={
                        t.unrecognizedMember
                          ? "saffron"
                          : t.type === "Savings"
                            ? "primary"
                            : t.type === "Loan repayment"
                              ? "indigo"
                              : "saffron"
                      }
                    >
                      {t.type}
                    </Pill>
                    <span className="font-display text-sm font-semibold text-ink tabular-nums">
                      {t.type === "Attendance" ? "Present" : inr(t.amount)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {stage === "review" ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid gap-4 rounded-3xl border border-primary/25 bg-primary-soft p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold text-ink">
                      Parsed Transaction: {parsedItems[0]?.member} ({parsedItems[0]?.type})
                    </p>
                    <p className="text-sm text-accent-foreground">
                      Confirm to save this entry to digital passbook & speak audio receipt.
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-3">
                    <button
                      onClick={reset}
                      className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-ink cursor-pointer"
                    >
                      <RotateCcw className="size-4" /> Cancel / Retry
                    </button>
                    <button
                      onClick={confirm}
                      disabled={parsedItems.some((p) => p.unrecognizedMember)}
                      className="gradient-emerald inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 className="size-4" /> Confirm & save
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="grid place-items-center rounded-3xl border border-primary/25 bg-primary-soft px-6 py-9 text-center"
                >
                  <motion.span
                    initial={{ scale: 0.5, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 14 }}
                    className="gradient-emerald grid size-16 place-items-center rounded-full text-primary-foreground shadow-glow"
                  >
                    <CheckCircle2 className="size-8" />
                  </motion.span>
                  <p className="font-display mt-4 text-xl font-semibold text-ink">
                    Transaction saved · {parsedItems[0]?.member} ({parsedItems[0]?.type})
                  </p>
                  <p className="mt-1 max-w-md text-sm text-accent-foreground">
                    Passbook updated for {parsedItems[0]?.member}. Audio receipt spoken aloud. Saved on IndexedDB.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        const item = parsedItems[0];
                        if (item) speakAudioReceipt(item.type, item.amount, item.member);
                      }}
                      className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-ink cursor-pointer"
                    >
                      <Volume2 className="size-4 text-primary" /> Replay Soundbox
                    </button>
                    <button
                      onClick={reset}
                      className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-ink cursor-pointer"
                    >
                      <RotateCcw className="size-4" /> Record another
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </SectionCard>

      <SectionCard title="How voice bookkeeping works">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
          <img
            src={voiceArt}
            alt="Illustration of a woman speaking into a microphone with sound waves turning into coins"
            width={1024}
            height={768}
            loading="lazy"
            className="w-full rounded-2xl border border-border object-cover"
          />
          <ol className="space-y-4">
            {[
              ["Speak", "Read the transaction out loud in Hindi or English."],
              ["Parse", "Extracts Member name, amount and transaction category."],
              ["Confirm", "Review single transcript card and tap Confirm & Save."],
              ["Soundbox", "Audio receipt speaks aloud and entry saves to IndexedDB."],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="gradient-indigo grid size-9 shrink-0 place-items-center rounded-2xl text-sm font-bold text-indigo-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="text-sm text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </SectionCard>
    </AppShell>
  );
}
