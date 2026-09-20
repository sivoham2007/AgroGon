import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { PrimaryButton, Input, Select, Pill } from "../../components/ui/Primitives";
import { Card } from "../../components/cards/Cards";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { useApp } from "../../app/AppState";
import { services } from "../../services";

export function SoilFertilityScreen() {
  const navigate = useNavigate();
  const { farm } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    crop: "Rice",
    soilType: "Loamy",
    ph: "",
    nitrogen: "",
    phosphorus: "",
    potassium: "",
    organicMatter: "",
    sulfur: "",
    zinc: "",
    iron: "",
    boron: "",
  });

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function loadHistory() {}

  async function analyze() {
    if (!form.ph || !form.nitrogen || !form.phosphorus || !form.potassium) {
        setError("Complete the soil test information (pH, N, P, K) to analyze soil fertility.");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        farmId: farm?.id,
        crop: form.crop,
        soilType: form.soilType,
        ph: Number(form.ph),
        nitrogen: Number(form.nitrogen),
        phosphorus: Number(form.phosphorus),
        potassium: Number(form.potassium),
        organicMatter: form.organicMatter ? Number(form.organicMatter) : null,
        sulfur: form.sulfur ? Number(form.sulfur) : null,
        zinc: form.zinc ? Number(form.zinc) : null,
        iron: form.iron ? Number(form.iron) : null,
        boron: form.boron ? Number(form.boron) : null,
      };
      const res = await services.soilFertility.analyze(payload);
      setResult(res);
      await loadHistory();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Analysis failed. Please verify your inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-8" style={{ background: "linear-gradient(180deg,#5E412F,#3D2A1F)" }}>
        <Icon name="sun" className="w-12 h-12 text-[#F4B942]" style={{ animation: "spin 3s linear infinite" }} />
        <div className="font-bold text-white text-[17px]">Analyzing Soil Profile...</div>
        <div className="text-[13px] text-[#A6958B]">Computing fertility index against agronomic rules</div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="view-enter pb-4">
        <div className="px-5 py-4 flex items-center gap-3">
          <button onClick={() => setResult(null)} className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-mist-2)] text-[var(--color-dark)] hover:bg-[var(--color-mist)]">
            <Icon name="back" className="w-5 h-5" />
          </button>
          <h1 className="font-[var(--font-head)] font-extrabold text-[19px] text-[var(--color-dark)]">Soil Report</h1>
        </div>
        <div className="px-5 flex flex-col gap-4">
          
          <div className="bg-white rounded-2xl p-5 border border-black/5 text-center shadow-sm">
             <div className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">Fertility Score</div>
             <div className="text-5xl font-extrabold text-[var(--color-primary)] mt-2">{result.score}</div>
             <div className="text-sm font-medium mt-1 text-gray-700">/ 100</div>
             <div className="mt-4 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-1000" style={{ width: `${result.score}%`, backgroundColor: result.score > 70 ? '#2E9D68' : result.score > 40 ? '#F4B942' : '#E63946' }}></div>
             </div>
          </div>

          {result.deficiencies?.length > 0 && (
             <Card>
                <div className="font-[var(--font-head)] font-bold text-[15px] mb-3 text-[var(--color-danger)] flex items-center gap-2">
                   <Icon name="virus" className="w-4 h-4" /> Detected Deficiencies
                </div>
                <div className="flex flex-col gap-3">
                   {result.deficiencies.map((d: any, i: number) => (
                      <div key={i} className="flex justify-between items-start border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                         <div>
                            <div className="font-semibold text-sm">{d.nutrient}</div>
                            <div className="text-[12px] text-gray-500 mt-0.5">{d.action}</div>
                         </div>
                         <Pill level="high">{d.status}</Pill>
                      </div>
                   ))}
                </div>
             </Card>
          )}

          <Card>
             <div className="font-[var(--font-head)] font-bold text-[15px] mb-3 flex items-center gap-2 text-[var(--color-primary)]">
                <Icon name="check" className="w-4 h-4" /> Improvement Plan
             </div>
             <ul className="list-disc pl-5 space-y-2 text-[13px] text-gray-700">
                {result.plan?.map((p: string, i: number) => <li key={i}>{p}</li>)}
             </ul>
          </Card>

          {result.suitableCrops?.length > 0 && (
             <Card>
                <div className="font-[var(--font-head)] font-bold text-[15px] mb-3">Suitable Crops for this Soil</div>
                <div className="flex flex-wrap gap-2">
                   {result.suitableCrops.map((c: any, i: number) => (
                      <Pill key={i} level="low">{c.crop}</Pill>
                   ))}
                </div>
             </Card>
          )}

          <PrimaryButton onClick={() => navigate("/advisory")}>Discuss with Thatha AI</PrimaryButton>

        </div>
      </div>
    );
  }

  return (
    <div className="view-enter pb-6">
      <ScreenHeader title="Soil Fertility" back="/dashboard" />
      <div className="px-5">
         <p className="text-[13.5px] text-[#5E7568] mb-5 leading-relaxed">
            Enter your soil test parameters to calculate your Fertility Index, detect deficiencies, and get personalized recommendations.
         </p>
         
         <div className="flex flex-col gap-4">
            <div className="flex gap-3">
               <div className="flex-1">
                  <Select label="Crop" value={form.crop} onChange={e => update("crop", e.target.value)}>
                     <option>Rice</option><option>Wheat</option><option>Maize</option><option>Tomato</option><option>Potato</option>
                  </Select>
               </div>
               <div className="flex-1">
                  <Select label="Soil Type" value={form.soilType} onChange={e => update("soilType", e.target.value)}>
                     <option>Loamy</option><option>Clay</option><option>Sandy</option><option>Silt</option>
                  </Select>
               </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-black/5 flex flex-col gap-3">
               <div className="font-semibold text-sm text-[var(--color-primary)]">Core Parameters</div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="pH Level" type="number" step="0.1" value={form.ph} onChange={e => update("ph", e.target.value)} placeholder="6.5" />
                  <Input label="Nitrogen (kg/ha)" type="number" value={form.nitrogen} onChange={e => update("nitrogen", e.target.value)} placeholder="120" />
                  <Input label="Phosphorus (kg/ha)" type="number" value={form.phosphorus} onChange={e => update("phosphorus", e.target.value)} placeholder="45" />
                  <Input label="Potassium (kg/ha)" type="number" value={form.potassium} onChange={e => update("potassium", e.target.value)} placeholder="80" />
                  <Input label="Organic Matter (%)" type="number" step="0.1" value={form.organicMatter} onChange={e => update("organicMatter", e.target.value)} placeholder="2.0" />
               </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-black/5 flex flex-col gap-3">
               <div className="font-semibold text-sm text-gray-600">Micronutrients (ppm)</div>
               <div className="grid grid-cols-2 gap-3">
                  <Input label="Sulfur" type="number" value={form.sulfur} onChange={e => update("sulfur", e.target.value)} />
                  <Input label="Zinc" type="number" step="0.1" value={form.zinc} onChange={e => update("zinc", e.target.value)} />
                  <Input label="Iron" type="number" step="0.1" value={form.iron} onChange={e => update("iron", e.target.value)} />
                  <Input label="Boron" type="number" step="0.1" value={form.boron} onChange={e => update("boron", e.target.value)} />
               </div>
            </div>

            {error && (
                <div className="p-3 bg-[#FBE8E7] border border-[var(--color-danger)] text-[var(--color-danger)] rounded-lg text-[13px]">
                    {error}
                </div>
            )}

            <PrimaryButton onClick={analyze} className="mt-2 text-base h-12">Generate Soil Report</PrimaryButton>
         </div>
      </div>
    </div>
  );
}
