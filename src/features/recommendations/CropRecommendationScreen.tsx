import { useState, useEffect } from "react";
import { useT } from "../../i18n/useT";
import { services } from "../../services";
import { Card } from "../../components/cards/Cards";
import { Button, GhostButton, Input, Select } from "../../components/ui/Primitives";
import { useApp } from "../../app/AppState";

export function CropRecommendationScreen() {
    const t = useT();
    const { farmer, farm: activeFarm } = useApp();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    
    const [form, setForm] = useState({
        state: farmer?.state || "Karnataka",
        district: farmer?.district || "Tumkur",
        season: "Kharif",
        soil_type: "Red Soil",
        water_availability: "Medium",
        ph: "",
        nitrogen: "",
        phosphorus: "",
        potassium: ""
    });

    useEffect(() => {
        loadHistory();
        loadSoilData();
    }, [activeFarm?.id]);

    const loadHistory = async () => {
        try {
            const data = await services.recommendations.getHistory() as any;
            setHistory(data || []);
        } catch(e) {
            console.error("Failed to load history", e);
        }
    };

    const loadSoilData = async () => {
        try {
            const soilHistory = await services.soilFertility.getHistory() as any[];
            const latest = soilHistory[0]; // Assuming ordered by latest
            if (latest) {
                setForm(prev => ({
                    ...prev,
                    ph: latest.ph?.toString() || prev.ph,
                    nitrogen: latest.nitrogen?.toString() || prev.nitrogen,
                    phosphorus: latest.phosphorus?.toString() || prev.phosphorus,
                    potassium: latest.potassium?.toString() || prev.potassium,
                    soil_type: latest.soil_type || prev.soil_type
                }));
            }
        } catch(e) {
            console.error("Failed to load soil data", e);
        }
    };

    const calculate = async () => {
        if (!form.ph || !form.nitrogen || !form.phosphorus || !form.potassium) {
            setError("Complete the soil test information to get accurate crop recommendations.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await services.recommendations.getCropRecommendations({
                farm_id: activeFarm?.id,
                ...form,
                ph: Number(form.ph),
                nitrogen: Number(form.nitrogen),
                phosphorus: Number(form.phosphorus),
                potassium: Number(form.potassium)
            });
            setResult(data);
            await loadHistory();
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Failed to fetch recommendations. Please verify your inputs and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="view-enter max-w-lg mx-auto flex flex-col gap-5">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-[var(--font-head)] font-extrabold text-[22px] text-[var(--color-dark)]">AI Crop Recommendation</h1>
                    <p className="text-[13px] text-[#5E7568]">Discover the best crops for your exact location, soil, and season.</p>
                </div>
                <GhostButton onClick={() => setShowHistory(!showHistory)}>
                    {showHistory ? "Recommendations" : "History"}
                </GhostButton>
            </div>

            {showHistory ? (
                <div className="flex flex-col gap-3">
                    {history.length === 0 && <Card className="text-center text-[#8AA093] py-8">No past recommendations.</Card>}
                    {history.map(h => (
                        <Card key={h.id} className="border-l-4 border-l-[var(--color-secondary)]">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-[15px]">Top Match: {h.recommendations?.[0]?.crop || 'Unknown'}</h3>
                                    <div className="text-[11px] text-[#8AA093]">{new Date(h.created_at).toLocaleDateString()}</div>
                                </div>
                                <div className="bg-[#E6F4EA] text-[var(--color-primary)] font-bold px-2 py-1 rounded text-[12px]">
                                    {h.recommendations?.[0]?.suitability_score || 0}% Match
                                </div>
                            </div>
                            <div className="mt-2 text-[12px] text-[#5E7568]">
                                Other suitable crops: {h.recommendations?.slice(1, 4).map((r:any) => r.crop).join(", ")}
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
                            
                            {!form.ph && !form.nitrogen && !form.phosphorus && !form.potassium && (
                                <div className="p-3 bg-[#FFF3E0] border border-[#E65100] text-[#E65100] rounded-lg text-[13px]">
                                    <strong>Complete soil data recommended!</strong><br/>
                                    We couldn't find a recent soil test. Recommendations are much more accurate when soil parameters are provided.
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-3">
                                <Input label="State" value={form.state} onChange={e => setForm({...form, state: e.target.value})} />
                                <Input label="District" value={form.district} onChange={e => setForm({...form, district: e.target.value})} />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <Select label="Season" value={form.season} onChange={e => setForm({...form, season: e.target.value})}>
                                    <option value="Kharif">Kharif</option>
                                    <option value="Rabi">Rabi</option>
                                    <option value="Zaid">Zaid</option>
                                </Select>
                                <Select label="Soil Type" value={form.soil_type} onChange={e => setForm({...form, soil_type: e.target.value})}>
                                    <option value="Red Soil">Red Soil</option>
                                    <option value="Black Cotton">Black Cotton</option>
                                    <option value="Alluvial">Alluvial</option>
                                    <option value="Clay">Clay</option>
                                    <option value="Loam">Loam</option>
                                </Select>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                <Input label="pH" type="number" value={form.ph} onChange={e => setForm({...form, ph: e.target.value})} placeholder="Opt." />
                                <Input label="N" type="number" value={form.nitrogen} onChange={e => setForm({...form, nitrogen: e.target.value})} placeholder="Opt." />
                                <Input label="P" type="number" value={form.phosphorus} onChange={e => setForm({...form, phosphorus: e.target.value})} placeholder="Opt." />
                                <Input label="K" type="number" value={form.potassium} onChange={e => setForm({...form, potassium: e.target.value})} placeholder="Opt." />
                            </div>

                            <Button onClick={calculate} disabled={loading} className="mt-2">
                                {loading ? t("common_loading") : "Get Recommendations"}
                            </Button>
                        </div>
                    </Card>

                    {result && (
                        <div className="flex flex-col gap-3">
                            <h2 className="font-bold text-[16px] mb-1">Top Matches</h2>
                            {result.recommendations.map((rec: any, i: number) => (
                                <Card key={i} className="border-l-4" style={{borderLeftColor: i === 0 ? 'var(--color-primary)' : 'var(--color-mist)'}}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-[18px] text-[var(--color-dark)]">{rec.crop}</h3>
                                            <div className="text-[12px] text-[#8AA093]">Suitability Score</div>
                                        </div>
                                        <div className="bg-[#E6F4EA] text-[var(--color-primary)] font-bold px-3 py-1 rounded-full">
                                            {rec.suitability_score}%
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-3">
                                        <div className="bg-[#F6F8F7] p-2 rounded-lg text-[12px]">
                                            <span className="font-semibold text-[#5E7568]">Water Req:</span>
                                            <div className="font-bold">{rec.water_req}</div>
                                        </div>
                                        <div className="bg-[#F6F8F7] p-2 rounded-lg text-[12px]">
                                            <span className="font-semibold text-[#5E7568]">Season:</span>
                                            <div className="font-bold">{rec.expected_season}</div>
                                        </div>
                                    </div>
                                    {rec.limitations?.length > 0 && (
                                        <div className="mt-3 text-[12px] text-[var(--color-danger)] bg-[#FBE8E7] p-2 rounded-lg">
                                            <span className="font-semibold block mb-1">Limitations:</span>
                                            <ul className="list-disc ml-4">
                                                {rec.limitations.map((l:string, idx:number) => <li key={idx}>{l}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
