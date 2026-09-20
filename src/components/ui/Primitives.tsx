import type { ButtonHTMLAttributes, ReactNode } from "react";

export function PrimaryButton({ children, className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`w-full flex items-center justify-center gap-2 rounded-2xl px-5 py-4 font-[var(--font-head)] font-bold text-white
      bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] shadow-[0_10px_20px_rgba(27,127,76,0.28)]
      active:scale-[0.98] transition-transform ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`w-full flex items-center justify-center gap-2 rounded-2xl px-5 py-4 font-[var(--font-head)] font-bold
      text-[var(--color-primary)] bg-white border-[1.5px] border-[var(--color-primary)] active:scale-[0.98] transition-transform ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className = "", ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button className={`w-full flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold text-sm text-[#5E7568] ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Field({ label, className = "", ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-[12.5px] font-semibold text-[var(--color-dark)]">{label}</span>}
      <input
        className={`border-[1.5px] border-[var(--color-mist)] bg-[var(--color-mist-2)] rounded-xl px-3.5 py-3 text-[14.5px] outline-none focus:border-[var(--color-secondary)] focus:bg-white transition-colors ${className}`}
        {...rest}
      />
    </label>
  );
}

export function Pill({ level, children }: { level: "low" | "medium" | "high" | "neutral"; children: ReactNode }) {
  const styles: Record<string, string> = {
    low: "bg-[#E7F5EC] text-[var(--color-primary)]",
    medium: "bg-[#FDF3DB] text-[#9A6B0A]",
    high: "bg-[#FBE8E7] text-[var(--color-danger)]",
    neutral: "bg-[var(--color-mist-2)] text-[#5E7568]",
  };
  const dot: Record<string, string> = { low: "#2E9D68", medium: "#E8A317", high: "#D9534F", neutral: "#8AA093" };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-full ${styles[level]}`}>
      <span className="w-[7px] h-[7px] rounded-full" style={{ background: dot[level] }} />
      {children}
    </span>
  );
}

export function Gauge({ pct, size = 88, stroke = 9, label, color }: { pct: number; size?: number; stroke?: number; label?: string; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  const col = color || (pct >= 70 ? "#2E9D68" : pct >= 40 ? "#E8A317" : "#D9534F");
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke="#E4ECE6" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} stroke={col} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.22,.9,.32,1)" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-[var(--font-head)] font-extrabold text-[var(--color-dark)]" style={{ fontSize: size * 0.26 }}>{pct}%</div>
        {label && <div className="text-[10.5px] font-semibold text-[#5E7568]">{label}</div>}
      </div>
    </div>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-[#8AA093]">
      <div className="w-10 h-10 rounded-full border-[3px] border-[var(--color-mist)] border-t-[var(--color-primary)] animate-spin" />
      <span className="text-[13px] font-medium">{label}</span>
    </div>
  );
}

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center px-6">
      <div className="text-[14px] text-[#5E7568]">{title}</div>
      {action}
    </div>
  );
}

export function ErrorState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center px-6">
      <div className="text-[14px] text-[var(--color-danger)] font-semibold">{title}</div>
      {action}
    </div>
  );
}

export function Toast({ message }: { message: string }) {
  return (
    <div className="absolute left-4 right-4 bottom-24 bg-[var(--color-dark)] text-white px-4 py-3 rounded-2xl text-[13px]
      flex items-center gap-2.5 shadow-2xl z-50" style={{ animation: "viewIn .3s ease" }}>
      <span className="text-[var(--color-accent)]"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg></span>
      <span>{message}</span>
    </div>
  );
}

export function Select({ label, className = "", children, ...rest }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 relative">
      <span className="text-[12.5px] font-semibold text-[var(--color-dark)]">{label}</span>
      <select
        className={`border-[1.5px] border-[var(--color-mist)] bg-[var(--color-mist-2)] rounded-xl px-3.5 py-3 text-[14.5px] outline-none focus:border-[var(--color-secondary)] focus:bg-white transition-colors appearance-none w-full ${className}`}
        {...rest}
      >
        {children}
      </select>
      <div className="absolute right-4 bottom-[14px] pointer-events-none">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8AA093" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </div>
    </label>
  );
}

// Aliases for standard components used by advanced features
export { PrimaryButton as Button, Field as Input };
