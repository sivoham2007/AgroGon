import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { useT } from "../../i18n/useT";

export function OnboardingScreen() {
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();
  const t = useT();

  const SLIDES = [
    { step: "01", title: t("onboarding_slide1_title"), body: t("onboarding_slide1_desc"), bg: "#DCEEDF", icon: "scan" as const },
    { step: "02", title: t("onboarding_slide2_title"), body: t("onboarding_slide2_desc"), bg: "#E8F0E9", icon: "map" as const },
    { step: "03", title: t("onboarding_slide3_title"), body: t("onboarding_slide3_desc"), bg: "#EFE7D8", icon: "drone" as const },
  ];

  const s = SLIDES[idx];
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-[var(--color-mist)] overflow-hidden relative view-enter">
        <button className="absolute top-4 right-5 z-10 text-[#5E7568] text-[13px] font-semibold" onClick={() => navigate("/login")}>Skip</button>
        <div className="h-64 flex items-center justify-center relative overflow-hidden" style={{ background: s.bg }}>
          <div className="w-[140px] h-[140px] rounded-full bg-white flex items-center justify-center shadow-lg text-[var(--color-primary)]">
            <Icon name={s.icon} className="w-16 h-16" />
          </div>
        </div>
        <div className="flex gap-1.5 justify-center mt-4">
          {SLIDES.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-[var(--color-primary)]" : "w-1.5 bg-[var(--color-mist)]"}`} />
          ))}
        </div>
        <div className="px-8 pb-8 pt-3 text-center flex flex-col gap-3">
          <div className="font-[var(--font-mono)] text-[10.5px] tracking-[1.4px] uppercase text-[var(--color-secondary)] font-semibold">STEP {s.step}</div>
          <h1 className="font-[var(--font-head)] font-extrabold text-[26px] text-[var(--color-dark)]">{s.title}</h1>
          <p className="text-[13px] text-[#5E7568] leading-relaxed">{s.body}</p>
          <button
            className="mt-1 w-full flex items-center justify-center gap-2 rounded-2xl px-5 py-4 font-[var(--font-head)] font-bold text-white
            bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] shadow-[0_10px_20px_rgba(27,127,76,0.28)] active:scale-[0.98]"
            onClick={() => (idx < SLIDES.length - 1 ? setIdx(idx + 1) : navigate("/login"))}
          >
            {idx < SLIDES.length - 1 ? t("onboarding_next") : t("action_getStarted")}
            <Icon name="chev" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
