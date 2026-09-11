import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { Card } from "../../components/cards/Cards";
import { PrimaryButton, LoadingState } from "../../components/ui/Primitives";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { useApp } from "../../app/AppState";
import { services } from "../../services";
import { SEED_ZONES } from "../../data/seedData";
import type { DigitalTwinLayer, DigitalTwinLayerId } from "../../types/domain";

export function DigitalTwinScreen() {
  const navigate = useNavigate();
  const { farm } = useApp();
  const [layers, setLayers] = useState<DigitalTwinLayer[] | null>(null);
  const [on, setOn] = useState<Set<DigitalTwinLayerId>>(new Set());

  useEffect(() => {
    services.digitalTwin.getLayers().then((l) => {
      setLayers(l);
      setOn(new Set(l.filter((x) => x.defaultOn).map((x) => x.id)));
    });
  }, []);

  function toggle(id: DigitalTwinLayerId) {
    setOn((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (!layers) return <LoadingState label="Building your farm's digital twin..." />;

  return (
    <div className="view-enter pb-4">
      <ScreenHeader title="Farm Digital Twin" back="/dashboard" eyebrow={farm.name.toUpperCase()} />
      <div className="px-5">
        <div className="relative rounded-2xl overflow-hidden border border-[var(--color-mist)] h-[230px]"
          style={{ background: "repeating-linear-gradient(0deg,#DCEBE1 0 2px,transparent 2px 18px),repeating-linear-gradient(90deg,#DCEBE1 0 2px,transparent 2px 18px),#EAF3EC" }}>
          {SEED_ZONES.map((z) => (
            <div key={z.id} className="absolute rounded-lg flex flex-col items-center justify-center text-white font-mono text-[10px] font-bold"
              style={{ top: z.top, left: z.left, width: z.width, height: z.height, background: z.color, opacity: on.has("disease") || on.has("health") || on.has("treatment") ? 0.9 : 0.35 }}>
              <span>{z.id}</span>
              {on.has("sensor") && z.id === "D" && <span className="text-[8px]">📡</span>}
              {on.has("drone") && z.id === "D" && <span className="text-[10px]">🚁</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 pt-3.5">
        <div className="font-[var(--font-head)] font-bold text-[15px] mb-2">Layers</div>
        <div className="flex flex-wrap gap-2">
          {layers.map((l) => (
            <button
              key={l.id}
              onClick={() => toggle(l.id)}
              className={`text-[12px] font-bold px-3 py-2 rounded-full border transition-colors ${on.has(l.id) ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]" : "bg-white text-[#5E7568] border-[var(--color-mist)]"}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pt-4">
        <Card>
          <div className="font-[var(--font-head)] font-bold text-[15px] mb-2">Connected Intelligence</div>
          <div className="text-[13px] text-[#5E7568] leading-relaxed">
            AI Scan <Icon name="chev" className="w-3 h-3 inline mx-1" /> Disease Result <Icon name="chev" className="w-3 h-3 inline mx-1" /> Risk Zone <Icon name="chev" className="w-3 h-3 inline mx-1" /> Treatment Zone <Icon name="chev" className="w-3 h-3 inline mx-1" /> Drone Mission
          </div>
          <div className="text-[13px] text-[#5E7568] mt-2">Zone D was flagged by today's crop scan and is now the active treatment target — reflected live across Risk, Treatment, and Drone.</div>
        </Card>
      </div>
      <div className="px-5 pt-3.5">
        <PrimaryButton onClick={() => navigate("/treatment/zone/D")}>Open Zone D Detail</PrimaryButton>
      </div>
    </div>
  );
}
