import { motion } from "motion/react";

const bars = Array.from({ length: 44 }, (_, i) => i);

export function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-24 items-center justify-center gap-1.5">
      {bars.map((i) => {
        const base = 12 + ((i * 37) % 46);
        return (
          <motion.span
            key={i}
            className="w-1.5 rounded-full bg-white/85"
            animate={
              active
                ? { height: [base * 0.35, base * 1.5, base * 0.6, base * 1.25, base * 0.4] }
                : { height: 8 }
            }
            transition={
              active
                ? {
                    duration: 1.1 + (i % 5) * 0.13,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                  }
                : { duration: 0.3 }
            }
            style={{ height: 8 }}
          />
        );
      })}
    </div>
  );
}
