import { useState, useEffect } from "react";
import { useT } from "../../i18n/useT";
import { services } from "../../services";
import { Button, GhostButton, Input, Select } from "../../components/ui/Primitives";
import { Card } from "../../components/cards/Cards";
import { useApp } from "../../app/AppState";

export function FertilizerCalculatorScreen() {
    const t = useT();
    const [loading, setLoading] = useState(false);
    const { farm: activeFarm } = useApp();
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [form, setForm] = useState({
        crop: activeFarm?.crop || "Rice",
        area_acres: activeFarm?.areaAcres?.toString() || "1",
        soil_type: "Loam",
        n_avail: "",
        p_avail: "",
        k_avail: ""
    });

    useEffect(() => {
        loadHistory();
        loadSoilData();
    }, [activeFarm?.id]);

    const loadHistory = async () => {
        try {
            const data = await services.calculators.getHistory() as any;
            setHistory(data.fertilizer || []);
        } catch(e) {
            console.error("Failed to load history", e);
        }
    };

    const loadSoilData = async () => {
        try {
            const soilHistory = await services.soilFertility.getHistory() as any[];
            const latest = soilHistory[0]; // Assuming it's ordered by latest
            if (latest) {
                setForm(prev => ({
                    ...prev,
                    n_avail: latest.nitrogen?.toString() || prev.n_avail,
                    p_avail: latest.phosphorus?.toString() || prev.p_avail,
                    k_avail: latest.potassium?.toString() || prev.k_avail,
                }));
            }
        } catch(e) {
            console.error("Failed to load soil data", e);
        }
    };

    const calculate = async () => {
        if (!form.n_avail || !form.p_avail || !form.k_avail || !form.area_acres) {
            setError("Complete the soil test information and land area to calculate the fertilizer requirement.");
            return;
        }
        
        setLoading(true);
        setError(null);
        try {
            const data = await services.calculators.calculateFertilizer({
                farm_id: activeFarm?.id,
                ...form,
                area_acres: Number(form.area_acres),
                n_avail: Number(form.n_avail),
                p_avail: Number(form.p_avail),
                k_avail: Number(form.k_avail)
            });
            setResult(data);
            await loadHistory();
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Calculation failed. Please verify your inputs and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="view-enter max-w-lg mx-auto flex flex-col gap-5">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-[var(--font-head)] font-extrabold text-[22px] text-[var(--color-dark)]">{t("calc_fertTitle")}</h1>
                    <p className="text-[13px] text-[#5E7568]">Get smart NPK recommendations based on your soil and crop.</p>
                </div>
                <GhostButton onClick={() => setShowHistory(!showHistory)}>
                    {showHistory ? "Calculator" : "History"}
                </GhostButton>
            </div>

            {showHistory ? (
                <div className="flex flex-col gap-3">
                    {history.length === 0 && <Card className="text-center text-[#8AA093] py-8">No past calculations.</Card>}
                    {history.map(h => (
                        <Card key={h.id} className="border-l-4 border-l-[var(--color-primary)]">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-[15px]">{h.crop} <span className="font-normal text-[12px] text-[#8AA093]">({h.area_acres} Acres)</span></h3>
                                    <div className="text-[11px] text-[#8AA093]">{new Date(h.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <div className="bg-[var(--color-mist-2)] p-2 rounded-lg text-center"><div className="text-[10px] text-[#8AA093]">N Reqd</div><div className="font-bold text-[12px]">{h.n_req} kg</div></div>
                                <div className="bg-[var(--color-mist-2)] p-2 rounded-lg text-center"><div className="text-[10px] text-[#8AA093]">P Reqd</div><div className="font-bold text-[12px]">{h.p_req} kg</div></div>
                                <div className="bg-[var(--color-mist-2)] p-2 rounded-lg text-center"><div className="text-[10px] text-[#8AA093]">K Reqd</div><div className="font-bold text-[12px]">{h.k_req} kg</div></div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <>
                    <Card>
                        <div className="flex flex-col gap-4">
                            {error && (
                                <div className="p-3 bg-[#FBE8E7] border border-[var(--color-danger)] text-[var(--color-danger)] rounded-lg text-[13px]">
                                    {error}
                                </div>
                            )}
                            
                            {!form.n_avail && !form.p_avail && !form.k_avail && (
                                <div className="p-3 bg-[#FFF3E0] border border-[#E65100] text-[#E65100] rounded-lg text-[13px]">
                                    <strong>No recent soil test found.</strong><br/>
                                    We recommend getting a soil test for accurate fertilizer calculations. Using default values for now.
                                </div>
                            )}
                            <Select label={t("calc_crop")} value={form.crop} onChange={e => setForm({...form, crop: e.target.value})}>
                                <option value="Rice">Rice</option>
                                <option value="Wheat">Wheat</option>
                                <option value="Cotton">Cotton</option>
                                <option value="Maize">Maize</option>
                            </Select>
                            
                            <Input label={t("calc_area")} type="number" value={form.area_acres} onChange={e => setForm({...form, area_acres: e.target.value})} />
                            
                            <div className="grid grid-cols-3 gap-2">
                                <Input label={t("calc_nAvail")} type="number" value={form.n_avail} onChange={e => setForm({...form, n_avail: e.target.value})} placeholder="Optional" />
                                <Input label={t("calc_pAvail")} type="number" value={form.p_avail} onChange={e => setForm({...form, p_avail: e.target.value})} placeholder="Optional" />
                                <Input label={t("calc_kAvail")} type="number" value={form.k_avail} onChange={e => setForm({...form, k_avail: e.target.value})} placeholder="Optional" />
                            </div>

                            <Button onClick={calculate} disabled={loading} className="mt-2">
                                {loading ? t("common_loading") : t("calc_calculate")}
                            </Button>
                        </div>
                    </Card>

                    {result && (
                        <Card className="bg-[var(--color-mist-2)] border-none">
                            <h2 className="font-bold text-[16px] mb-3">{t("calc_results")}</h2>
                            <div className="grid grid-cols-3 gap-2 text-center mb-4">
                                <div className="bg-white p-2 rounded-xl border border-[var(--color-mist)]">
                                    <div className="text-[11px] text-[#8AA093]">{t("calc_nReq")}</div>
                                    <div className="font-bold text-[18px] text-[var(--color-primary)]">{result.n_total_kg} <span className="text-[12px]">kg</span></div>
                                </div>
                                <div className="bg-white p-2 rounded-xl border border-[var(--color-mist)]">
                                    <div className="text-[11px] text-[#8AA093]">{t("calc_pReq")}</div>
                                    <div className="font-bold text-[18px] text-[var(--color-primary)]">{result.p_total_kg} <span className="text-[12px]">kg</span></div>
                                </div>
                                <div className="bg-white p-2 rounded-xl border border-[var(--color-mist)]">
                                    <div className="text-[11px] text-[#8AA093]">{t("calc_kReq")}</div>
                                    <div className="font-bold text-[18px] text-[var(--color-primary)]">{result.k_total_kg} <span className="text-[12px]">kg</span></div>
                                </div>
                            </div>

                            <h3 className="font-semibold text-[13px] mb-2">Recommended Application Schedule</h3>
                            <div className="flex flex-col gap-2">
                                {result.schedule.map((s: any, i: number) => (
                                    <div key={i} className="bg-white p-3 rounded-lg text-[12px] flex flex-col gap-1 border border-[var(--color-mist)]">
                                        <div className="flex justify-between items-center">
                                            <div className="font-bold text-[var(--color-dark)]">{s.stage}</div>
                                            <div className="font-mono font-semibold text-[var(--color-primary)]">N:{s.n_amount} P:{s.p_amount} K:{s.k_amount}</div>
                                        </div>
                                        <div className="text-[#8AA093] text-[11px] flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)] inline-block"></span>
                                            {s.timing}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {result.warnings?.length > 0 && (
                                <div className="mt-4 p-3 bg-[#FBE8E7] text-[var(--color-danger)] rounded-lg text-[12px]">
                                    <strong>Warnings:</strong>
                                    <ul className="list-disc ml-4 mt-1">
                                        {result.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                                    </ul>
                                </div>
                            )}
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
