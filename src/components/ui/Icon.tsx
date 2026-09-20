// Shared icon set — stroke-based, consistent sizing, single source of truth
// for every icon used across the app.
import type { SVGProps } from "react";

type IconName =
  | "home" | "farm" | "scan" | "alerts" | "profile" | "back" | "bell"
  | "camera" | "gallery" | "droplet" | "bug" | "virus" | "cloud" | "drone"
  | "chat" | "gauge" | "map" | "history" | "check" | "chev" | "settings"
  | "globe" | "pin" | "copy" | "wifioff" | "leafshield" | "send" | "close"
  | "disease" | "sensor" | "calendar" | "sun" | "calculator";

export function Icon({ name, className = "", ...rest }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "home": return <svg className={className} {...common} {...rest}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>;
    case "farm": return <svg className={className} {...common} {...rest}><path d="M3 20h18" /><path d="M5 20V10l7-6 7 6v10" /><path d="M9 20v-6h6v6" /></svg>;
    case "scan": return <svg className={className} {...common} {...rest}><path d="M4 7V5a2 2 0 012-2h2" /><path d="M4 17v2a2 2 0 002 2h2" /><path d="M20 7V5a2 2 0 00-2-2h-2" /><path d="M20 17v2a2 2 0 01-2 2h-2" /><circle cx="12" cy="12" r="4" /></svg>;
    case "alerts": return <svg className={className} {...common} {...rest}><path d="M12 3l9 16H3z" /><path d="M12 10v4" /><path d="M12 17h.01" /></svg>;
    case "profile": return <svg className={className} {...common} {...rest}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" /></svg>;
    case "back": return <svg className={className} {...common} {...rest}><path d="M15 18l-6-6 6-6" /></svg>;
    case "bell": return <svg className={className} {...common} {...rest}><path d="M6 8a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M9.5 21a2.5 2.5 0 005 0" /></svg>;
    case "camera": return <svg className={className} {...common} {...rest}><path d="M4 8a2 2 0 012-2h1l1.5-2h7L17 6h1a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2z" /><circle cx="12" cy="13" r="3.5" /></svg>;
    case "gallery": return <svg className={className} {...common} {...rest}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>;
    case "droplet": return <svg className={className} {...common} {...rest}><path d="M12 2s7 8 7 13a7 7 0 01-14 0c0-5 7-13 7-13z" /></svg>;
    case "bug": return <svg className={className} {...common} {...rest}><rect x="8" y="7" width="8" height="11" rx="4" /><path d="M12 7V4M9 5l-1.5-1.5M15 5l1.5-1.5M4 12h4M16 12h4M5 18l2.5-1.5M19 18l-2.5-1.5" /></svg>;
    case "virus": return <svg className={className} {...common} {...rest}><circle cx="12" cy="12" r="5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2 2M17.1 17.1l2 2M4.9 19.1l2-2M17.1 6.9l2-2" /></svg>;
    case "cloud": return <svg className={className} {...common} {...rest}><path d="M17 18a4 4 0 000-8 5.5 5.5 0 00-10.6 1.7A4 4 0 007 18z" /></svg>;
    case "drone": return <svg className={className} {...common} {...rest}><circle cx="12" cy="12" r="2.4" /><path d="M12 9.6V6M12 14.4V18M9.6 12H6M14.4 12H18" /><circle cx="5" cy="5" r="2.2" /><circle cx="19" cy="5" r="2.2" /><circle cx="5" cy="19" r="2.2" /><circle cx="19" cy="19" r="2.2" /></svg>;
    case "chat": return <svg className={className} {...common} {...rest}><path d="M21 15a4 4 0 01-4 4H8l-5 3V6a4 4 0 014-4h10a4 4 0 014 4z" /></svg>;
    case "gauge": return <svg className={className} {...common} {...rest}><path d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path d="M12 12l4-3" /></svg>;
    case "map": return <svg className={className} {...common} {...rest}><path d="M9 20l-6-2V4l6 2 6-2 6 2v14l-6-2-6 2z" /><path d="M9 4v16M15 6v14" /></svg>;
    case "history": return <svg className={className} {...common} {...rest}><path d="M3 12a9 9 0 109-9" /><path d="M3 4v5h5" /><path d="M12 7v5l4 2" /></svg>;
    case "check": return <svg className={className} {...common} strokeWidth={2.4} {...rest}><path d="M20 6L9 17l-5-5" /></svg>;
    case "chev": return <svg className={className} {...common} {...rest}><path d="M9 18l6-6-6-6" /></svg>;
    case "settings": return <svg className={className} {...common} {...rest}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.6-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.6-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.6V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.6 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.6 1z" /></svg>;
    case "globe": return <svg className={className} {...common} {...rest}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z" /></svg>;
    case "pin": return <svg className={className} {...common} {...rest}><path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.4" /></svg>;
    case "copy": return <svg className={className} {...common} {...rest}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>;
    case "wifioff": return <svg className={className} {...common} {...rest}><path d="M1 1l22 22" /><path d="M16.7 16.7a10 10 0 00-9.4 0M5 12.5a15.9 15.9 0 016-3.4M19 12.5a15.9 15.9 0 00-2.6-2.1M8.5 16a6 6 0 017 0M12 20h.01" /></svg>;
    case "leafshield": return <svg className={className} viewBox="0 0 24 24" fill="none" {...rest}><path d="M12 2 3 6v6c0 5.2 3.8 9.4 9 10 5.2-.6 9-4.8 9-10V6l-9-4z" fill="#1B7F4C" /><path d="M8 12c0-3 2-5.5 5-6-1 3-1 6 0 9-3-.5-5-3-5-3z" fill="#F4B942" /></svg>;
    case "send": return <svg className={className} {...common} {...rest}><path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" /></svg>;
    case "close": return <svg className={className} {...common} {...rest}><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>;
    case "disease": return <svg className={className} {...common} {...rest}><circle cx="12" cy="12" r="5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2 2M17.1 17.1l2 2M4.9 19.1l2-2M17.1 6.9l2-2"/></svg>;
    case "sensor": return <svg className={className} {...common} {...rest}><rect x="5" y="4" width="14" height="16" rx="2"/><path d="M12 4v4M12 16v4M8 4v2M16 4v2"/></svg>;
    case "calendar": return <svg className={className} {...common} {...rest}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
    case "sun": return <svg className={className} {...common} {...rest}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>;
    case "calculator": return <svg className={className} {...common} {...rest}><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="18" x2="12" y2="18"/><line x1="8" y1="18" x2="8" y2="18"/></svg>;
    default: return null;
  }
}
