import React from 'react'

// Princesa en SVG. `stage` (0-5) hace que cada vez vaya más guapa:
// 0 vestido sencillo · 1 vestido rosa + lazo · 2 falda con volantes y cinturón
// 3 corona pequeña · 4 corona de joyas, collar y vestido de gala · 5 capa real, varita y destellos
const DRESSES = [
  { top: '#b9b4c4', skirt: '#a9a3b8', trim: '#9c96ad' },
  { top: '#ff8fc3', skirt: '#ff6fb0', trim: '#ffd1e8' },
  { top: '#ff6fb0', skirt: '#f0489a', trim: '#ffe3f1' },
  { top: '#c77dff', skirt: '#a855f7', trim: '#f3d9ff' },
  { top: '#7dd3fc', skirt: '#38bdf8', trim: '#e0f5ff' },
  { top: '#fde047', skirt: '#f59e0b', trim: '#fff7cc' }
]

export default function Princess({ stage = 0, size = 220, sparkle = false }) {
  const d = DRESSES[stage]
  const crown = stage >= 3
  const bigCrown = stage >= 4
  const wide = stage >= 2 ? 62 : 46
  return (
    <svg viewBox="0 0 200 300" width={size} height={(size * 300) / 200} role="img" aria-label={`Princesa, etapa ${stage + 1}`}>
      <defs>
        <linearGradient id={`sk${stage}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={d.top} />
          <stop offset="1" stopColor={d.skirt} />
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe680" />
          <stop offset="1" stopColor="#f5a623" />
        </linearGradient>
      </defs>

      {stage >= 5 && <path d="M70 118 Q20 210 28 288 L172 288 Q180 210 130 118 Z" fill="#e11d48" opacity=".85" />}

      {/* pelo trasero */}
      <path d="M62 70 Q58 140 72 160 L128 160 Q142 140 138 70 Q100 20 62 70 Z" fill="#6b3a1e" />

      {/* falda */}
      <path d={`M${100 - wide} 288 Q${100 - wide - 8} 200 82 160 L118 160 Q${100 + wide + 8} 200 ${100 + wide} 288 Q100 300 ${100 - wide} 288 Z`} fill={`url(#sk${stage})`} />
      {stage >= 2 && (
        <>
          <path d={`M${100 - wide + 4} 262 Q100 280 ${100 + wide - 4} 262`} stroke={d.trim} strokeWidth="5" fill="none" />
          <path d={`M${100 - wide + 10} 236 Q100 252 ${100 + wide - 10} 236`} stroke={d.trim} strokeWidth="4" fill="none" opacity=".8" />
        </>
      )}
      {stage >= 4 &&
        [78, 100, 122].map((x, i) => (
          <circle key={x} cx={x} cy={215 + (i % 2) * 18} r="4" fill="#fff" opacity=".9" />
        ))}

      {/* cuerpo */}
      <path d="M82 110 L118 110 L122 160 L78 160 Z" fill={d.top} />
      <rect x="78" y="154" width="44" height="9" rx="3" fill={stage >= 2 ? '#ffd34d' : d.trim} />
      <rect x="92" y="96" width="16" height="18" fill="#ffd9b8" />

      {/* brazos */}
      <path d="M82 114 Q62 140 70 160" stroke="#ffd9b8" strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M118 114 Q138 140 130 160" stroke="#ffd9b8" strokeWidth="9" strokeLinecap="round" fill="none" />

      {/* collar */}
      {stage >= 4 && (
        <>
          <path d="M88 112 Q100 128 112 112" stroke="#fff" strokeWidth="3" fill="none" />
          <circle cx="100" cy="124" r="5" fill="#f43f5e" stroke="#fff" strokeWidth="1.5" />
        </>
      )}

      {/* cara */}
      <circle cx="100" cy="72" r="32" fill="#ffd9b8" />
      <path d="M68 72 Q70 40 100 38 Q130 40 132 72 Q118 52 100 52 Q82 52 68 72 Z" fill="#6b3a1e" />
      <circle cx="88" cy="76" r="4" fill="#3b2314" />
      <circle cx="112" cy="76" r="4" fill="#3b2314" />
      <circle cx="89.5" cy="74.5" r="1.4" fill="#fff" />
      <circle cx="113.5" cy="74.5" r="1.4" fill="#fff" />
      <ellipse cx="80" cy="88" rx="6" ry="4" fill="#ff9db8" opacity=".6" />
      <ellipse cx="120" cy="88" rx="6" ry="4" fill="#ff9db8" opacity=".6" />
      <path d="M90 90 Q100 100 110 90" stroke="#c2415f" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* lazo */}
      {stage >= 1 && !crown && (
        <g>
          <path d="M126 48 L146 36 L146 62 Z" fill="#ff4fa0" />
          <path d="M126 48 L106 36 L106 62 Z" fill="#ff4fa0" transform="translate(20 0)" opacity="0" />
          <circle cx="126" cy="48" r="5" fill="#ffd1e8" />
        </g>
      )}

      {/* corona */}
      {crown && !bigCrown && (
        <path d="M80 44 L86 26 L96 38 L100 22 L104 38 L114 26 L120 44 Z" fill="url(#gold)" stroke="#d98a00" strokeWidth="1.5" />
      )}
      {bigCrown && (
        <g>
          <path d="M76 46 L80 20 L92 36 L100 12 L108 36 L120 20 L124 46 Z" fill="url(#gold)" stroke="#d98a00" strokeWidth="1.5" />
          <circle cx="100" cy="30" r="4.5" fill="#ef4444" stroke="#fff" strokeWidth="1" />
          <circle cx="86" cy="40" r="3.2" fill="#3b82f6" stroke="#fff" strokeWidth="1" />
          <circle cx="114" cy="40" r="3.2" fill="#10b981" stroke="#fff" strokeWidth="1" />
        </g>
      )}

      {/* varita */}
      {stage >= 5 && (
        <g>
          <line x1="140" y1="150" x2="168" y2="100" stroke="#f5a623" strokeWidth="4" strokeLinecap="round" />
          <path d="M168 84 l4 10 10 1 -8 6 3 10 -9 -6 -9 6 3 -10 -8 -6 10 -1 z" fill="#ffe680" stroke="#f5a623" />
        </g>
      )}

      {/* destellos */}
      {(sparkle || stage >= 5) && (
        <g className="twinkle" fill="#ffe680">
          <path d="M30 60 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z" />
          <path d="M170 40 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z" />
          <path d="M160 200 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z" />
        </g>
      )}
    </svg>
  )
}
