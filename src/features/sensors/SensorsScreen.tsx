import { useEffect, useState } from "react";
import { Gauge, LoadingState } from "../../components/ui/Primitives";
import { Card } from "../../components/cards/Cards";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { useApp } from "../../app/AppState";
import { useT } from "../../i18n/useT";
import { services } from "../../services";
import type { SensorReading } from "../../types/domain";

export function SensorsScreen() {
  const { farm } = useApp();
  const t = useT();
  const [sensor, setSensor] = useState<SensorReading | null>(null);
  useEffect(() => { services.sensor.getReading(farm.id).then(setSensor); }, [farm.id]);
  if (!sensor) return <LoadingState label={t("sensor_connecting")} />;

  const items = [
    { l: t("sensor_soilMoisture"), v: `${sensor.soilMoisturePct}%`, pct: sensor.soilMoisturePct },
    { l: t("sensor_temperature"), v: `${sensor.tempC}°C`, pct: Math.min(100, sensor.tempC * 2.2) },
    { l: t("sensor_humidity"), v: `${sensor.humidityPct}%`, pct: sensor.humidityPct },
    { l: t("sensor_soilPh"), v: sensor.ph, pct: (sensor.ph / 14) * 100 },
  ];

  return (
    <div className="view-enter pb-4">
      <ScreenHeader title={t("sensor_title")} back="/dashboard" />
      <div className="px-5">
        <Card tight className="flex justify-between items-center">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: sensor.online ? "var(--color-secondary)" : "var(--color-danger)" }} /><b>{sensor.online ? t("sensor_online") : t("sensor_offline")}</b></span>
          <span className="text-[13px] text-[#5E7568]">{t("sensor_synced")} {sensor.lastSyncedLabel}</span>
        </Card>
      </div>
      <div className="px-5 pt-3.5 grid grid-cols-2 gap-2.5">
        {items.map((it) => (
          <Card key={it.l} className="text-center items-center">
            <div className="text-[13px] text-[#5E7568] mb-1.5">{it.l}</div>
            <div className="flex justify-center"><Gauge pct={Math.round(it.pct)} size={88} stroke={8} /></div>
            <div className="font-[var(--font-head)] font-bold text-[15px] mt-2">{it.v}</div>
          </Card>
        ))}
      </div>
      <div className="px-5 pt-3.5">
        <Card tight className="text-[13px] text-[#5E7568]">☀️ {t("sensor_light")}: <b className="text-[var(--color-dark)]">{sensor.light}</b></Card>
      </div>
    </div>
  );
}
