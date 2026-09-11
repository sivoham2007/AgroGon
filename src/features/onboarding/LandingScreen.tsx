import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { LanguageSwitcher } from "../../components/ui/LanguageSwitcher";
import { BrandLockup } from "../../components/ui/Brand";
import { useT } from "../../i18n/useT";

const FEATURES: { icon: Parameters<typeof Icon>[0]["name"]; title: string; body: string }[] = [
  { icon: "scan", title: "AI Disease Detection", body: "Photograph a leaf and get an early, explainable read on possible disease or pest pressure." },
  { icon: "gauge", title: "Crop Risk Intelligence", body: "Combines weather, soil, and scan history into a clear risk score with reasons, not just numbers." },
  { icon: "droplet", title: "Smart Irrigation Advisor", body: "Tells you when to irrigate and when to hold off, based on soil moisture and the forecast." },
];

export function LandingScreen() {
  const navigate = useNavigate();
  const t = useT();

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Hero Section with Background */}
      <div 
        className="relative pt-5 pb-32 bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: "url('/farm-hero-bg.jpg')" }}
      >
        {/* Overlay gradient to fade into white at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/60 to-white pointer-events-none"></div>

        {/* Header (Overlaid on Hero) */}
        <header className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <BrandLockup badgeSize={38} textSize={20} />
          <div className="flex items-center gap-5">
            <div className="bg-white rounded-full shadow-sm py-1 px-3 flex items-center">
               <LanguageSwitcher compact />
            </div>
            <button onClick={() => navigate("/login")} className="text-[15px] font-bold text-[#1b7f4c] hover:opacity-80 transition-opacity pr-2">
              Sign In
            </button>
          </div>
        </header>

        {/* Hero Content */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-24 sm:pt-32 pb-16">
          <div className="max-w-[600px] flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-1.5 text-[12px] font-bold text-[#1b7f4c] bg-[#E7F5EC] px-3.5 py-1.5 rounded-full shadow-sm">
              <Icon name="leafshield" className="w-4 h-4" /> Smart Agriculture Platform
            </span>
            <h1 className="font-[var(--font-head)] font-extrabold text-[42px] sm:text-[54px] leading-[1.05] tracking-tight text-[#112f20]">
              Your Farm. Your Data.<br />
              Your Intelligent Crop<br />
              Guardian.
            </h1>
            <p className="text-[16px] text-[#4a5e53] leading-relaxed max-w-md font-medium">
              AI-assisted crop monitoring, disease detection, and precision recommendations for Indian farmers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-3">
              <button onClick={() => navigate("/onboarding")} className="rounded-2xl px-7 py-3.5 font-[var(--font-head)] font-bold text-[15.5px] text-white bg-[#228f57] hover:bg-[#1b7f4c] transition-colors shadow-[0_4px_14px_rgba(34,143,87,0.3)]">
                Get Started
              </button>
              <button onClick={() => navigate("/login")} className="rounded-2xl px-7 py-3.5 font-[var(--font-head)] font-bold text-[15.5px] text-[#228f57] bg-white border-[1.5px] border-[#228f57] hover:bg-[#f8fbf9] transition-colors shadow-sm">
                I already have an account
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Features Section */}
      <section className="flex-1 bg-white pt-10 pb-28">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <h2 className="font-[var(--font-head)] font-extrabold text-[26px] sm:text-[30px] text-[#112f20] tracking-tight text-center mb-3">
            Everything your farm needs, connected
          </h2>
          <p className="text-[15px] text-[#5E7568] text-center max-w-2xl mx-auto mb-14">
            One platform from detection to decision — not a pile of disconnected tools.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="p-8 rounded-[20px] border border-[#eef5f0] bg-[#f8faf9] hover:shadow-sm transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#E7F5EC] text-[#228f57] flex items-center justify-center mb-5">
                  <Icon name={f.icon} className="w-6 h-6" />
                </div>
                <div className="font-[var(--font-head)] font-extrabold text-[16px] text-[#112f20] mb-2.5">
                  {f.title}
                </div>
                <p className="text-[14px] text-[#5E7568] leading-relaxed">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
