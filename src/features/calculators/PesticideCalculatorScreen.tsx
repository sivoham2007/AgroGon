import { useState, useEffect } from "react";
import { useT } from "../../i18n/useT";
import { services } from "../../services";
import { Button, GhostButton, Input } from "../../components/ui/Primitives";
import { Card } from "../../components/cards/Cards";
import { useApp } from "../../app/AppState";

export function PesticideCalculatorScreen() {
    const t = useT();
    const { farm: activeFarm } = useApp();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    
    const [form, setForm] = useState({
        crop: activeFarm?.crop || "Rice",
        pest: "Stem Borer",
        product: "Chlorantraniliprole 18.5% SC",
        dose_per_acre: "60",
        dose_unit: "ml",
        area_acres: activeFarm?.areaAcres?.toString() || "2",
        tank_capacity: "16",
        water_per_acre: "200"
    });

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await services.calculators.getHistory() as any;
            setHistory(data.pesticide || []);
        } catch(e) {
            console.error("Failed to load history", e);
        }
    };

    const calculate = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await services.calculators.calculatePesticide({
                farm_id: activeFarm?.id,
                ...form,
                dose_per_acre: Number(form.dose_per_acre),
                area_acres: Number(form.area_acres),
                tank_capacity: Number(form.tank_capacity),
                water_per_acre: Number(form.water_per_acre)
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
                    <h1 className="font-[var(--font-head)] font-extrabold text-[22px] text-[var(--color-dark)]">{t("calc_pestTitle")}</h1>
                    <p className="text-[13px] text-[#5E7568]">Calculate exact pesticide dosage and water requirements.</p>
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
                                    <h3 className="font-bold text-[15px]">{h.product}</h3>
                                    <div className="text-[11px] text-[#8AA093]">{new Date(h.created_at).toLocaleDateString()} - {h.crop} ({h.pest})</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="bg-[var(--color-mist-2)] p-2 rounded-lg text-center"><div className="text-[10px] text-[#8AA093]">Total Product</div><div className="font-bold text-[12px]">{h.total_product} ml</div></div>
                                <div className="bg-[var(--color-mist-2)] p-2 rounded-lg text-center"><div className="text-[10px] text-[#8AA093]">Tanks Needed</div><div className="font-bold text-[12px]">{h.num_tanks}</div></div>
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
                            <div className="grid grid-cols-2 gap-3">
                                <Input label={t("calc_crop")} value={form.crop} onChange={e => setForm({...form, crop: e.target.value})} />
                                <Input label={t("calc_pestName")} value={form.pest} onChange={e => setForm({...form, pest: e.target.value})} />
                            </div>
                            
                            <Input label={t("calc_product")} value={form.product} onChange={e => setForm({...form, product: e.target.value})} />
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex gap-2">
                                    <Input className="flex-1" label={t("calc_dosePerAcre")} type="number" value={form.dose_per_acre} onChange={e => setForm({...form, dose_per_acre: e.target.value})} />
                                    <div className="w-[80px]">
                                        <label className="block text-[11px] font-bold text-[#5E7568] uppercase mb-1 tracking-wider opacity-0">Unit</label>
                                        <select className="w-full bg-[#F6F8F7] border-none text-[15px] font-semibold text-[var(--color-dark)] px-3 py-3 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none" value={form.dose_unit} onChange={e => setForm({...form, dose_unit: e.target.value})}>
                                            <option value="ml">ml</option>
                                            <option value="g">g</option>
                                        </select>
                                    </div>
                                </div>
                                <Input label={t("calc_area")} type="number" value={form.area_acres} onChange={e => setForm({...form, area_acres: e.target.value})} />
                                <Input label={t("calc_tankCap")} type="number" value={form.tank_capacity} onChange={e => setForm({...form, tank_capacity: e.target.value})} />
                                <Input label={t("calc_waterPerAcre")} type="number" value={form.water_per_acre} onChange={e => setForm({...form, water_per_acre: e.target.value})} />
                            </div>

                            <Button onClick={calculate} disabled={loading} className="mt-2">
                                {loading ? t("common_loading") : t("calc_calculate")}
                            </Button>
                        </div>
                    </Card>

                    {result && (
                        <Card className="bg-[var(--color-mist-2)] border-none">
                            <h2 className="font-bold text-[16px] mb-3">{t("calc_results")}</h2>
                            
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-white p-3 rounded-xl border border-[var(--color-mist)] flex flex-col items-center justify-center text-center">
                                    <div className="text-[12px] text-[#8AA093] font-semibold">{t("calc_totalWater")}</div>
                                    <div className="text-[24px] font-bold text-[var(--color-dark)]">{result.total_water_l} <span className="text-[14px]">L</span></div>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-[var(--color-mist)] flex flex-col items-center justify-center text-center">
                                    <div className="text-[12px] text-[#8AA093] font-semibold">{t("calc_numTanks")}</div>
                                    <div className="text-[24px] font-bold text-[var(--color-dark)]">{result.num_tanks}</div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-[var(--color-primary)] text-center mb-4">
                                 <div className="text-[13px] text-[#5E7568] font-bold uppercase tracking-wider">{t("calc_prodPerTank")}</div>
                                 <div className="text-[32px] font-[var(--font-head)] font-extrabold text-[var(--color-primary)] mt-1">
                                     {result.product_per_tank} <span className="text-[16px]">{result.unit}</span>
                                 </div>
                            </div>

                            {result.safety_warnings?.length > 0 && (
                                <div className="mt-2 p-3 bg-[#FBE8E7] text-[var(--color-danger)] rounded-lg text-[12px]">
                                    <strong className="flex items-center gap-1">⚠️ Safety Warnings:</strong>
                                    <ul className="list-disc ml-4 mt-2 space-y-1">
                                        {result.safety_warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
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
