import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";

export function QrPreview({
  seed = "SS-MH-2019-04871",
  size = 148,
}: {
  seed?: string;
  size?: number;
}) {
  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${encodeURIComponent(seed)}`
      : `https://sakhisetu.app/verify/${seed}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="surface grid place-items-center p-4 bg-card rounded-2xl border border-border"
    >
      <QRCodeSVG
        value={verifyUrl}
        size={size}
        level="H"
        includeMargin={false}
        fgColor="#0f172a"
      />
    </motion.div>
  );
}
