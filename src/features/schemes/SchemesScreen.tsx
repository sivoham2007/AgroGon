import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { IntegrationPending } from "../../components/ui/IntegrationPending";

export function SchemesScreen() {
  return (
    <div className="view-enter pb-4">
      <ScreenHeader title="Government Schemes" back="/dashboard" />
      <IntegrationPending
        icon="map"
        title="Scheme eligibility isn't connected yet"
        body="This section is built to match you against central and state agricultural schemes (subsidies, insurance, loan waivers) based on your farm size, crop, and location, and link out to the official application process."
        needs={[
          "A maintained scheme database for your state (many are published as open government data)",
          "Your farm size, crop, and land-ownership details on file",
          "A verified link-out flow to the official government portal for applications",
        ]}
      />
    </div>
  );
}
