import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../../components/cards/Cards";
import { PrimaryButton, LoadingState } from "../../components/ui/Primitives";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { services } from "../../services";
import type { ImpactEstimate } from "../../types/domain";

export function ImpactEstimatorScreen() {
  const navigate = useNavigate();
  const { zoneId = "D" } = useParams();
  const [est, setEst] = useState<ImpactEstimate | null>(null);
  const [showFactors, setShowFactors] = useState(false);
  useEffect(() => { services.impact.getEstimate(zoneId).then(setEst); }, [zoneId]);
  if (!est) return <LoadingState label="Calculating potential impact..." />;

  return (
    <div className="view-enter pb-4">
      <ScreenHeader title="Crop Loss Prevention" back={`/treatment/zone/${zoneId}`} eyebrow="ESTIMATED PROJECTION — NOT A GUARANTEE" />
      <div className="px-5 flex flex-col gap-3.5">
        <Card className="bg-[#FBE8E7]" style={{ borderColor: "#F3C7C5" }}>
          <div className="text-[12.5px] font-bold text-[var(--color-danger)]">Without Intervention</div>
          <div className="font-[var(--font-head)] font-extrabold text-[26px] text-[var(--color-danger)]">{est.withoutInterventionLoss} estimated loss</div>
        </Card>
        <Card className="bg-[#E7F5EC]" style={{ borderColor: "#BFE0CC" }}>
          <div className="text-[12.5px] font-bold text-[var(--color-primary)]">With Recommended Action</div>
          <div className="font-[var(--font-head)] font-extrabold text-[26px] text-[var(--color-primary)]">{est.withActionLoss} estimated loss</div>
        </Card>
        <Card className="text-white border-none" style={{ background: "linear-gradient(135deg,#1B7F4C,#12352A)" }}>
          <div className="text-[12.5px] opacity-80">Potentially Protected Value</div>
          <div className="font-[var(--font-head)] font-extrabold text-[30px]">{est.protectedValue}</div>
        </Card>
        <button className="text-[13px] font-bold text-[var(--color-primary)] text-left" onClick={() => setShowFactors((s) => !s)}>
          {showFactors ? "Hide" : "View"} Calculation Factors
        </button>
        {showFactors && (
          <Card className="flex flex-col gap-2">
            {est.factors.map((f) => (
              <div key={f.label} className="flex justify-between text-[13px]"><span className="text-[#5E7568]">{f.label}</span><b>{f.value}</b></div>
            ))}
          </Card>
        )}
        <div className="text-[11.5px] text-[#8AA093] text-center">
          {est.isDemoProjection ? "This is a modeled projection based on typical yield and price data — not a guaranteed outcome." : ""}
        </div>
        <PrimaryButton onClick={() => navigate("/drone")}>Create Drone Mission for This Zone</PrimaryButton>
      </div>
    </div>
  );
}
