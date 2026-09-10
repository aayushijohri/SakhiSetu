import { motion } from "motion/react";

export function ProgressRing({
  value,
  max = 100,
  size = 96,
  thickness = 9,
  label,
  sublabel,
  gradientId = "sakhiRing",
}: {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  label?: string;
  sublabel?: string;
  gradientId?: string;
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="60%" stopColor="var(--indigo)" />
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
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute w-[160%] text-center">
        {label && (
          <p className="font-display text-lg font-semibold leading-none text-ink">{label}</p>
        )}
        {sublabel && <p className="mt-1 text-[10px] text-muted-foreground">{sublabel}</p>}
      </div>
    </div>
  );
}
