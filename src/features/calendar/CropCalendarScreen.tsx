import { useState, useEffect } from "react";
import { useT } from "../../i18n/useT";
import { services } from "../../services";
import { Card } from "../../components/cards/Cards";
import { Button, GhostButton, Input } from "../../components/ui/Primitives";
import { useApp } from "../../app/AppState";

export function CropCalendarScreen() {
    const t = useT();
    const { farm: activeFarm, showToast } = useApp();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [form, setForm] = useState({
        crop: activeFarm?.crop || "Rice",
        variety: "Basmati",
        planting_date: new Date().toISOString().split('T')[0]
    });
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (activeFarm?.crop) {
             setForm(prev => ({...prev, crop: activeFarm.crop}));
        }
        loadEvents();
    }, [activeFarm?.id, activeFarm?.crop]);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const data = await services.calendar.getEvents(activeFarm?.id);
            setEvents(data as any[]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const generateCalendar = async () => {
        if (!form.crop || !form.planting_date) {
            setError("Select a crop and planting date to generate your crop calendar.");
            return;
        }
        setGenerating(true);
        setError(null);
        try {
            await services.calendar.generateCalendar({
                farm_id: activeFarm?.id,
                ...form
            });
            showToast("Calendar generated successfully!");
            await loadEvents();
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Failed to generate calendar. Please verify your inputs or check your internet connection.");
        } finally {
            setGenerating(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await services.calendar.updateEventStatus(id, status);
            showToast(`Task marked as ${status}`);
            await loadEvents(); 
        } catch(e) {
            console.error(e);
        }
    };
    
    // Fallback delete if you reset
    const resetCalendar = () => {
        // Mock UI clear for now, in a real app would delete from backend
        setEvents([]);
    }

    if (loading) return <div className="p-4">{t("common_loading")}</div>;

    return (
        <div className="view-enter max-w-lg mx-auto flex flex-col gap-5">
            <div>
                <h1 className="font-[var(--font-head)] font-extrabold text-[22px] text-[var(--color-dark)]">{t("calendar_title")}</h1>
                <p className="text-[13px] text-[#5E7568]">Manage your crop's lifecycle events.</p>
            </div>

            {events.length === 0 ? (
                <Card>
                    {error && (
                        <div className="p-3 mb-4 bg-[#FBE8E7] border border-[var(--color-danger)] text-[var(--color-danger)] rounded-lg text-[13px]">
                            {error}
                        </div>
                    )}
                    <h2 className="font-bold mb-3">{t("calendar_generate")}</h2>
                    <div className="flex flex-col gap-3">
                        <Input label={t("calc_crop")} value={form.crop} onChange={e => setForm({...form, crop: e.target.value})} />
                        <Input label="Variety" value={form.variety} onChange={e => setForm({...form, variety: e.target.value})} />
                        <Input label={t("calendar_plantingDate")} type="date" value={form.planting_date} onChange={e => setForm({...form, planting_date: e.target.value})} />
                        <Button onClick={generateCalendar} disabled={generating}>
                            {generating ? t("common_loading") : t("calendar_generate")}
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-[var(--color-mist)] mb-2 shadow-sm">
                         <div className="font-bold text-[15px]">{form.crop} Calendar</div>
                         <GhostButton onClick={resetCalendar} className="text-[var(--color-danger)] py-1">Reset</GhostButton>
                    </div>

                    {events.map((ev: any) => (
                        <Card key={ev.id} className="border-l-4" style={{borderLeftColor: ev.status === 'completed' ? 'var(--color-primary)' : 'var(--color-warning)'}}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-[15px]">{ev.title}</h3>
                                    <div className="text-[11px] text-[#8AA093] font-semibold">{new Date(ev.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                    ev.status === 'completed' ? 'bg-[#E6F4EA] text-[var(--color-primary)]' :
                                    ev.status === 'skipped' ? 'bg-[#FBE8E7] text-[var(--color-danger)]' :
                                    'bg-[#FEF7E0] text-[var(--color-warning)]'
                                }`}>
                                    {ev.status.toUpperCase()}
                                </span>
                            </div>
                            {ev.description && <p className="text-[12px] text-[#5E7568] mb-3">{ev.description}</p>}
                            
                            {ev.status === 'pending' && (
                                <div className="flex gap-2 mt-3">
                                    <button onClick={() => updateStatus(ev.id, 'completed')} className="flex-1 bg-[var(--color-primary)] text-white text-[12px] py-2 rounded-lg font-bold hover:bg-[#3d6e53] transition-colors shadow-sm">Mark Completed</button>
                                    <button onClick={() => updateStatus(ev.id, 'skipped')} className="flex-1 bg-white border border-[var(--color-mist)] text-[var(--color-dark)] text-[12px] py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors">Skip</button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
