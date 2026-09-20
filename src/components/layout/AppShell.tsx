import type { ReactNode } from "react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "../ui/Icon";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { LogoBadge } from "../ui/Brand";
import { useApp } from "../../app/AppState";
import { useT } from "../../i18n/useT";
import { ThathaAI } from "../ThathaAI";

const PUBLIC_ROUTES = new Set(["/", "/onboarding", "/login", "/otp", "/register"]);

const NAV_ITEMS = [
  { path: "/dashboard", key: "nav_dashboard" as const, icon: "home" as const },
  { path: "/disease-detector", key: "nav_diseaseDetector" as const, icon: "disease" as const },
  { path: "/soil-fertility", key: "nav_soilFertility" as const, icon: "sensor" as const },
  { path: "/farm", key: "nav_myFarm" as const, icon: "farm" as const },
  { path: "/risk", key: "nav_cropHealth" as const, icon: "gauge" as const },
  { path: "/weather", key: "nav_weatherAlerts" as const, icon: "cloud" as const },
  { path: "/alerts", key: "nav_alerts" as const, icon: "alerts" as const },
  { path: "/recommendations", key: "nav_recommendations" as const, icon: "chat" as const },
  { path: "/crop-recommendation", key: "nav_cropRecommendation" as const, icon: "farm" as const },
  { path: "/crop-calendar", key: "nav_cropCalendar" as const, icon: "calendar" as const },
  { path: "/fertilizer-calculator", key: "nav_fertilizerCalc" as const, icon: "check" as const },
  { path: "/pesticide-calculator", key: "nav_pesticideCalc" as const, icon: "check" as const },
  { path: "/tasks", key: "nav_tasks" as const, icon: "check" as const },
  { path: "/camera", key: "nav_cameraMonitoring" as const, icon: "camera" as const },
  { path: "/reports", key: "nav_reports" as const, icon: "history" as const },
  { path: "/admin", key: "nav_adminPanel" as const, icon: "settings" as const },
];

const SECONDARY_ITEMS = [
  { path: "/settings", key: "nav_settings" as const, icon: "settings" as const },
  { path: "/profile", key: "nav_profile" as const, icon: "profile" as const },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();

  function go(path: string) {
    navigate(path);
    onNavigate?.();
  }

  return (
    <div className="h-full flex flex-col bg-[var(--color-dark)] text-white">
      <button onClick={() => go("/dashboard")} className="flex items-center gap-2.5 px-5 py-5 flex-none">
        <LogoBadge />
        <span className="font-[var(--font-head)] font-extrabold text-[17px] tracking-wide">AgroGon</span>
      </button>

      <nav className="flex-1 overflow-y-auto px-3 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          return (
            <button
              key={item.path}
              onClick={() => go(item.path)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors text-left
              ${active ? "bg-white/12 text-white" : "text-[#B9D4C3] hover:bg-white/6 hover:text-white"}`}
            >
              <Icon name={item.icon} className="w-[18px] h-[18px] flex-none" />
              <span className="truncate">{t(item.key)}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-3 flex flex-col gap-0.5 border-t border-white/10 flex-none">
        {SECONDARY_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => go(item.path)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors text-left
              ${active ? "bg-white/12 text-white" : "text-[#B9D4C3] hover:bg-white/6 hover:text-white"}`}
            >
              <Icon name={item.icon} className="w-[18px] h-[18px] flex-none" />
              {t(item.key)}
            </button>
          );
        })}
        <button
          onClick={() => go("/login")}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-semibold text-[#E8A8A6] hover:bg-white/6 text-left"
        >
          <Icon name="back" className="w-[18px] h-[18px] flex-none rotate-180" />
          {t("nav_logout")}
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();
  const { farmer, online, toast } = useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isPublic = PUBLIC_ROUTES.has(location.pathname);

  if (isPublic) {
    // Landing/auth flow renders its own full-bleed layout (no sidebar).
    return <div className="min-h-screen bg-[var(--color-bg)]">{children}</div>;
  }

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-none sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 h-full"><SidebarContent onNavigate={() => setDrawerOpen(false)} /></div>
          <div className="flex-1 bg-black/40" onClick={() => setDrawerOpen(false)} />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[var(--color-mist)]">
          <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button className="lg:hidden w-9 h-9 rounded-lg border border-[var(--color-mist)] flex items-center justify-center" onClick={() => setDrawerOpen(true)} aria-label="Menu">
                <Icon name="settings" className="w-[18px] h-[18px]" />
              </button>
              <button onClick={() => navigate("/dashboard")} className="lg:hidden flex items-center gap-2">
                <LogoBadge size={32} />
              </button>
            </div>
            <div className="flex items-center gap-2.5">
              <span className={`hidden sm:flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${online ? "bg-[#E7F5EC] text-[var(--color-primary)]" : "bg-[#FFF3E0] text-[#9A6B0A]"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-[var(--color-secondary)]" : "bg-[var(--color-warning)]"}`} />
                {online ? t("status_online") : t("status_offline")}
              </span>
              <LanguageSwitcher compact />
              <button className="w-9 h-9 rounded-full bg-white border border-[var(--color-mist)] flex items-center justify-center relative" onClick={() => navigate("/notifications")}>
                <Icon name="bell" className="w-[16px] h-[16px]" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[var(--color-danger)] rounded-full" />
              </button>
              <button onClick={() => navigate("/profile")} className="hidden sm:flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-[var(--color-mist)] bg-white">
                <div className="w-7 h-7 rounded-full bg-[var(--color-mist-2)] flex items-center justify-center text-[var(--color-primary)]">
                  <Icon name="profile" className="w-4 h-4" />
                </div>
                <span className="text-[12.5px] font-bold text-[var(--color-dark)]">{farmer.name}</span>
                <Icon name="chev" className="w-3 h-3 text-[#8AA093] rotate-90" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-6 pb-10 relative">
          {children}
          {toast && (
            <div className="fixed left-1/2 -translate-x-1/2 bottom-8 bg-[var(--color-dark)] text-white px-4 py-3 rounded-2xl text-[13px]
              flex items-center gap-2.5 shadow-2xl z-50">
              <Icon name="check" className="w-4 h-4 text-[var(--color-accent)]" />
              <span>{toast}</span>
            </div>
          )}
          <ThathaAI />
        </main>
      </div>
    </div>
  );
}
