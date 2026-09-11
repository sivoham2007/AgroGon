import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { IntegrationPending } from "../../components/ui/IntegrationPending";

export function MarketScreen() {
  return (
    <div className="view-enter pb-4">
      <ScreenHeader title="Market Intelligence" back="/dashboard" />
      <IntegrationPending
        icon="history"
        title="Live mandi prices aren't connected yet"
        body="This section is built to show local mandi (market) prices for your crops, price trends, and the best nearby markets to sell at — once a market-data source is connected."
        needs={[
          "A government or private mandi price API (e.g. Agmarknet / e-NAM)",
          "Your crop and district set in Settings, to filter relevant prices",
          "A refresh schedule for daily price updates",
        ]}
      />
    </div>
  );
}
