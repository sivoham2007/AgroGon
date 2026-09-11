import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { Card } from "../../components/cards/Cards";
import { PrimaryButton, Pill } from "../../components/ui/Primitives";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { useApp } from "../../app/AppState";

const FAQS = [
  { q: "How accurate is the disease detection?", a: "AgroGon shows a confidence percentage with every scan and always phrases results as \"possible\" findings, not confirmed diagnoses. Use it as an early-warning tool alongside your own judgement, not a replacement for it." },
  { q: "Does this work without internet?", a: "Farm data you've already loaded stays available offline. New scans, weather, and market data need a connection to fetch — you'll see an Offline Mode indicator when you're disconnected." },
  { q: "Can I use AgroGon in my own language?", a: "Yes — go to Settings and choose from English, Hindi, Telugu, Tamil, Kannada, Marathi, or Bengali. Your choice is remembered on this device." },
  { q: "Will the drone actually spray my field?", a: "Not yet — the Field Monitoring / Drone Center is a mission-planning and simulation tool. No physical drone hardware is connected in this build, and any future live mission would still require your explicit approval before anything happens." },
  { q: "How do I report a wrong or unhelpful result?", a: "Use the AI Assistant to describe what went wrong, or reach out through the contact details below — this feedback is exactly what improves the underlying recommendations." },
];

export function CommunityScreen() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [open, setOpen] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadConnections(); }, []);

  async function loadConnections() {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch("http://localhost:4000/api/connections", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setConnections(data);
    } catch(e) {}
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`http://localhost:4000/api/connections/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setSearchResults(data);
    } catch(e) {} finally {
      setLoading(false);
    }
  }

  async function sendRequest(targetFarmerId: string) {
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`http://localhost:4000/api/connections/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ target_farmer_id: targetFarmerId })
      });
      showToast("Friend request sent!");
      loadConnections();
      setSearchResults(prev => prev.map(f => f.id === targetFarmerId ? { ...f, connectionStatus: 'pending', isSender: true } : f));
    } catch(e) {}
  }

  async function respondRequest(connectionId: string, action: 'accept' | 'remove') {
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`http://localhost:4000/api/connections/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ connection_id: connectionId })
      });
      showToast(action === 'accept' ? "Connection accepted!" : "Connection removed.");
      loadConnections();
    } catch(e) {}
  }

  return (
    <div className="view-enter pb-4 flex flex-col gap-5">
      <ScreenHeader title="Community & Support" back="/dashboard" />

      <Card>
        <div className="font-[var(--font-head)] font-bold text-[15px] mb-3">Frequently Asked Questions</div>
        <div className="flex flex-col divide-y divide-[var(--color-mist)]">
          {FAQS.map((f, i) => (
            <div key={f.q} className="py-3">
              <button className="w-full flex items-center justify-between text-left" onClick={() => setOpen(open === i ? null : i)}>
                <span className="text-[13.5px] font-semibold text-[var(--color-dark)] pr-3">{f.q}</span>
                <Icon name="chev" className={`w-4 h-4 text-[#8AA093] flex-none transition-transform ${open === i ? "rotate-90" : ""}`} />
              </button>
              {open === i && <p className="text-[13px] text-[#5E7568] mt-2 leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <div className="font-[var(--font-head)] font-bold text-[15px]">Still need help?</div>
        <p className="text-[13px] text-[#5E7568]">Ask AgroGon's AI Assistant directly, in your own language.</p>
        <PrimaryButton onClick={() => navigate("/advisory")}><Icon name="chat" className="w-4 h-4" /> Open AI Assistant</PrimaryButton>
      </Card>

      <Card>
        <div className="font-[var(--font-head)] font-bold text-[15px] mb-3">Farmer Connections</div>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input 
            type="text" 
            placeholder="Search by Mobile Number or AgroGon ID" 
            className="flex-1 bg-[var(--color-mist-2)] rounded-lg px-3 py-2 text-[13px] border border-[var(--color-mist)] focus:border-[var(--color-primary)] outline-none"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <PrimaryButton type="submit" disabled={loading}>Search</PrimaryButton>
        </form>

        {searchResults.length > 0 && (
          <div className="mb-6 flex flex-col gap-2">
            <div className="text-[12px] font-bold text-[#5E7568]">Search Results</div>
            {searchResults.map(f => (
              <div key={f.id} className="flex justify-between items-center bg-[#F9FBF9] p-3 rounded-xl border border-[var(--color-mist)]">
                <div>
                  <div className="font-bold text-[13.5px]">{f.name}</div>
                  <div className="text-[11.5px] text-[#5E7568]">ID: {f.farmer_code} | {f.village}</div>
                </div>
                <div>
                  {f.connectionStatus === 'accepted' ? (
                     <Pill level="low">Connected</Pill>
                  ) : f.connectionStatus === 'pending' ? (
                     <Pill level="medium">{f.isSender ? "Request Sent" : "Request Received"}</Pill>
                  ) : (
                     <button onClick={() => sendRequest(f.id)} className="text-[12px] bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg font-bold">
                       Add Friend
                     </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
           <div className="text-[12px] font-bold text-[#5E7568]">My Farmers</div>
           {connections.length === 0 && <div className="text-[12px] text-center py-4 text-[#8AA093]">No connections yet. Add some friends!</div>}
           {connections.map(c => (
              <div key={c.connection_id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-[var(--color-mist)]">
                <div>
                  <div className="font-bold text-[13.5px]">{c.farmer.name}</div>
                  <div className="text-[11.5px] text-[#5E7568]">{c.farmer.village}, {c.farmer.district}</div>
                </div>
                <div className="flex gap-2">
                  {c.status === 'accepted' ? (
                     <>
                        <Pill level="low">Connected</Pill>
                        <button onClick={() => respondRequest(c.connection_id, 'remove')} className="text-[12px] text-[var(--color-danger)] px-2 py-1.5 font-bold">Remove</button>
                     </>
                  ) : c.status === 'pending' && !c.isSender ? (
                     <>
                        <button onClick={() => respondRequest(c.connection_id, 'accept')} className="text-[12px] bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg font-bold">Accept</button>
                        <button onClick={() => respondRequest(c.connection_id, 'remove')} className="text-[12px] bg-[var(--color-mist)] text-[var(--color-dark)] px-3 py-1.5 rounded-lg font-bold">Reject</button>
                     </>
                  ) : (
                     <Pill level="medium">Request Sent</Pill>
                  )}
                </div>
              </div>
           ))}
        </div>
      </Card>
    </div>
  );
}
