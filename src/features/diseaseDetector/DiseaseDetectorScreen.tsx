import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { PrimaryButton, SecondaryButton, GhostButton, Pill, Select } from "../../components/ui/Primitives";
import { Card } from "../../components/cards/Cards";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { useApp } from "../../app/AppState";
import { services } from "../../services";

type Stage = "capture" | "analyzing" | "result";

export function DiseaseDetectorScreen() {
  const navigate = useNavigate();
  const { farm, showToast } = useApp();
  const [stage, setStage] = useState<Stage>("capture");
  const [result, setResult] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [crop, setCrop] = useState<string>("Unknown");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setImageFile(file);
    }
  }

  async function startScan() {
    if (!imageFile) return;
    setStage("analyzing");
    try {
      const res = await services.disease.scanCrop(farm.id, imageFile, crop);
      setResult(res);
      setStage("result");
    } catch (e) {
      showToast("Error analyzing crop image");
      setStage("capture");
    }
  }

  if (stage === "capture") {
    return (
      <div className="view-enter pb-4">
        <ScreenHeader title="Disease Detector" back="/dashboard" />
        <div className="px-5 flex flex-col gap-3.5">
          <div className="relative h-[300px] rounded-2xl overflow-hidden flex items-center justify-center bg-black/5" style={{ background: previewUrl ? "#000" : "linear-gradient(180deg,#0F2A20,#12352A)" }}>
            {previewUrl ? (
              <img src={previewUrl} className="w-full h-full object-contain" alt="Crop preview" />
            ) : (
              <div className="text-center text-[#8AA093] px-5">
                <Icon name="camera" className="w-14 h-14 mx-auto mb-2.5 opacity-70" />
                <div className="text-[12.5px] text-[#BFE0CC]">Camera preview</div>
              </div>
            )}
            {!previewUrl && <div className="absolute inset-9 border-2 rounded-[18px]" style={{ borderColor: "rgba(244,185,66,0.8)" }} />}
          </div>
          
          <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleFile} />
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFile} />

          {previewUrl ? (
             <div className="flex flex-col gap-2.5 mt-2">
                <div className="bg-white p-3 rounded-lg border border-black/5">
                   <Select label="Select Crop" value={crop} onChange={(e) => setCrop(e.target.value)}>
                      <option value="Unknown">Auto Detect</option>
                      <option value="Rice">Rice</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Tomato">Tomato</option>
                      <option value="Potato">Potato</option>
                      <option value="Maize">Maize</option>
                   </Select>
                </div>
                <PrimaryButton onClick={startScan}><Icon name="scan" className="w-4 h-4" /> Scan Crop</PrimaryButton>
                <div className="flex gap-2.5">
                  <div className="flex-1"><GhostButton onClick={() => { setPreviewUrl(null); setImageFile(null); }}>Cancel</GhostButton></div>
                </div>
             </div>
          ) : (
            <>
              <Card tight className="text-center text-[13px] text-[#5E7568]">📸 Capture a clear image of the affected leaf or plant.</Card>
              <div className="flex gap-2.5">
                <div className="flex-1"><PrimaryButton onClick={() => cameraInputRef.current?.click()}><Icon name="camera" className="w-4 h-4" /> Take Photo</PrimaryButton></div>
                <div className="flex-1"><SecondaryButton onClick={() => fileInputRef.current?.click()}><Icon name="gallery" className="w-4 h-4" /> Upload</SecondaryButton></div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (stage === "analyzing") {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-8" style={{ background: "linear-gradient(180deg,#0F2A20,#12352A)" }}>
        <div className="w-16 h-16 text-[var(--color-accent)]" style={{ animation: "leafPulse 1.4s infinite" }}>
          <Icon name="scan" className="w-full h-full" />
        </div>
        <div className="font-[var(--font-head)] font-bold text-[15px] text-white">Analyzing crop image via AI...</div>
        <div className="text-[13px] text-[#9FC7AE]">Checking image quality → identifying disease → formulating recommendations</div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="view-enter pb-4">
      <ScreenHeader title="Scan Result" back="/dashboard" />
      <div className="px-5 flex flex-col gap-3.5">
        <Card className="!p-0 overflow-hidden">
          <div className="h-[150px] flex items-center justify-center text-white relative" style={{ background: "linear-gradient(135deg,#2E9D68,#12352A)" }}>
            {previewUrl && <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" />}
            <Icon name="virus" className="w-12 h-12 opacity-85 z-10" />
          </div>
          <div className="p-4 relative z-20 bg-white">
            <div className="font-mono text-[10.5px] tracking-[1.4px] uppercase text-[var(--color-secondary)] font-semibold">{crop.toUpperCase()} · AI SCAN</div>
            <div className="flex items-start justify-between mt-1 gap-2">
              <h2 className="font-[var(--font-head)] font-extrabold text-[19px] leading-tight">{result.possible_disease}</h2>
              <Pill level={result.severity === "Critical" || result.severity === "High" ? "high" : result.severity === "Moderate" ? "medium" : "low"}>{result.severity}</Pill>
            </div>
            <div className="text-[13px] text-[#5E7568] mt-2">Confidence: <span className="font-bold text-[var(--color-primary)]">{result.confidence}%</span></div>
          </div>
        </Card>
        
        <Card>
          <div className="font-[var(--font-head)] font-bold text-[15px] mb-2">Symptoms</div>
          <ul className="text-[13px] text-[#5E7568] list-disc pl-4 space-y-1">
             {result.symptoms?.map((s: string, i: number) => <li key={i}>{s}</li>)}
          </ul>
        </Card>

        <Card>
          <div className="font-[var(--font-head)] font-bold text-[15px] mb-2">Causes</div>
          <ul className="text-[13px] text-[#5E7568] list-disc pl-4 space-y-1">
             {result.causes?.map((c: string, i: number) => <li key={i}>{c}</li>)}
          </ul>
        </Card>

        <Card>
          <div className="font-[var(--font-head)] font-bold text-[15px] mb-2 text-[var(--color-primary)]">Recommendations</div>
          <div className="flex flex-col gap-2.5">
            {result.recommendations?.map((r: string, i: number) => (
              <div key={i} className="flex gap-2.5 items-start">
                <span className="text-[var(--color-primary)] mt-0.5"><Icon name="check" className="w-4 h-4" /></span>
                <span className="text-[13px] font-medium text-gray-800">{r}</span>
              </div>
            ))}
          </div>
        </Card>
        
        <PrimaryButton onClick={() => navigate("/advisory")}>Ask Thatha AI</PrimaryButton>
        <GhostButton onClick={() => { setStage("capture"); setImageFile(null); setPreviewUrl(null); setResult(null); }}>Scan Another</GhostButton>
        
        <div className="text-center text-[11.5px] text-[#8AA093] mt-4 px-4">
          AI results are estimates based on visual symptoms. For definitive diagnoses, consult local agricultural authorities.
        </div>
      </div>
    </div>
  );
}
