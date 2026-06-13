import React from 'react';

export function RailLogo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Modern gradients matching the app theme */}
        <linearGradient id="outerRingGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" /> {/* Emerald */}
          <stop offset="50%" stopColor="#06b6d4" /> {/* Cyan */}
          <stop offset="100%" stopColor="#3b82f6" /> {/* Blue */}
        </linearGradient>
        <linearGradient id="innerCoreGrad" x1="30" y1="30" x2="70" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0b1d30" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="glowGrad" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Ambient Backlight Glow */}
      <circle cx="50" cy="50" r="46" fill="url(#glowGrad)" />

      {/* Outer high-tech gear rim (representing train wheels and AI engines) */}
      <circle cx="50" cy="50" r="42" stroke="url(#outerRingGrad)" strokeWidth="1.5" strokeOpacity="0.3" />
      <circle cx="50" cy="50" r="38" stroke="#334155" strokeWidth="1" strokeOpacity="0.5" />
      
      {/* Precision wheel spokes */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 50 + 38 * Math.cos(angle);
        const y1 = 50 + 38 * Math.sin(angle);
        const x2 = 50 + 42 * Math.cos(angle);
        const y2 = 50 + 42 * Math.sin(angle);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="url(#outerRingGrad)"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
        );
      })}

      {/* Central Connectivity Globe / Hub */}
      <circle cx="50" cy="50" r="26" fill="url(#innerCoreGrad)" stroke="url(#outerRingGrad)" strokeWidth="1.5" />
      
      {/* Globe coordinate lines for the AI/Global aspect */}
      <path d="M 24,50 Q 50,38 76,50" stroke="#1e293b" strokeWidth="1" strokeDasharray="1.5 1.5" />
      <path d="M 24,50 Q 50,62 76,50" stroke="#1e293b" strokeWidth="1" strokeDasharray="1.5 1.5" />
      <path d="M 50,24 Q 38,50 50,76" stroke="#1e293b" strokeWidth="1" strokeDasharray="1.5 1.5" />
      <path d="M 50,24 Q 62,50 50,76" stroke="#1e293b" strokeWidth="1" strokeDasharray="1.5 1.5" />

      {/* Dynamic railway track representing the iconic curve of the SmartRail brand */}
      <path 
        d="M 28,62 C 24,46 32,28 55,26 C 72,25 78,35 74,44 C 70,53 52,65 32,68" 
        stroke="url(#outerRingGrad)" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
      />
      <path 
        d="M 33,65 C 29,51 37,34 57,32 C 70,31 74,38 71,45 C 68,52 54,61 37,64" 
        stroke="#ffffff" 
        strokeWidth="1" 
        strokeLinecap="round" 
        strokeOpacity="0.85"
      />

      {/* Track ties/sleepers */}
      <line x1="36" y1="48" x2="41" y2="44" stroke="#ffffff" strokeWidth="1" opacity="0.75" />
      <line x1="46" y1="39" x2="50" y2="35" stroke="#ffffff" strokeWidth="1" opacity="0.75" />
      <line x1="57" y1="35" x2="60" y2="30" stroke="#ffffff" strokeWidth="1" opacity="0.75" />
      <line x1="68" y1="38" x2="70" y2="33" stroke="#ffffff" strokeWidth="1" opacity="0.75" />

      {/* Pulsing signal dot represent real-time synchronization */}
      <circle cx="71" cy="45" r="1.5" fill="#10b981" />
    </svg>
  );
}
