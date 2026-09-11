// Original vector illustrations, built for AgroGon's palette. We deliberately
// avoid hotlinking third-party stock photos here: this build has no network
// access to verify a photo host stays up, and mis-licensed "realistic" stock
// imagery is a real risk. These SVGs give the same "real agriculture, not a
// generic dashboard" feeling and can be swapped for licensed photography
// later by dropping files into /public/images and swapping the <img> in.

export function FarmHeroIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 420" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EAF3EC" />
          <stop offset="100%" stopColor="#F7FAF7" />
        </linearGradient>
        <linearGradient id="field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E9D68" />
          <stop offset="100%" stopColor="#1B7F4C" />
        </linearGradient>
      </defs>
      <rect width="600" height="420" fill="url(#sky)" />
      <circle cx="500" cy="80" r="46" fill="#F4B942" opacity="0.9" />
      <path d="M0 260 Q150 210 300 250 T600 240 V420 H0 Z" fill="url(#field)" />
      <path d="M0 300 Q150 260 300 295 T600 285 V420 H0 Z" fill="#12352A" opacity="0.25" />
      {/* crop rows */}
      {Array.from({ length: 10 }).map((_, i) => (
        <path key={i} d={`M${20 + i * 58} 420 L${40 + i * 58} 300`} stroke="#EAF3EC" strokeWidth="3" opacity="0.18" />
      ))}
      {/* small plants */}
      {[90, 180, 270, 360, 450].map((x, i) => (
        <g key={x} transform={`translate(${x} ${350 - (i % 2) * 14})`}>
          <path d="M0 40 C-10 20 -6 4 0 0 C6 4 10 20 0 40 Z" fill="#F4B942" opacity="0.9" />
          <path d="M0 40 C-16 30 -18 14 -6 6" stroke="#12352A" strokeWidth="2" fill="none" opacity="0.4" />
        </g>
      ))}
      {/* farmer silhouette */}
      <g transform="translate(150 200)">
        <circle cx="0" cy="0" r="14" fill="#12352A" />
        <path d="M-16 20 C-16 -2 16 -2 16 20 L20 90 L4 90 L0 40 L-4 90 L-20 90 Z" fill="#1B7F4C" />
        <path d="M-16 30 L-40 55" stroke="#1B7F4C" strokeWidth="10" strokeLinecap="round" />
        <path d="M16 30 L34 20" stroke="#1B7F4C" strokeWidth="10" strokeLinecap="round" />
      </g>
      {/* drone */}
      <g transform="translate(410 130)">
        <circle cx="0" cy="0" r="6" fill="#12352A" />
        <path d="M0 -6V-18M0 6V18M-6 0H-18M6 0H18" stroke="#12352A" strokeWidth="2.5" />
        <circle cx="-18" cy="-6" r="5" fill="#F4B942" />
        <circle cx="18" cy="-6" r="5" fill="#F4B942" />
        <circle cx="-18" cy="6" r="5" fill="#F4B942" />
        <circle cx="18" cy="6" r="5" fill="#F4B942" />
      </g>
    </svg>
  );
}

export function FieldMonitoringIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 140" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="140" rx="14" fill="#EAF3EC" />
      <rect x="16" y="70" width="168" height="54" rx="8" fill="#2E9D68" opacity="0.85" />
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={i} x1={22 + i * 20} y1="124" x2={30 + i * 20} y2="70" stroke="#F7FAF7" strokeWidth="2" opacity="0.3" />
      ))}
      <circle cx="150" cy="34" r="16" fill="#F4B942" />
      <g transform="translate(60 40)">
        <circle cx="0" cy="0" r="4" fill="#12352A" />
        <path d="M0 -4V-12M0 4V12M-4 0H-12M4 0H12" stroke="#12352A" strokeWidth="1.6" />
      </g>
    </svg>
  );
}

export function DiseaseScanIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 140" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="140" rx="14" fill="#FBE8E7" opacity="0.5" />
      <path d="M100 30 C60 30 40 70 60 110 C75 130 125 130 140 110 C160 70 140 30 100 30 Z" fill="#2E9D68" />
      <circle cx="85" cy="70" r="6" fill="#D9534F" />
      <circle cx="110" cy="90" r="4" fill="#D9534F" />
      <circle cx="100" cy="55" r="3" fill="#D9534F" />
      <rect x="30" y="20" width="140" height="100" rx="10" fill="none" stroke="#F4B942" strokeWidth="2.5" strokeDasharray="6 6" />
    </svg>
  );
}

export function CameraFeedIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 360" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="camSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BFDDC9" />
          <stop offset="100%" stopColor="#8FBE9E" />
        </linearGradient>
        <linearGradient id="camField" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3EA96B" />
          <stop offset="100%" stopColor="#1B5E3B" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill="url(#camSky)" />
      <circle cx="540" cy="70" r="34" fill="#F4D27A" opacity="0.9" />
      <path d="M0 190 L640 170 V360 H0 Z" fill="url(#camField)" />
      {/* converging crop rows for a "camera looking down a field" feel */}
      {Array.from({ length: 14 }).map((_, i) => {
        const topX = 260 + i * 10;
        const botX = -80 + i * 68;
        return <path key={i} d={`M${topX} 190 L${botX} 360`} stroke="#E9F5EC" strokeWidth="2.5" opacity="0.22" />;
      })}
      <path d="M0 230 L640 205 L640 230 L0 258 Z" fill="#0F3A24" opacity="0.25" />
      {/* distant tree line */}
      {[40, 120, 470, 560, 610].map((x) => (
        <circle key={x} cx={x} cy="185" r={x < 200 ? 22 : 26} fill="#215E3D" opacity="0.85" />
      ))}
    </svg>
  );
}
