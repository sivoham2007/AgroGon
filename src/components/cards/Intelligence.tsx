import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../ui/Icon";
import { Card } from "./Cards";
import type { AIExplanation, PriorityAction, ActionUrgency } from "../../types/domain";

export function ExplainableAIPanel({ explanation }: { explanation: AIExplanation }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <Icon name="gauge" className="w-4 h-4 text-[var(--color-primary)]" />
        <div className="font-[var(--font-head)] font-bold text-[15px]">Why this recommendation?</div>
      </div>
      <div className="text-[13px] text-[#5E7568] mb-3">{explanation.title}</div>
      <div className="flex flex-col gap-3">
        {explanation.factors.map((f) => (
          <div key={f.label}>
            <div className="flex justify-between text-[12.5px] mb-1">
              <b>{f.label}</b>
              <span className="text-[#5E7568]">{f.impact}</span>
            </div>
            <div className="h-2 bg-[var(--color-mist)] rounded-md overflow-hidden">
              <div
                className="h-full rounded-md"
                style={{
                  width: `${f.weightPct}%`,
                  background: f.impact === "High Impact" ? "var(--color-danger)" : f.impact === "Medium Impact" ? "var(--color-warning)" : "var(--color-secondary)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[13px] text-[#5E7568] bg-[var(--color-mist-2)] rounded-xl p-3">{explanation.plainLanguageSummary}</div>
    </Card>
  );
}

const URGENCY_STYLE: Record<ActionUrgency, { bg: string; fg: string; label: string }> = {
  low: { bg: "#E7F5EC", fg: "var(--color-primary)", label: "Low" },
  medium: { bg: "#FDF3DB", fg: "#9A6B0A", label: "Medium" },
  high: { bg: "#FBE8E7", fg: "var(--color-danger)", label: "High" },
  critical: { bg: "#FBE8E7", fg: "var(--color-danger)", label: "Critical" },
};

export function PriorityActionCard({ action, extra }: { action: PriorityAction; extra?: ReactNode }) {
  const navigate = useNavigate();
  const style = URGENCY_STYLE[action.urgency];
  return (
    <Card className="flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-[#8AA093]">PRIORITY {action.priority}</span>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: style.bg, color: style.fg }}>{style.label.toUpperCase()}</span>
      </div>
      <div className="font-[var(--font-head)] font-bold text-[15px]">{action.icon} {action.title}</div>
      <div className="text-[13px] text-[#5E7568]"><b className="text-[var(--color-dark)]">Reason:</b> {action.reason}</div>
      <div className="text-[12.5px] text-[var(--color-primary)] font-semibold">{action.estimatedImpact}</div>
      <div className="flex gap-2 flex-wrap pt-1">
        {action.linkTo && (
          <button className="text-[12px] font-bold px-3 py-2 rounded-lg bg-[var(--color-mist-2)] border border-[var(--color-mist)]" onClick={() => navigate(action.linkTo!)}>
            View Details
          </button>
        )}
        <button className="text-[12px] font-bold px-3 py-2 rounded-lg bg-[var(--color-mist-2)] border border-[var(--color-mist)]" onClick={() => navigate("/advisory")}>
          Ask AI
        </button>
        {action.zoneId && (
          <button className="text-[12px] font-bold px-3 py-2 rounded-lg bg-[var(--color-primary)] text-white" onClick={() => navigate("/drone")}>
            Create Drone Mission
          </button>
        )}
      </div>
      {extra}
    </Card>
  );
}
