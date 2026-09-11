import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { PrimaryButton, SecondaryButton, GhostButton, Pill } from "../../components/ui/Primitives";
import { Card } from "../../components/cards/Cards";
import { ExplainableAIPanel } from "../../components/cards/Intelligence";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { useApp } from "../../app/AppState";
import { services } from "../../services";
import type { DiseaseResult, AIExplanation } from "../../types/domain";

type Stage = "capture" | "analyzing" | "result";

export function ScannerScreen() {
  const navigate = useNavigate();
  const { farm, showToast } = useApp();
  const [stage, setStage] = useState<Stage>("capture");
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  async function startScan() {
    setStage("analyzing");
    const res = await services.scan.scanCrop(farm.id, null);
    setResult(res);
    services.explain.getDiseaseExplanation(farm.id).then(setExplanation);
    setStage("result");
  }

  if (stage === "capture") {
    return (
      <div className="view-enter pb-4">
        <ScreenHeader title="Scan Your Crop" back="/dashboard" />
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
             <div className="flex flex-col gap-2.5">
                <PrimaryButton onClick={startScan}><Icon name="scan" className="w-4 h-4" /> Scan Crop</PrimaryButton>
                <div className="flex gap-2.5">
                  <div className="flex-1"><GhostButton onClick={() => setPreviewUrl(null)}>Cancel</GhostButton></div>
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
        <div className="font-[var(--font-head)] font-bold text-[15px] text-white">Analyzing crop...</div>
        <div className="text-[13px] text-[#9FC7AE]">Checking image quality → identifying crop → detecting symptoms</div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="view-enter pb-4">
      <ScreenHeader title="Scan Result" back="/dashboard" />
      <div className="px-5 flex flex-col gap-3.5">
        <Card className="!p-0 overflow-hidden">
          <div className="h-[150px] flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg,#2E9D68,#12352A)" }}>
            <Icon name="virus" className="w-12 h-12 opacity-85" />
          </div>
          <div className="p-4">
            <div className="font-mono text-[10.5px] tracking-[1.4px] uppercase text-[var(--color-secondary)] font-semibold">{result.crop.toUpperCase()} · AI CROP SCAN</div>
            <div className="flex items-center justify-between mt-1">
              <h2 className="font-[var(--font-head)] font-extrabold text-[19px]">Possible {result.label}</h2>
              <Pill level="medium">{result.severity}</Pill>
            </div>
            <div className="text-[13px] text-[#5E7568] mt-1">{result.note}</div>
          </div>
        </Card>
        <Card>
          <div className="flex justify-between"><span className="text-[13px] text-[#5E7568]">AI Confidence</span><b className="font-mono text-[var(--color-primary)]">{result.confidencePct}%</b></div>
          <div className="h-2 bg-[var(--color-mist)] rounded-md mt-2 overflow-hidden"><div className="h-full" style={{ width: `${result.confidencePct}%`, background: "linear-gradient(90deg,var(--color-secondary),var(--color-primary))" }} /></div>
          <div className="flex justify-between mt-3.5"><span className="text-[13px] text-[#5E7568]">Severity</span><b>{result.severity}</b></div>
          <div className="h-2 bg-[var(--color-mist)] rounded-md mt-2 overflow-hidden"><div className="h-full" style={{ width: `${result.severityPct}%`, background: "linear-gradient(90deg,var(--color-warning),var(--color-danger))" }} /></div>
        </Card>
        <Card>
          <div className="font-[var(--font-head)] font-bold text-[15px]">What this means</div>
          <p className="text-[13px] text-[#5E7568] mt-1.5">Early Blight is a common fungal condition that shows up as dark concentric spots on lower leaves. It spreads faster in warm, humid weather like today's forecast.</p>
        </Card>
        <Card>
          <div className="font-[var(--font-head)] font-bold text-[15px]">What you can do</div>
          <div className="flex flex-col gap-2.5 mt-2">
            {["Remove and dispose of visibly affected leaves", "Improve airflow — avoid overhead watering", "Follow locally approved agricultural guidance for treatment", "Re-scan in 3 days to track progress"].map((t) => (
              <div key={t} className="flex gap-2.5 items-start"><span className="text-[var(--color-primary)] mt-0.5"><Icon name="check" className="w-4 h-4" /></span><span className="text-[13px]">{t}</span></div>
            ))}
          </div>
        </Card>
        {explanation && <ExplainableAIPanel explanation={explanation} />}
        <PrimaryButton onClick={() => navigate("/advisory")}>Ask AgroGon AI</PrimaryButton>
        <SecondaryButton onClick={() => navigate("/treatment/zone/D")}>View Treatment Zone</SecondaryButton>
        <SecondaryButton onClick={() => navigate("/drone")}><Icon name="drone" className="w-4 h-4" /> Create Drone Mission</SecondaryButton>
        <GhostButton onClick={() => navigate("/history")}>View History</GhostButton>
        <GhostButton onClick={() => showToast("Report submitted to hyperlocal network")}>Report Disease to Community</GhostButton>
        <div className="text-center text-[11.5px] text-[#8AA093]">
          AI results are estimates, not guaranteed diagnoses. {result.isMock && <span className="font-mono">(model: {result.modelVersion})</span>}
        </div>
      </div>
    </div>
  );
}
