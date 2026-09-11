import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { Card } from "../../components/cards/Cards";
import { LoadingState } from "../../components/ui/Primitives";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { useApp } from "../../app/AppState";
import { services } from "../../services";
import type { TimelineEvent } from "../../types/domain";

export function ReportsScreen() {
  const navigate = useNavigate();
  const { farm } = useApp();
  const [events, setEvents] = useState<TimelineEvent[] | null>(null);
  useEffect(() => { services.timeline.getTimeline(farm.id).then(setEvents); }, [farm.id]);

  return (
    <div className="view-enter max-w-3xl">
      <ScreenHeader title="Reports" eyebrow="GENERATED FROM YOUR FARM ACTIVITY" />
      {!events && <LoadingState label="Loading reports..." />}
      <div className="flex flex-col gap-2.5">
        {events?.map((e) => (
          <Card key={e.id} tight className="flex items-center gap-3" onClick={() => e.relatedRoute && navigate(e.relatedRoute)}>
            <div className="w-9 h-9 rounded-lg bg-[var(--color-mist-2)] flex items-center justify-center flex-none text-[var(--color-primary)]">
              <Icon name={e.icon as Parameters<typeof Icon>[0]["name"]} className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="text-[13.5px] font-semibold">{e.title}</div>
              <div className="text-[12px] text-[#5E7568]">{e.detail}</div>
              <div className="text-[11px] text-[#8AA093] font-mono mt-0.5">{e.time} {e.relatedField && `· ${e.relatedField}`}</div>
            </div>
            {e.relatedRoute && <Icon name="chev" className="w-4 h-4 text-[#8AA093] flex-none" />}
          </Card>
        ))}
      </div>
    </div>
  );
}
