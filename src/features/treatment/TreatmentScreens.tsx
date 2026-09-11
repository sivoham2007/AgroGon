import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { Card, FieldMap } from "../../components/cards/Cards";
import { ExplainableAIPanel } from "../../components/cards/Intelligence";
import { PrimaryButton, SecondaryButton, LoadingState } from "../../components/ui/Primitives";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { useApp } from "../../app/AppState";
import { services } from "../../services";
import type { TreatmentZone, AIExplanation } from "../../types/domain";

export function TreatmentScreen() {
  const navigate = useNavigate();
  const { farm } = useApp();
  const [zones, setZones] = useState<TreatmentZone[] | null>(null);
  useEffect(() => { services.treatment.getZones(farm.id).then(setZones); }, [farm.id]);
  if (!zones) return <LoadingState label="Building treatment map..." />;

  return (
    <div className="view-enter pb-4">
      <ScreenHeader title="Precision Treatment Map" back="/dashboard" eyebrow={`${farm.areaAcres} acres`} />
      <div className="px-5">
        <FieldMap zones={zones} height={220} onZoneClick={(id) => navigate(`/treatment/zone/${id}`)} />
      </div>
      <div className="px-5 pt-3.5 flex flex-col gap-2.5">
        {zones.map((z) => (
          <Card key={z.id} tight className="flex justify-between items-center" onClick={() => navigate(`/treatment/zone/${z.id}`)}>
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-[4px] inline-block" style={{ background: z.color }} />
              <div><b className="text-[13.5px]">{z.label}</b><div className="text-[13px] text-[#5E7568]">{z.condition}</div></div>
            </div>
            <span className="text-[#8AA093]"><Icon name="chev" className="w-4 h-4" /></span>
          </Card>
        ))}
        <PrimaryButton onClick={() => navigate("/drone")}><Icon name="drone" className="w-4 h-4" /> Create Treatment Plan</PrimaryButton>
      </div>
    </div>
  );
}

export function ZoneDetailScreen() {
  const navigate = useNavigate();
  const { zoneId } = useParams();
  const { farm } = useApp();
  const [zones, setZones] = useState<TreatmentZone[] | null>(null);
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  useEffect(() => { services.treatment.getZones(farm.id).then(setZones); }, [farm.id]);
  useEffect(() => { services.explain.getDiseaseExplanation(farm.id).then(setExplanation); }, [farm.id]);
  if (!zones) return <LoadingState />;
  const z = zones.find((z) => z.id === zoneId) || zones[zones.length - 1];

  return (
    <div className="view-enter pb-4">
      <ScreenHeader title={z.label} back="/treatment" />
      <div className="px-5 flex flex-col gap-3.5">
        <Card style={{ borderLeft: `4px solid ${z.color}` }}>
          <div className="flex justify-between"><b>Condition</b><span>{z.condition}</span></div>
          <div className="flex justify-between mt-2"><b>Confidence</b><span className="font-mono">{z.confidencePct}%</span></div>
          <div className="flex justify-between mt-2"><b>Last detected</b><span>Today, 8:40 AM</span></div>
          <div className="flex justify-between mt-2"><b>Recommended monitoring</b><span>Every 2 days</span></div>
        </Card>
        <Card>
          <div className="font-[var(--font-head)] font-bold text-[15px]">Suggested action</div>
          <p className="text-[13px] text-[#5E7568] mt-1.5">{z.recommendedAction}</p>
        </Card>
        {explanation && <ExplainableAIPanel explanation={explanation} />}
        <SecondaryButton onClick={() => navigate(`/treatment/zone/${z.id}/impact`)}>View Crop Loss Prevention Estimate</SecondaryButton>
        <PrimaryButton onClick={() => navigate("/drone")}><Icon name="drone" className="w-4 h-4" /> Create Drone Mission for {z.label}</PrimaryButton>
      </div>
    </div>
  );
}
