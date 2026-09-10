import { motion } from "motion/react";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  emerald: "gradient-emerald text-primary-foreground",
  indigo: "gradient-indigo text-indigo-foreground",
  saffron: "gradient-saffron text-saffron-foreground",
  royal: "gradient-royal text-primary-foreground",
} as const;

export type StatTone = keyof typeof tones;

export function StatCard({
  label,
  value,
  caption,
  delta,
  icon: Icon,
  tone = "emerald",
  index = 0,
}: {
  label: string;
  value: string;
  caption: string;
  delta?: number;
  icon: LucideIcon;
  tone?: StatTone;
  index?: number;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      className={cn(
        "relative overflow-hidden rounded-3xl p-5 shadow-glow",
        tones[tone],
      )}
    >
      <div className="absolute -right-10 -top-12 size-36 rounded-full bg-white/15" />
      <div className="absolute -bottom-14 -left-8 size-32 rounded-full bg-black/10" />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-85">{label}</p>
          <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-white/20">
            <Icon className="size-[18px]" />
          </span>
        </div>
        <p className="font-display text-3xl font-semibold leading-none">{value}</p>
        <div className="flex items-center gap-2 text-xs opacity-90">
          {delta !== undefined && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 font-semibold">
              {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {Math.abs(delta)}%
            </span>
          )}
          <span className="truncate">{caption}</span>
        </div>
      </div>
    </motion.div>
  );
}
