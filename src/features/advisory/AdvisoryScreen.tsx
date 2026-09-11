import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { useApp } from "../../app/AppState";
import { useT } from "../../i18n/useT";
import { services } from "../../services";
import type { ChatMessage } from "../../types/domain";

export function AdvisoryScreen() {
  useNavigate();
  const { farmer } = useApp();
  const t = useT();
  const [chat, setChat] = useState<ChatMessage[]>([
    { who: "bot", text: t("advisory_thathaGreeting").replace("{name}", farmer.name) },
  ]);
  const [topics, setTopics] = useState<{ label: string; reply: string }[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => { services.advisory.quickTopics().then(setTopics); }, []);

  async function ask(text: string) {
    if (!text.trim()) return;
    setChat((c) => [...c, { who: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const reply = await services.advisory.send(farmer.id, text, farmer.preferredLanguage);
      setChat((c) => [...c, reply]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="view-enter flex flex-col h-full bg-[#FAFAF8]">
      <ScreenHeader title={t("advisory_title")} back="/dashboard" eyebrow={t("advisory_eyebrow")} />
      
      {/* Thatha Assistant Profile Header */}
      <div className="px-5 py-3 flex items-center justify-center gap-4 bg-white border-b border-[var(--color-mist)] mb-2 shadow-sm">
        <div className="w-[60px] h-[60px] rounded-full border-[3px] border-[var(--color-primary)] overflow-hidden shadow-md">
          <img src="/assets/thatha.jpg" alt="Thatha AI Assistant" className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="font-[var(--font-head)] font-extrabold text-[18px] text-[var(--color-dark)]">Thatha AI</div>
          <div className="text-[12px] text-[var(--color-primary)] font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
            Online & Ready to Help
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-3.5">
        {chat.map((m, i) => (
          <div key={i} className={`flex gap-3 max-w-[85%] ${m.who === "bot" ? "self-start" : "self-end flex-row-reverse"}`}>
            {m.who === "bot" && (
              <div className="w-8 h-8 rounded-full border border-[var(--color-mist)] overflow-hidden flex-none shadow-sm">
                <img src="/assets/thatha.jpg" alt="Thatha" className="w-full h-full object-cover" />
              </div>
            )}
            <div className={`px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed shadow-sm ${m.who === "bot" ? "bg-white border border-[var(--color-mist)] rounded-tl-[4px]" : "bg-[var(--color-primary)] text-white rounded-tr-[4px]"}`}>
              {m.text}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex gap-3 self-start max-w-[85%] items-end">
            <div className="w-8 h-8 rounded-full border border-[var(--color-mist)] overflow-hidden flex-none">
              <img src="/assets/thatha.jpg" alt="Thatha" className="w-full h-full object-cover grayscale opacity-70" />
            </div>
            <div className="text-[12px] text-[#8AA093] italic bg-white px-3 py-1.5 rounded-2xl rounded-bl-[4px] border border-[var(--color-mist)]">{t("advisory_botTyping")}</div>
          </div>
        )}
      </div>
      <div className="px-5 flex gap-2 overflow-x-auto pb-2">
        {topics.map((t) => (
          <div key={t.label} className="bg-[var(--color-mist-2)] border border-[var(--color-mist)] rounded-full px-3.5 py-2 text-[12.5px] font-semibold whitespace-nowrap cursor-pointer"
            onClick={() => ask(t.label)}>{t.label}</div>
        ))}
      </div>
      <div className="px-5 pb-4">
        <div className="flex gap-2.5">
          <input
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask(input)}
            className="flex-1 border-[1.5px] border-[var(--color-mist)] rounded-full px-4 py-3 bg-[var(--color-mist-2)] text-[13.5px] outline-none focus:border-[var(--color-secondary)] transition-all shadow-inner"
            placeholder={t("advisory_inputPlaceholder")}
          />
          <button className="w-[38px] h-[38px] rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center" onClick={() => ask(input)}>
            <Icon name="chat" className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
