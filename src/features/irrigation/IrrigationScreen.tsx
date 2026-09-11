import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/cards/Cards";
import { PrimaryButton, SecondaryButton, GhostButton, LoadingState } from "../../components/ui/Primitives";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { useApp } from "../../app/AppState";
import { services } from "../../services";
import type { IrrigationRecommendation } from "../../types/domain";

export function IrrigationScreen() {
  const navigate = useNavigate();
  const { farm, showToast } = useApp();
  const [rec, setRec] = useState<IrrigationRecommendation | null>(null);
  useEffect(() => { services.irrigation.getRecommendation(farm.id).then(setRec); }, [farm.id]);
  if (!rec) return <LoadingState label="Analyzing soil and weather..." />;

  return (
    <div className="view-enter pb-4">
      <ScreenHeader title="Smart Irrigation Advisor" back="/dashboard" />
      <div className="px-5 flex flex-col gap-3.5">
        <Card className={rec.recommended ? "bg-[#E7F5EC]" : "bg-[#FFF3E0]"} style={{ borderColor: rec.recommended ? "#BFE0CC" : "#F3D9A0" }}>
          <div className="font-[var(--font-head)] font-extrabold text-[18px]" style={{ color: rec.recommended ? "var(--color-primary)" : "#9A6B0A" }}>
            {rec.recommended ? "💧" : "🌧️"} {rec.headline}
          </div>
          <div className="text-[13px] mt-1" style={{ color: rec.recommended ? "var(--color-primary)" : "#9A6B0A" }}>{rec.windowLabel}</div>
        </Card>
        <Card>
          <div className="font-[var(--font-head)] font-bold text-[15px]">Reason</div>
          <p className="text-[13px] text-[#5E7568] mt-1.5">{rec.reason}</p>
        </Card>
        <Card>
          <div className="flex justify-between"><span className="text-[13px] text-[#5E7568]">Current Soil Moisture</span><b>{rec.currentMoisturePct}%</b></div>
          <div className="h-2 bg-[var(--color-mist)] rounded-md mt-2 overflow-hidden relative">
            <div className="h-full bg-[var(--color-secondary)]" style={{ width: `${rec.currentMoisturePct}%` }} />
            <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-[var(--color-dark)]/40" style={{ left: `${rec.recommendedRangePct[0]}%` }} />
            <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-[var(--color-dark)]/40" style={{ left: `${rec.recommendedRangePct[1]}%` }} />
          </div>
          <div className="text-[11.5px] text-[#8AA093] mt-1.5">Recommended range: {rec.recommendedRangePct[0]}–{rec.recommendedRangePct[1]}%</div>
          <div className="text-[13px] text-[#5E7568] mt-3">🌦️ {rec.weatherNote}</div>
        </Card>
        <SecondaryButton onClick={() => navigate("/farm")}>View Field</SecondaryButton>
        <GhostButton onClick={() => navigate("/advisory")}>Ask AI Advisor</GhostButton>
        <PrimaryButton onClick={() => showToast("Reminder set for the next irrigation window")}>Set Reminder</PrimaryButton>
      </div>
    </div>
  );
}
