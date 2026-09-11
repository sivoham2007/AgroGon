import { useEffect, useState } from "react";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { PriorityActionCard } from "../../components/cards/Intelligence";
import { LoadingState } from "../../components/ui/Primitives";
import { useApp } from "../../app/AppState";
import { services } from "../../services";
import type { PriorityAction } from "../../types/domain";

export function RecommendationsScreen() {
  const { farm } = useApp();
  const [actions, setActions] = useState<PriorityAction[] | null>(null);
  useEffect(() => { services.intelligence.getPriorityActions(farm.id).then(setActions); }, [farm.id]);

  return (
    <div className="view-enter max-w-3xl">
      <ScreenHeader title="AI Recommendations" eyebrow="AGROGON NEXT BEST ACTION ENGINE" />
      {!actions && <LoadingState label="Generating recommendations..." />}
      <div className="flex flex-col gap-3">
        {actions?.map((a) => <PriorityActionCard key={a.id} action={a} />)}
      </div>
    </div>
  );
}
