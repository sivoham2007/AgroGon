import { useState } from "react";
import { Icon } from "../../components/ui/Icon";
import { Card } from "../../components/cards/Cards";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export function FarmMapScreen() {
  const [view, setView] = useState<"map" | "satellite">("map");
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  function locateMe() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => alert("Location permission denied.")
      );
    }
  }

  return (
    <div className="view-enter max-w-4xl flex flex-col gap-4">
      <ScreenHeader
        title="Agricultural Land View"
        right={
          <div className="flex rounded-lg overflow-hidden border border-[var(--color-mist)]">
            <button onClick={() => setView("map")} className={`px-3 py-1.5 text-[12px] font-bold ${view === "map" ? "bg-[var(--color-primary)] text-white" : "bg-white text-[#5E7568]"}`}>Map</button>
            <button onClick={() => setView("satellite")} className={`px-3 py-1.5 text-[12px] font-bold ${view === "satellite" ? "bg-[var(--color-primary)] text-white" : "bg-white text-[#5E7568]"}`}>Satellite</button>
          </div>
        }
      />
      <button onClick={locateMe} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-xl text-[13px] font-bold self-start flex items-center gap-2">
        <Icon name="map" className="w-4 h-4" /> Locate My Farm
      </button>
      
      <Card className="!p-0 overflow-hidden relative h-[400px]">
        {location ? (
          <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
            {view === "satellite" ? (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
              />
            ) : (
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
            )}
            <Marker position={[location.lat, location.lng]}>
               <Popup>Your Farmland</Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[13px] text-[#5E7568]">
            Click "Locate My Farm" to show your agricultural land.
          </div>
        )}
      </Card>
      <Card>
        <div className="font-[var(--font-head)] font-bold text-[15px] mb-2.5">Legend</div>
        <div className="flex flex-wrap gap-4 text-[12.5px] text-[#5E7568]">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "#2E9D68" }} /> Healthy zone</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "#E8A317" }} /> Water stress</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "#F4B942" }} /> Nutrient concern</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "#D9534F" }} /> Disease risk</span>
        </div>
      </Card>
      <Card tight className="bg-[var(--color-mist-2)] text-[12px] text-[#5E7568]">
        This map uses your recorded field boundaries and treatment zones. It's built to support Google Maps, OpenStreetMap, GPS coordinates, or satellite imagery once one is connected.
      </Card>
    </div>
  );
}
