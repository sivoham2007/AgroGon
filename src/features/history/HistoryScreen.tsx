import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { Card } from "../../components/cards/Cards";
import { LoadingState } from "../../components/ui/Primitives";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { useApp } from "../../app/AppState";
import { services } from "../../services";
import type { TimelineEvent } from "../../types/domain";

export function HistoryScreen() {
  const navigate = useNavigate();
  const { farm } = useApp();
  const [events, setEvents] = useState<TimelineEvent[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => { services.timeline.getTimeline(farm.id).then(setEvents); }, [farm.id]);
  if (!events) return <LoadingState label="Loading farm intelligence timeline..." />;

  return (
    <div className="view-enter pb-4">
      <ScreenHeader title="Farm Intelligence Timeline" back="/profile" eyebrow="TODAY'S CONNECTED STORY" />
      <div className="px-5">
        <Card>
          <div className="flex flex-col">
            {events.map((h, i) => {
              const bg = h.severity === "high" ? "#FBE8E7" : h.severity === "medium" ? "#FDF3DB" : "#E7F5EC";
              const fg = h.severity === "high" ? "var(--color-danger)" : h.severity === "medium" ? "#9A6B0A" : "var(--color-primary)";
              const open = openId === h.id;
              return (
                <div key={h.id} className="flex gap-3">
                  <div className="w-[22px] flex flex-col items-center">
                    <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-none" style={{ background: bg, color: fg }}>
                      <Icon name={h.icon as Parameters<typeof Icon>[0]["name"]} className="w-3.5 h-3.5" />
                    </div>
                    {i < events.length - 1 && <div className="w-[2px] flex-1 min-h-[22px] bg-[var(--color-mist)]" />}
                  </div>
                  <button className="text-left pb-4 flex-1" onClick={() => setOpenId(open ? null : h.id)}>
                    <div className="font-mono text-[11px] text-[#5E7568]">{h.time}</div>
                    <b className="text-[13.5px]">{h.title}</b>
                    {open && (
                      <div className="mt-1.5 text-[13px] text-[#5E7568] bg-[var(--color-mist-2)] rounded-xl p-3 flex flex-col gap-2">
                        <div>{h.detail}</div>
                        {h.relatedField && <div className="text-[12px]"><b className="text-[var(--color-dark)]">Related field:</b> {h.relatedField}</div>}
                        {h.relatedRoute && (
                          <button
                            className="self-start text-[12px] font-bold text-[var(--color-primary)]"
                            onClick={(e) => { e.stopPropagation(); navigate(h.relatedRoute!); }}
                          >
                            Open related screen →
                          </button>
                        )}
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
