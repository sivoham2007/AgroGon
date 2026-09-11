export function LogoBadge({ size = 40 }: { size?: number }) {
  return (
    <div
      className="rounded-2xl flex items-center justify-center flex-none overflow-hidden"
      style={{ width: size, height: size, background: "radial-gradient(circle at 40% 30%, #1E5B3C, #0F2A1D)" }}
    >
      <img src="/images/agrogon-emblem.png" alt="AgroGon" className="w-[86%] h-[86%] object-contain" />
    </div>
  );
}

export function Wordmark({ size = 18 }: { size?: number }) {
  return (
    <span className="font-[var(--font-head)] font-extrabold text-[var(--color-dark)]" style={{ fontSize: size }}>
      AgroGon
    </span>
  );
}

export function BrandLockup({ badgeSize = 40, textSize = 18 }: { badgeSize?: number; textSize?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoBadge size={badgeSize} />
      <Wordmark size={textSize} />
    </div>
  );
}
