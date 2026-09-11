import { useEffect, useState } from "react";

const SPLASH_SEEN_KEY = "agrogon.splashSeen";

export function useSplashGate() {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.sessionStorage.getItem(SPLASH_SEEN_KEY);
  });

  useEffect(() => {
    if (!showSplash) return;
    const t = setTimeout(() => {
      window.sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
      setShowSplash(false);
    }, 2600);
    return () => clearTimeout(t);
  }, [showSplash]);

  return showSplash;
}

export function SplashScreen() {
  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-5 text-white"
      style={{ background: "radial-gradient(ellipse at 50% 35%, #123924 0%, #081812 70%)", animation: "splashFade 2.6s ease forwards" }}
    >
      <img
        src="/images/agrogon-splash-logo.png"
        alt="AgroGon"
        className="w-[260px] sm:w-[320px] h-auto"
        style={{ animation: "logoPulse 1.3s ease-in-out infinite" }}
      />
      <div className="flex items-center gap-1.5 -mt-2">
        <span className="text-[12px] font-semibold tracking-[2px] text-[#9FC7AE]">Loading</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]"
            style={{ animation: `dotBlink 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
      <style>{`
        @keyframes logoPulse { 0%,100% { transform: scale(1); filter: drop-shadow(0 0 22px rgba(46,157,104,0.35)); } 50% { transform: scale(1.035); filter: drop-shadow(0 0 40px rgba(46,157,104,0.55)); } }
        @keyframes dotBlink { 0%,80%,100% { opacity: 0.25; } 40% { opacity: 1; } }
        @keyframes splashFade { 0% { opacity: 1; } 78% { opacity: 1; } 100% { opacity: 0; visibility: hidden; } }
      `}</style>
    </div>
  );
}
