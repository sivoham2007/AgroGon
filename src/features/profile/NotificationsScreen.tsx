import { Icon } from "../../components/ui/Icon";
import { Card } from "../../components/cards/Cards";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";

const NOTIFS = [
  { sev: "high", icon: "virus" as const, t: "Early Blight risk is high today", s: "Based on humidity and nearby reports", time: "10m ago" },
  { sev: "medium", icon: "drone" as const, t: "Mission #AG-1024 completed", s: "Zone D treated successfully", time: "2h ago" },
  { sev: "low", icon: "droplet" as const, t: "Soil moisture synced", s: "61% — within healthy range", time: "3h ago" },
  { sev: "medium", icon: "bug" as const, t: "Aphid activity nearby", s: "3.2 km away", time: "6h ago" },
  { sev: "low", icon: "cloud" as const, t: "Weather update", s: "Rain expected tomorrow morning", time: "1d ago" },
];

export function NotificationsScreen() {
  return (
    <div className="view-enter pb-4 max-w-2xl">
      <ScreenHeader title="Notifications" back="/dashboard" />
      <div className="flex flex-col gap-3">
        {NOTIFS.map((n) => {
          const bg = n.sev === "high" ? "#FBE8E7" : n.sev === "medium" ? "#FDF3DB" : "#E7F5EC";
          const fg = n.sev === "high" ? "var(--color-danger)" : n.sev === "medium" ? "#9A6B0A" : "var(--color-primary)";
          return (
            <Card key={n.t} tight className="flex gap-2.5 items-start">
              <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-none" style={{ background: bg, color: fg }}>
                <Icon name={n.icon} className="w-[18px] h-[18px]" />
              </div>
              <div className="flex-1">
                <b className="text-[13.5px]">{n.t}</b>
                <div className="text-[13px] text-[#5E7568]">{n.s}</div>
                <div className="font-mono text-[10.5px] text-[#8AA093] mt-0.5">{n.time}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
