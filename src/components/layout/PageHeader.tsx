import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../ui/Icon";

export function PageHeader({ title, eyebrow, back, right }: { title: string; eyebrow?: string; back?: string; right?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-3 mb-5">
      {back && (
        <button className="w-[38px] h-[38px] rounded-xl bg-white border border-[var(--color-mist)] flex items-center justify-center flex-none" onClick={() => navigate(back)}>
          <Icon name="back" className="w-[18px] h-[18px]" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        {eyebrow && <div className="font-[var(--font-mono)] text-[10.5px] tracking-[1.4px] uppercase text-[var(--color-secondary)] font-semibold truncate">{eyebrow}</div>}
        <div className="font-[var(--font-head)] font-extrabold text-[22px] sm:text-[26px] text-[var(--color-dark)]">{title}</div>
      </div>
      {right}
    </div>
  );
}
