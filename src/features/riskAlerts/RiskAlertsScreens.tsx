import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/cards/Cards";
import { AlertCard } from "../../components/cards/Cards";
import { ExplainableAIPanel } from "../../components/cards/Intelligence";
import { Pill, PrimaryButton, SecondaryButton, LoadingState } from "../../components/ui/Primitives";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { useApp } from "../../app/AppState";
import { services } from "../../services";
import type { AlertItem, AIExplanation } from "../../types/domain";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { API_BASE_URL } from "../../services/http/client";

// Fix Leaflet's default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export function RiskScreen() {
  const navigate = useNavigate();
  const { farm } = useApp();
  const [risk, setRisk] = useState<{ disease: string; pest: string; water: string; factors: string[]; recommendation: string } | null>(null);
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);

  useEffect(() => { services.risk.getRisk(farm.id).then(setRisk); }, [farm.id]);
  useEffect(() => { services.explain.getDiseaseExplanation(farm.id).then(setExplanation); }, [farm.id]);
  if (!risk) return <LoadingState label="Assessing field risk..." />;

  return (
    <div className="view-enter pb-4">
      <ScreenHeader title="Crop Risk" back="/dashboard" />
      <div className="px-5 flex flex-col gap-3.5">
        <Card tight className="border-l-[3px]" style={{ borderLeftColor: "var(--color-danger)" }}>
          <div className="flex justify-between items-center"><b>Disease Risk</b><Pill level="high">HIGH 🔴</Pill></div>
        </Card>
        <Card tight className="border-l-[3px]" style={{ borderLeftColor: "var(--color-warning)" }}>
          <div className="flex justify-between items-center"><b>Pest Risk</b><Pill level="medium">MEDIUM 🟡</Pill></div>
        </Card>
        <Card tight className="border-l-[3px]" style={{ borderLeftColor: "var(--color-secondary)" }}>
          <div className="flex justify-between items-center"><b>Water Stress</b><Pill level="low">LOW 🟢</Pill></div>
        </Card>
        <Card>
          <div className="font-[var(--font-head)] font-bold text-[15px]">Why is disease risk high?</div>
          <div className="flex flex-col gap-1.5 mt-2">
            {risk.factors.map((f) => <div key={f} className="text-[13px] text-[#5E7568]">• {f}</div>)}
          </div>
        </Card>
        <Card className="bg-[#FFF8E9]" style={{ borderColor: "#F3E1AE" }}>
          <div className="font-[var(--font-head)] font-bold text-[15px] text-[#7A5B0A]">Recommended Action</div>
          <p className="text-[13px] text-[#7A5B0A] mt-1">{risk.recommendation}</p>
        </Card>
        {explanation && <ExplainableAIPanel explanation={explanation} />}
        <SecondaryButton onClick={() => navigate("/digital-twin")}>Open Farm Digital Twin</SecondaryButton>
        <PrimaryButton onClick={() => navigate("/treatment")}>Open Treatment Map</PrimaryButton>
      </div>
    </div>
  );
}

export function AlertsScreen() {
  const { farm, farmer, showToast } = useApp();
  const [alerts, setAlerts] = useState<AlertItem[] | null>(null);
  const [nearbyFarmers, setNearbyFarmers] = useState<any[]>([]);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { 
    services.alert.getNearbyAlerts(farm.id).then(setAlerts); 
    // Prototype: Use a default location to ensure map is not empty
    const defaultLoc = { lat: 20.5937, lng: 78.9629 };
    setLocation(defaultLoc);
    
    // Mock nearby farmers
    setNearbyFarmers([
      { id: "f1", name: "Ramesh Kumar", village: "Nearby Farm", farmer_code: "F-102", lat: 20.595, lng: 78.960, connectionStatus: "none" },
      { id: "f2", name: "Suresh Patil", village: "Nearby Farm", farmer_code: "F-209", lat: 20.590, lng: 78.965, connectionStatus: "none" }
    ]);
  }, [farm.id]);

  async function notify() {
    const res = await services.alert.notifyNearbyFarmers("a1");
    showToast(`${res.notified} nearby farmers notified`);
  }

  async function sendRequest(targetFarmerId: string) {
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`${API_BASE_URL}/connections/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ target_farmer_id: targetFarmerId })
      });
      showToast("Friend request sent!");
      // Optimistically update
      setNearbyFarmers(prev => prev.map(f => f.id === targetFarmerId ? { ...f, connectionStatus: 'pending', isSender: true } : f));
    } catch(e) {
      setError("Failed to send request.");
    }
  }

  return (
    <div className="view-enter pb-4">
      <ScreenHeader title="Hyperlocal Alerts" eyebrow={`${farmer.village}, ${farmer.district}`} />
      <div className="px-5">
        <div className="relative rounded-2xl overflow-hidden border border-[var(--color-mist)] h-[250px] bg-slate-100 flex items-center justify-center">
          {error && <div className="text-[13px] text-red-500 font-bold px-4 text-center">{error}</div>}
          {!location && !error && <div className="text-[13px] text-[#5E7568]">Locating your agricultural land...</div>}
          
          {location && (
            <MapContainer center={[location.lat, location.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Marker position={[location.lat, location.lng]}>
                <Popup>My Agricultural Land</Popup>
              </Marker>
              <Circle center={[location.lat, location.lng]} radius={1500} pathOptions={{ color: 'var(--color-primary)', fillColor: 'var(--color-primary)' }} />
              {alerts && alerts.map((a) => (
                 <Marker key={a.id} position={[location.lat + (Math.random() * 0.01 - 0.005), location.lng + (Math.random() * 0.01 - 0.005)]}>
                    <Popup>{a.title}</Popup>
                 </Marker>
              ))}
              {nearbyFarmers.map(f => (
                f.lat && f.lng ? (
                  <Marker key={f.id} position={[f.lat, f.lng]}>
                    <Popup>
                      <b>{f.name}</b><br/>
                      {f.farmer_code}
                    </Popup>
                  </Marker>
                ) : null
              ))}
            </MapContainer>
          )}
        </div>
      </div>
      <div className="px-5 pt-3.5 flex flex-col gap-3">
        {!alerts && <LoadingState label="Checking nearby reports..." />}
        {alerts?.map((a) => <AlertCard key={a.id} icon={a.icon} severity={a.severity} title={a.title} meta={a.meta} time={a.timeLabel} />)}
        <SecondaryButton onClick={notify}>🔔 Alert Nearby Farmers</SecondaryButton>
      </div>

      <div className="px-5 pt-6">
         <div className="font-[var(--font-head)] font-bold text-[15px] mb-2.5">Nearby Farmers</div>
         <div className="flex flex-col gap-2">
            {nearbyFarmers.map(f => (
              <Card key={f.id} tight className="flex justify-between items-center">
                 <div>
                    <div className="font-bold text-[13.5px]">{f.name}</div>
                    <div className="text-[11.5px] text-[#5E7568]">{f.village}</div>
                 </div>
                 <div>
                    {f.connectionStatus === 'accepted' ? (
                       <Pill level="low">Connected</Pill>
                    ) : f.connectionStatus === 'pending' ? (
                       <Pill level="medium">Request Sent</Pill>
                    ) : (
                       <button onClick={() => sendRequest(f.id)} className="text-[12px] bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg font-bold">
                         Send Request
                       </button>
                    )}
                 </div>
              </Card>
            ))}
         </div>
      </div>
    </div>
  );
}
