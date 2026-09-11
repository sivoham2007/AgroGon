import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { Card, FieldMap } from "../../components/cards/Cards";
import { PrimaryButton, SecondaryButton, GhostButton, Pill } from "../../components/ui/Primitives";
import { PageHeader as ScreenHeader } from "../../components/layout/PageHeader";
import { useApp } from "../../app/AppState";
import { useT } from "../../i18n/useT";
import { services } from "../../services";
import { SEED_ZONES } from "../../data/seedData";
import type { DroneInfo, MissionOptimization, MissionReport } from "../../types/domain";

export function DroneHomeScreen() {
  const navigate = useNavigate();
  const t = useT();
  const [info, setInfo] = useState<DroneInfo | null>(null);
  useEffect(() => { services.missionPlanning.getDroneInfo().then(setInfo); }, []);

  return (
    <div className="view-enter pb-4">
      <ScreenHeader title={t("drone_title")} back="/treatment" eyebrow={t("drone_simMode")} />
      <div className="px-5 flex flex-col gap-3.5">
        <Card>
          <div className="flex justify-between items-center"><span className="text-[13px] text-[#5E7568]">{info?.name ?? "AgroGon Precision One"}</span><Pill level="low">READY</Pill></div>
          <div className="font-mono text-[11px] text-[#8AA093]">{info?.droneId ?? "AG-DRN-001"}</div>
          <div className="h-px bg-[var(--color-mist)] my-3.5" />
          <div className="grid grid-cols-2 gap-3">
            <div><div className="text-[13px] text-[#5E7568]">{t("drone_battery")}</div><b>{info?.batteryPct ?? 82}%</b></div>
            <div><div className="text-[13px] text-[#5E7568]">{t("drone_gps")}</div><b>{info?.gpsStatus ?? "Connected"}</b></div>
            <div><div className="text-[13px] text-[#5E7568]">{t("drone_flightStatus")}</div><b>{info?.flightStatus ?? "Ready"}</b></div>
            <div><div className="text-[13px] text-[#5E7568]">{t("drone_altitude")}</div><b>{info?.altitudeM ?? 0} m</b></div>
            <div><div className="text-[13px] text-[#5E7568]">{t("drone_estFlightTime")}</div><b>{info?.estimatedFlightTimeMin ?? 14} min</b></div>
            <div><div className="text-[13px] text-[#5E7568]">{t("drone_payload")}</div><b>{info?.payloadStatus ?? "Loaded"}</b></div>
          </div>
        </Card>
        <FieldMap zones={SEED_ZONES} height={180} dimInactive="D" />
        <Card tight>
          <div className="font-mono text-[10.5px] tracking-[1.4px] uppercase text-[var(--color-secondary)] font-semibold">{t("drone_mission")} #AG-1024</div>
          <div className="flex justify-between mt-1"><span className="text-[13px] text-[#5E7568]">{t("drone_target")}</span><b>Zone D</b></div>
          <div className="flex justify-between"><span className="text-[13px] text-[#5E7568]">{t("drone_type")}</span><b>Disease Treatment</b></div>
          <div className="flex justify-between"><span className="text-[13px] text-[#5E7568]">{t("drone_estArea")}</span><b>0.35 {t("common_acres").toLowerCase()}</b></div>
        </Card>
        <Card tight className="bg-[#FFF8E9] text-[13px] text-[#7A5B0A]" style={{ borderColor: "#F3E1AE" }}>
          {t("drone_approvalWarning")}
        </Card>
        <PrimaryButton onClick={() => navigate("/drone/optimize")}>{t("drone_planMissionBtn")}</PrimaryButton>
      </div>
    </div>
  );
}

export function MissionOptimizeScreen() {
  const navigate = useNavigate();
  const t = useT();
  const [opt, setOpt] = useState<MissionOptimization | null>(null);
  const [missionType, setMissionType] = useState("Disease Treatment");
  useEffect(() => { services.missionPlanning.getOptimization("D").then(setOpt); }, []);

  return (
    <div className="view-enter pb-4">
      <ScreenHeader title={t("drone_optTitle")} back="/drone" />
      <div className="px-5 flex flex-col gap-3.5">
        <Card>
          <div className="font-[var(--font-head)] font-bold text-[15px] mb-2">{t("drone_missionSetup")}</div>
          <div className="flex flex-col gap-2.5 text-[13px]">
            <div className="flex justify-between"><span className="text-[#5E7568]">{t("drone_optFarm")}</span><b>Green Valley Farm</b></div>
            <div className="flex justify-between"><span className="text-[#5E7568]">{t("drone_optZone")}</span><b>Zone D</b></div>
            <label className="flex justify-between items-center">
              <span className="text-[#5E7568]">{t("drone_type")}</span>
              <select value={missionType} onChange={(e) => setMissionType(e.target.value)} className="border border-[var(--color-mist)] rounded-lg px-2 py-1.5 text-[12.5px] bg-white">
                <option>Disease Treatment</option><option>Pest Control</option><option>Nutrient Application</option><option>Crop Monitoring</option><option>Field Survey</option>
              </select>
            </label>
            <div className="flex justify-between"><span className="text-[#5E7568]">{t("drone_optCoverage")}</span><b>0.35 {t("common_acres").toLowerCase()}</b></div>
          </div>
        </Card>
        {opt && (
          <Card>
            <div className="font-[var(--font-head)] font-bold text-[15px] mb-2">{t("drone_recOptimization")}</div>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div><div className="text-[#5E7568]">{t("drone_altitude")}</div><b>{opt.recommendedAltitudeM} m</b></div>
              <div><div className="text-[#5E7568]">{t("drone_speed")}</div><b>{opt.recommendedSpeedMs} m/s</b></div>
              <div><div className="text-[#5E7568]">{t("drone_sprayIntensity")}</div><b>{opt.recommendedSprayIntensity}</b></div>
              <div><div className="text-[#5E7568]">{t("drone_waypoints")}</div><b>{opt.waypointCount}</b></div>
              <div><div className="text-[#5E7568]">{t("drone_estFlightTime")}</div><b>{opt.estimatedFlightTimeMin} min</b></div>
              <div><div className="text-[#5E7568]">{t("drone_estBattery")}</div><b>{opt.estimatedBatteryUsagePct}%</b></div>
            </div>
            <div className="mt-3 pt-3 border-t border-[var(--color-mist)]">
              <div className="text-[12.5px] font-bold text-[var(--color-primary)]">{t("drone_whyRoute")}</div>
              <p className="text-[13px] text-[#5E7568] mt-1">{opt.routeRationale}</p>
            </div>
          </Card>
        )}
        <PrimaryButton onClick={() => navigate("/drone/mission")}>{t("drone_continueApproval")}</PrimaryButton>
      </div>
    </div>
  );
}

const MISSION_STEPS = [
  { t: "Mission Planning", d: "Route generated across Zone D (0.35 acres)." },
  { t: "Farmer Approval", d: "Awaiting your confirmation to proceed." },
  { t: "Drone Taking Off", d: "AG-1024 has left the launch pad." },
  { t: "Flying to Zone", d: "En route to Zone D, ETA 40 seconds." },
  { t: "Target Zone Reached", d: "Drone positioned over treatment area." },
  { t: "Application in Progress", d: "Targeted treatment being applied." },
  { t: "Mission Completed", d: "0.35 acres treated successfully." },
];
const DRONE_POS = [
  { top: "85%", left: "10%" }, { top: "85%", left: "10%" }, { top: "70%", left: "20%" },
  { top: "50%", left: "45%" }, { top: "30%", left: "68%" }, { top: "30%", left: "68%" }, { top: "30%", left: "68%" },
];

export function MissionSimScreen() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const t = useT();
  const [stage, setStage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showAbort, setShowAbort] = useState(false);
  const [battery, setBattery] = useState(82);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current); }, []);

  function runTimer() {
    timer.current = window.setInterval(() => {
      setStage((s) => {
        if (s >= MISSION_STEPS.length - 1) { if (timer.current) window.clearInterval(timer.current); return s; }
        return s + 1;
      });
      setBattery((b) => Math.max(64, b - 3));
    }, 1300);
  }

  async function approve() {
    await services.drone.approveMission("AG-1024");
    setStage(2);
    showToast("Mission approved — drone launching");
    runTimer();
  }

  function togglePause() {
    if (paused) { runTimer(); setPaused(false); showToast("Mission resumed"); }
    else { if (timer.current) window.clearInterval(timer.current); setPaused(true); showToast("Mission paused"); }
  }

  function confirmAbort() {
    if (timer.current) window.clearInterval(timer.current);
    setShowAbort(false);
    showToast("Mission aborted — returning to home");
    setTimeout(() => navigate("/drone"), 1200);
  }

  const pos = DRONE_POS[stage];

  return (
    <div className="view-enter pb-4 relative">
      <ScreenHeader title={`${t("drone_simTitle")} #AG-1024`} back="/drone/optimize" />
      <div className="px-5">
        <div className="relative rounded-2xl overflow-hidden border border-[var(--color-mist)] h-[190px]"
          style={{ background: "repeating-linear-gradient(0deg,#DCEBE1 0 2px,transparent 2px 18px),repeating-linear-gradient(90deg,#DCEBE1 0 2px,transparent 2px 18px),#EAF3EC" }}>
          {SEED_ZONES.map((z) => (
            <div key={z.id} className="absolute rounded-lg" style={{ top: z.top, left: z.left, width: z.width, height: z.height, background: z.color, opacity: z.id === "D" ? 0.9 : 0.25 }} />
          ))}
          <div className="absolute w-[22px] h-[22px] transition-all duration-[1100ms] ease-linear" style={{ top: pos.top, left: pos.left }}>
            <Icon name="drone" className="w-full h-full text-[var(--color-dark)]" />
          </div>
          {stage > 1 && stage < MISSION_STEPS.length - 1 && (
            <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-lg text-[10px] font-mono font-bold">🔋 {battery}%</div>
          )}
        </div>
      </div>
      <div className="px-5 pt-3.5">
        <Card>
          <div className="flex flex-col mt-2">
            {MISSION_STEPS.map((s, i) => {
              const isActive = i === stage;
              const isPast = i < stage;
              const isFuture = i > stage;
              
              return (
                <div key={s.t} className={`flex gap-3.5 transition-opacity duration-300 ${isFuture ? 'opacity-60' : 'opacity-100'}`}>
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold flex-none transition-all duration-300 ${isActive ? 'ring-4 ring-[#F4B942]/30 bg-[#F4B942] text-white' : isPast ? 'bg-[#2E9D68] text-white' : 'bg-[#EAF3EC] text-[#8AA093]'}`}>
                      {isPast ? "✓" : i + 1}
                    </div>
                    {i < MISSION_STEPS.length - 1 && <div className={`w-[2px] flex-1 min-h-[24px] my-1 ${isPast ? 'bg-[#2E9D68]' : 'bg-[var(--color-mist)]'}`} />}
                  </div>
                  <div className="pb-4 pt-0.5">
                    <div className="flex items-center gap-2">
                      <b className="text-[13.5px] text-[var(--color-dark)]">{s.t}</b>
                      {isActive && <span className="bg-[#F4B942]/20 text-[#D97706] text-[9.5px] uppercase font-bold px-1.5 py-0.5 rounded animate-pulse">In Progress</span>}
                    </div>
                    <div className="text-[13px] text-[#5E7568] mt-0.5 leading-snug">
                      {isActive && paused ? "Mission paused by operator." : (!isFuture || i === 1) ? s.d : "Waiting for previous step..."}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <div className="px-5 pt-3.5 flex flex-col gap-2.5">
        {stage === 1 ? (
          <div className="flex gap-2.5">
            <div className="flex-1"><SecondaryButton onClick={() => navigate("/drone/optimize")}>Cancel</SecondaryButton></div>
            <div className="flex-1"><PrimaryButton onClick={approve}>Approve</PrimaryButton></div>
          </div>
        ) : stage > 1 && stage < MISSION_STEPS.length - 1 ? (
          <div className="flex gap-2.5">
            <div className="flex-1"><SecondaryButton onClick={togglePause}>{paused ? "Resume" : "Pause"}</SecondaryButton></div>
            <div className="flex-1">
              <button className="w-full rounded-2xl px-5 py-4 font-bold text-[var(--color-danger)] bg-[#FBE8E7]" onClick={() => setShowAbort(true)}>{t("drone_abortBtn")}</button>
            </div>
          </div>
        ) : stage === MISSION_STEPS.length - 1 ? (
          <PrimaryButton onClick={() => navigate("/drone/report")}>{t("drone_finishBtn")}</PrimaryButton>
        ) : null}
      </div>

      {showAbort && (
        <div className="absolute inset-0 z-50 bg-black/40 flex items-end">
          <div className="w-full bg-white rounded-t-3xl p-5 flex flex-col gap-3">
            <div className="font-[var(--font-head)] font-bold text-[16px]">{t("drone_abortPrompt")}</div>
            <p className="text-[13px] text-[#5E7568]">{t("drone_abortDesc")}</p>
            <div className="flex gap-2.5">
              <div className="flex-1"><SecondaryButton onClick={() => setShowAbort(false)}>{t("drone_keepFlying")}</SecondaryButton></div>
              <div className="flex-1"><button className="w-full rounded-2xl px-5 py-4 font-bold text-white bg-[var(--color-danger)]" onClick={confirmAbort}>{t("drone_confirmAbort")}</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MissionReportScreen() {
  const navigate = useNavigate();
  const t = useT();
  const [report, setReport] = useState<MissionReport | null>(null);
  useEffect(() => { services.missionPlanning.getReport("AG-1024").then(setReport); }, []);
  if (!report) return null;

  return (
    <div className="view-enter pb-4">
      <ScreenHeader title={t("drone_reportTitle")} back="/drone/mission" />
      <div className="px-5 flex flex-col gap-3.5">
        <Card className="text-center text-white border-none" style={{ background: "linear-gradient(135deg,#1B7F4C,#12352A)" }}>
          <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-2">
            <Icon name="check" className="w-7 h-7" />
          </div>
          <div className="font-[var(--font-head)] font-extrabold text-[18px]">{t("drone_reportSuccess")}</div>
          <div className="font-mono text-[11px] opacity-80 mt-1">#{report.code}</div>
        </Card>
        <Card>
          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <div><div className="text-[#5E7568]">{t("drone_areaCovered")}</div><b>{report.areaCoveredAcres} {t("common_acres").toLowerCase()}</b></div>
            <div><div className="text-[#5E7568]">{t("drone_flightDuration")}</div><b>{report.flightDurationMin} min</b></div>
            <div><div className="text-[#5E7568]">{t("drone_batteryUsed")}</div><b>{report.batteryUsedPct}%</b></div>
            <div><div className="text-[#5E7568]">{t("drone_coverage")}</div><b>{report.coveragePct}%</b></div>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--color-mist)] text-[13px]">
            <div className="text-[#5E7568]">{t("drone_treatmentApplied")}</div><b>{report.treatmentApplied}</b>
          </div>
        </Card>
        <PrimaryButton onClick={() => navigate("/digital-twin")}>{t("drone_viewDigitalTwin")}</PrimaryButton>
        <SecondaryButton onClick={() => navigate("/history")}>{t("drone_viewTimeline")}</SecondaryButton>
        <SecondaryButton onClick={() => navigate("/drone/optimize")}>{t("drone_createAnother")}</SecondaryButton>
        <GhostButton onClick={() => navigate("/dashboard")}>{t("drone_returnDash")}</GhostButton>
      </div>
    </div>
  );
}
