import { useState, useEffect } from "react";
import { Icon } from "../../components/ui/Icon";
import { Card } from "../../components/cards/Cards";
import { Pill } from "../../components/ui/Primitives";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";

const EVENTS = [
  { id: "e1", icon: "bug" as const, sev: "medium" as const, title: "Movement detected", meta: "North Field · Camera 01", time: "12 min ago" },
  { id: "e2", icon: "check" as const, sev: "low" as const, title: "Camera reconnected", meta: "Zone D Entrance · Camera 02", time: "1h ago" },
  { id: "e3", icon: "alerts" as const, sev: "high" as const, title: "Camera connection lost", meta: "South Field · Camera 03", time: "3h ago" },
];

export function CameraMonitoringScreen() {
  const [cameras, setCameras] = useState<any[]>([]);
  const [activeCam, setActiveCam] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadCameras() {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("http://localhost:4000/api/camera", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      let data = await res.json();
      if (!Array.isArray(data)) throw new Error("Not an array");
      setCameras(data);
      if (data.length > 0 && !activeCam) {
        setActiveCam(data[0].id);
      }
    } catch(e) {
      // Mock data for prototype if backend is down
      const mockCameras = [
        { id: "cam1", name: "North Field Camera", status: "online" },
        { id: "cam2", name: "South Field Camera", status: "offline" }
      ];
      setCameras(mockCameras);
      if (!activeCam) setActiveCam(mockCameras[0].id);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCameras(); }, []);

  function refresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  }

  async function addMockCamera() {
    try {
      const token = localStorage.getItem("auth_token");
      await fetch("http://localhost:4000/api/camera", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name: "New Farm Camera" })
      });
      loadCameras();
    } catch(e) {}
  }

  const cam = cameras.find((c) => c.id === activeCam);

  return (
    <div className="view-enter max-w-4xl flex flex-col gap-5">
      <ScreenHeader title="Camera Monitoring" eyebrow="LIVE FARM MONITORING" />

      {loading ? (
        <div className="text-center py-10">Loading cameras...</div>
      ) : cameras.length === 0 ? (
        <Card className="text-center py-12">
          <Icon name="camera" className="w-12 h-12 mx-auto mb-4 text-[#8AA093]" />
          <h2 className="font-bold text-[18px]">No camera connected</h2>
          <p className="text-[#5E7568] mt-2 mb-6">Connect a farm camera to start monitoring your agricultural land.</p>
          <button onClick={addMockCamera} className="bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-xl font-bold">
            Connect New Camera
          </button>
        </Card>
      ) : (
        <>
          <Card className="!p-0 overflow-hidden">
            <div className={`relative ${fullscreen ? "fixed inset-4 z-50 rounded-2xl overflow-hidden" : "aspect-video bg-black"}`}>
              {cam?.status === 'offline' ? (
                <div className="absolute inset-0 flex items-center justify-center text-white/50 flex-col gap-3">
                   <Icon name="camera" className="w-10 h-10 opacity-50" />
                   <span>Camera is offline</span>
                </div>
              ) : (
                <>
                  <video src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" className="w-full h-full object-cover" autoPlay loop muted playsInline />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> LIVE
                  </div>
                  <div className="absolute top-3 right-3 bg-black/50 text-white text-[10.5px] font-mono px-2.5 py-1 rounded-full">
                    {new Date().toLocaleString()}
                  </div>
                  <div className="absolute bottom-3 left-3 text-white">
                    <div className="text-[13.5px] font-bold">{cam?.name}</div>
                    <div className="text-[11px] flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]`} />
                      Connected
                    </div>
                  </div>
                  <button onClick={() => setFullscreen((f) => !f)} className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-black/50 text-white flex items-center justify-center">
                    <Icon name="map" className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            <div className="p-4 flex flex-wrap items-center gap-2.5 justify-between">
              <select value={activeCam || ""} onChange={(e) => setActiveCam(e.target.value)} className="border border-[var(--color-mist)] rounded-lg px-3 py-2 text-[12.5px] bg-white font-semibold">
                {cameras.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={refresh} className="text-[12px] font-bold px-3 py-2 rounded-lg bg-[var(--color-mist-2)] border border-[var(--color-mist)]">
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
                <button onClick={addMockCamera} className="text-[12px] font-bold px-3 py-2 rounded-lg bg-[var(--color-mist-2)] border border-[var(--color-mist)]">Add Camera</button>
              </div>
            </div>
          </Card>

          <Card tight className="bg-[var(--color-mist-2)] text-[12.5px] text-[#5E7568]">
            This is a simulated feed for the prototype — no physical CCTV or IP camera is connected. The UI is built to accept a real RTSP/WebRTC stream or backend video service without changing this screen.
          </Card>

          <div>
            <div className="font-[var(--font-head)] font-bold text-[15px] mb-2.5">Cameras</div>
            <div className="grid sm:grid-cols-3 gap-2.5">
              {cameras.map((c) => (
                <Card key={c.id} tight onClick={() => setActiveCam(c.id)} className={`cursor-pointer ${activeCam === c.id ? "border-[var(--color-primary)]" : ""}`}>
                  <div className="text-[13px] font-semibold">{c.name}</div>
                  <div className="mt-1.5">{c.status === "online" ? <Pill level="low">ONLINE</Pill> : <Pill level="high">OFFLINE</Pill>}</div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="font-[var(--font-head)] font-bold text-[15px] mb-2.5">Detection Events</div>
            <div className="flex flex-col gap-2.5">
              {EVENTS.map((e) => {
                const bg = e.sev === "high" ? "#FBE8E7" : e.sev === "medium" ? "#FDF3DB" : "#E7F5EC";
                const fg = e.sev === "high" ? "var(--color-danger)" : e.sev === "medium" ? "#9A6B0A" : "var(--color-primary)";
                return (
                  <Card key={e.id} tight className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-none" style={{ background: bg, color: fg }}>
                      <Icon name={e.icon} className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[13.5px] font-semibold">{e.title}</div>
                      <div className="text-[12px] text-[#5E7568]">{e.meta}</div>
                    </div>
                    <div className="text-[11px] text-[#8AA093] font-mono">{e.time}</div>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

