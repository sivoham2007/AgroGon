import type { ReactNode, CSSProperties } from "react";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Icon } from "../ui/Icon";
import { Pill } from "../ui/Primitives";
import type { RiskLevel } from "../../types/domain";

// Fix Leaflet's default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export function Card({ children, className = "", tight = false, onClick, style }: { children: ReactNode; className?: string; tight?: boolean; onClick?: () => void; style?: CSSProperties }) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`bg-white rounded-[20px] ${tight ? "p-3.5" : "p-4"} shadow-[0_2px_8px_rgba(18,53,42,0.06)] border border-[var(--color-mist)] ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({ icon, label, value, level }: { icon: Parameters<typeof Icon>[0]["name"]; label: string; value: ReactNode; level?: RiskLevel }) {
  return (
    <Card tight className="flex-1 min-w-[44%]">
      <div className="text-[13px] text-[#5E7568] flex items-center gap-1.5"><Icon name={icon} className="w-4 h-4" />{label}</div>
      <div className="mt-1.5">{level ? <Pill level={level}>{level.toUpperCase()}</Pill> : <div className="font-[var(--font-head)] font-bold text-[15px]">{value}</div>}</div>
    </Card>
  );
}

export function AlertCard({ icon, severity, title, meta, time }: { icon: Parameters<typeof Icon>[0]["name"]; severity: RiskLevel; title: string; meta: string; time: string }) {
  const bg = severity === "high" ? "#FBE8E7" : severity === "medium" ? "#FDF3DB" : "#E7F5EC";
  const fg = severity === "high" ? "var(--color-danger)" : severity === "medium" ? "#9A6B0A" : "var(--color-primary)";
  const border = severity === "high" ? "var(--color-danger)" : severity === "medium" ? "var(--color-warning)" : "var(--color-secondary)";
  return (
    <Card tight className="flex gap-2.5 items-start" >
      <div style={{ borderLeft: `3px solid ${border}`, marginLeft: -14, paddingLeft: 11, display: "flex", gap: 10, alignItems: "flex-start", width: "100%" }}>
        <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-none" style={{ background: bg, color: fg }}>
          <Icon name={icon} className="w-[18px] h-[18px]" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between"><b className="text-[13.5px]">{title}</b><span className="text-[11px] text-[#5E7568]">{time}</span></div>
          <div className="text-[13px] text-[#5E7568]">{meta}</div>
        </div>
      </div>
    </Card>
  );
}

export function FieldMap({ height = 150 }: {
  zones: { id: string; color: string; top: string; left: string; width: string; height: string }[];
  height?: number;
  onZoneClick?: (id: string) => void;
  dimInactive?: string;
}) {
  // Center roughly on an agricultural area in India
  const center: [number, number] = [17.3850, 78.4867];
  
  // Create an approximate polygon for the farm
  const farmPolygon: [number, number][] = [
    [17.3850, 78.4860],
    [17.3850, 78.4874],
    [17.3860, 78.4874],
    [17.3860, 78.4860],
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[var(--color-mist)]" style={{ height }}>
      <MapContainer center={center} zoom={16} style={{ width: "100%", height: "100%" }} zoomControl={false} dragging={true} scrollWheelZoom={true}>
        {/* Esri World Imagery (Free Satellite View) */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        />
        <Polygon 
          positions={farmPolygon} 
          pathOptions={{ color: "var(--color-primary)", fillColor: "var(--color-primary)", fillOpacity: 0.3, weight: 2 }} 
        />
      </MapContainer>
    </div>
  );
}
