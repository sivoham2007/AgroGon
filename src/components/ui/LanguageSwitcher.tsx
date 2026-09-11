import { useState, useRef, useEffect } from "react";
import { useApp } from "../../app/AppState";
import { LANGUAGES } from "../../i18n/translations";
import { Icon } from "./Icon";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-full border border-[var(--color-mist)] bg-white font-semibold text-[var(--color-dark)] hover:border-[var(--color-secondary)] transition-colors ${compact ? "px-2.5 py-1.5 text-[12px]" : "px-3.5 py-2 text-[13px]"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Icon name="globe" className="w-4 h-4 text-[var(--color-primary)]" />
        {current.native}
        <Icon name="chev" className={`w-3 h-3 text-[#8AA093] transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-[var(--color-mist)] rounded-xl shadow-lg py-1.5 z-50" role="listbox">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              role="option"
              aria-selected={l.code === language}
              onClick={() => { setLanguage(l.code); setOpen(false); }}
              className={`w-full text-left px-3.5 py-2 text-[13px] flex items-center justify-between hover:bg-[var(--color-mist-2)] ${l.code === language ? "text-[var(--color-primary)] font-bold" : "text-[var(--color-dark)]"}`}
            >
              <span>{l.native}</span>
              <span className="text-[11px] text-[#8AA093]">{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
