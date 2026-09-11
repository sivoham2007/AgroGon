import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { Card, FieldMap } from "../../components/cards/Cards";
import { SecondaryButton, PrimaryButton } from "../../components/ui/Primitives";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { useApp } from "../../app/AppState";
import { useT } from "../../i18n/useT";
import { SEED_ZONES } from "../../data/seedData";
import { services } from "../../services";

export function FarmScreen() {
  const navigate = useNavigate();
  const { farmer, farm } = useApp();
  const t = useT();
  const rows: [string, string][] = [
    [t("farm_name"), farm.name], [t("farm_id"), farmer.farmerCode], [t("farm_area"), `${farm.areaAcres} acres`],
    [t("farm_crop"), farm.crop], [t("farm_variety"), farm.cropVariety], [t("farm_sowingDate"), farm.sowingDate],
    [t("farm_growthStage"), farm.growthStage], [t("farm_irrigation"), farm.irrigationType],
  ];
  return (
    <div className="view-enter pb-4">
      <ScreenHeader title={t("farm_title")} eyebrow={farmer.farmerCode} />
      <div className="px-5 flex flex-col gap-3.5">
        <FieldMap zones={SEED_ZONES} />
        <SecondaryButton onClick={() => navigate("/farm/land-map")}><Icon name="map" className="w-4 h-4" /> {t("farm_viewFullMap")}</SecondaryButton>
        <Card className="flex flex-col gap-2.5">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between"><span className="text-[13px] text-[#5E7568]">{k}</span><b className="text-[13.5px]">{v}</b></div>
          ))}
        </Card>
        <div className="font-[var(--font-head)] font-bold text-[15px]">{t("farm_fieldHealthOverlay")}</div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#2E9D68" }} /><span className="text-[13px] text-[#5E7568]">{t("farm_healthy")}</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#E8A317" }} /><span className="text-[13px] text-[#5E7568]">{t("farm_monitor")}</span></div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: "#D9534F" }} /><span className="text-[13px] text-[#5E7568]">{t("farm_highRisk")}</span></div>
        </div>
        <div className="h-px bg-[var(--color-mist)]" />
        <div className="font-[var(--font-head)] font-bold text-[15px]">{t("farm_registeredFields")}</div>
        <Card tight className="flex justify-between items-center"><div><b>Field 01</b><div className="text-[13px] text-[#5E7568]">Tomato</div></div><b>2.7 acres</b></Card>
        <Card tight className="flex justify-between items-center"><div><b>Field 02</b><div className="text-[13px] text-[#5E7568]">Rice</div></div><b>1.4 acres</b></Card>
        <button className="text-[#5E7568] text-[13px] font-semibold py-2" onClick={() => navigate("/farm/land-map")}>{t("farm_addField")}</button>
      </div>
    </div>
  );
}

export function LandMapScreen() {
  const navigate = useNavigate();
  const { farm, showToast } = useApp();
  const t = useT();
  const [points, setPoints] = useState<{ lat: number; lng: number }[]>([]);
  const [area, setArea] = useState(farm.areaAcres);
  const [saving, setSaving] = useState(false);

  function addPoint() {
    setPoints((p) => [...p, { lat: 13.43 + Math.random() * 0.01, lng: 77.71 + Math.random() * 0.01 }]);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await services.farm.saveBoundary(farm.id, points.length ? points : [{ lat: 0, lng: 0 }, { lat: 0, lng: 0 }, { lat: 0, lng: 0 }]);
      setArea(res.areaAcres);
      showToast("Farm successfully registered ✓");
      setTimeout(() => navigate("/farm"), 900);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="view-enter pb-4">
      <ScreenHeader title={t("farm_landMapping")} back="/farm" />
      <div className="px-5 flex flex-col gap-3.5">
        <div className="relative rounded-2xl overflow-hidden border border-[var(--color-mist)] h-[220px]"
          style={{ background: "repeating-linear-gradient(0deg,#DCEBE1 0 2px,transparent 2px 18px),repeating-linear-gradient(90deg,#DCEBE1 0 2px,transparent 2px 18px),#EAF3EC" }}
          onClick={addPoint}
        >
          <div className="absolute inset-3.5 border-[2.5px] border-dashed border-[var(--color-primary)] rounded-2xl" />
          {points.map((_, i) => (
            <div key={i} className="absolute w-2.5 h-2.5 bg-[var(--color-primary)] border-2 border-white rounded-full shadow"
              style={{ top: `${15 + (i * 17) % 60}%`, left: `${15 + (i * 23) % 65}%` }} />
          ))}
          <div className="absolute bottom-2.5 right-2.5 bg-white px-2.5 py-1 rounded-lg text-[11px] font-bold text-[var(--color-primary)] shadow">{area} acres</div>
        </div>
        <div className="flex gap-2.5">
          <button className="flex-1 rounded-xl px-3 py-2.5 text-[13px] font-bold text-[var(--color-primary)] bg-white border-[1.5px] border-[var(--color-primary)]" onClick={() => showToast("Using current GPS location")}>
            <Icon name="pin" className="w-4 h-4 inline mr-1" /> {t("farm_useGps")}
          </button>
          <button className="flex-1 rounded-xl px-3 py-2.5 text-[13px] font-bold text-[var(--color-primary)] bg-white border-[1.5px] border-[var(--color-primary)]" onClick={addPoint}>
            {t("farm_drawBoundary")}
          </button>
        </div>
        <Card tight className="text-[13px] text-[#5E7568]">{t("farm_mapInstructions")}</Card>
        <PrimaryButton disabled={saving} onClick={save}>{saving ? t("farm_saving") : t("farm_saveField")}</PrimaryButton>
      </div>
    </div>
  );
}
