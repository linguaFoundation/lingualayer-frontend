/**
 * LinguaLayer — Empty State Illustrations
 * Inline SVG components: no external assets, zero bundle overhead,
 * fully accessible via aria-label / role="img".
 *
 * Palette mirrors globals.css tokens:
 *   bg      #08110b   surface  #102015
 *   accent  #5ee9a8   accent-2 #c8f59f   muted  #9bd4b3
 */

/* ─────────────────────────────────────────────────────────────
   BOUNTIES — floating coin stack, no commissions yet
   ───────────────────────────────────────────────────────────── */
export function BountiesEmptySvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="No bounties illustration: stack of empty coins with a rising chart"
    >
      <defs>
        <radialGradient id="b-glow" cx="50%" cy="60%" r="48%">
          <stop offset="0%" stopColor="#5ee9a8" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#08110b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="b-coin-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8f59f" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#5ee9a8" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="b-coin-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3aad7c" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1e6648" stopOpacity="0.8" />
        </linearGradient>
        <filter id="b-shadow">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#5ee9a8" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* ambient glow */}
      <ellipse cx="110" cy="130" rx="90" ry="44" fill="url(#b-glow)" />

      {/* ── coin stack (3 coins) ── */}
      {/* coin 3 — bottom */}
      <ellipse cx="110" cy="135" rx="40" ry="10" fill="#1e6648" opacity="0.8" />
      <rect x="70" y="122" width="80" height="13" rx="1" fill="url(#b-coin-side)" />
      <ellipse cx="110" cy="122" rx="40" ry="10" fill="url(#b-coin-top)" />
      <ellipse cx="110" cy="122" rx="26" ry="6" fill="#102015" opacity="0.25" />

      {/* coin 2 */}
      <ellipse cx="110" cy="109" rx="40" ry="10" fill="#1e6648" opacity="0.8" />
      <rect x="70" y="96" width="80" height="13" rx="1" fill="url(#b-coin-side)" />
      <ellipse cx="110" cy="96" rx="40" ry="10" fill="url(#b-coin-top)" />
      <ellipse cx="110" cy="96" rx="26" ry="6" fill="#102015" opacity="0.25" />

      {/* coin 1 — top */}
      <ellipse cx="110" cy="83" rx="40" ry="10" fill="#1e6648" opacity="0.8" />
      <rect x="70" y="70" width="80" height="13" rx="1" fill="url(#b-coin-side)" />
      <ellipse cx="110" cy="70" rx="40" ry="10" fill="url(#b-coin-top)" filter="url(#b-shadow)" />
      <ellipse cx="110" cy="70" rx="26" ry="6" fill="#102015" opacity="0.25" />

      {/* "$" on top coin */}
      <text
        x="110"
        y="73.5"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fontFamily="Inter, system-ui, sans-serif"
        fill="#08110b"
        opacity="0.65"
        letterSpacing="0.02em"
      >
        $
      </text>

      {/* ── rising sparkline ── */}
      <polyline
        points="62,58 78,48 94,52 110,36 126,40 142,28 158,32"
        stroke="#5ee9a8"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.55"
      />
      {/* dots on sparkline */}
      {[[62,58],[110,36],[158,32]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill="#5ee9a8" opacity="0.7" />
      ))}

      {/* question mark floating */}
      <circle cx="162" cy="62" r="11" fill="#102015" stroke="#5ee9a8" strokeWidth="1.2" opacity="0.8" />
      <text
        x="162"
        y="66.5"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fontFamily="Inter, system-ui, sans-serif"
        fill="#5ee9a8"
        opacity="0.9"
      >
        ?
      </text>

      {/* subtle grid lines */}
      {[40,60,80,100,120,140,160].map(x => (
        <line key={x} x1={x} y1="20" x2={x} y2="145" stroke="#5ee9a8" strokeWidth="0.3" opacity="0.07" />
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   DATASETS — file cabinet with empty drawers
   ───────────────────────────────────────────────────────────── */
export function DatasetsEmptySvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="No datasets illustration: open filing cabinet with empty drawers"
    >
      <defs>
        <linearGradient id="d-cabinet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a3528" />
          <stop offset="100%" stopColor="#102015" />
        </linearGradient>
        <linearGradient id="d-drawer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#224433" />
          <stop offset="100%" stopColor="#142a20" />
        </linearGradient>
        <filter id="d-shadow">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#5ee9a8" floodOpacity="0.13" />
        </filter>
        <radialGradient id="d-glow" cx="50%" cy="70%" r="50%">
          <stop offset="0%" stopColor="#5ee9a8" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#08110b" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="110" cy="148" rx="75" ry="22" fill="url(#d-glow)" />

      {/* cabinet body */}
      <rect x="62" y="38" width="96" height="106" rx="6" fill="url(#d-cabinet)" filter="url(#d-shadow)" />
      <rect x="62" y="38" width="96" height="106" rx="6" stroke="#5ee9a8" strokeWidth="0.9" strokeOpacity="0.22" />

      {/* cabinet top edge highlight */}
      <rect x="62" y="38" width="96" height="4" rx="3" fill="#5ee9a8" opacity="0.08" />

      {/* drawer 1 — open, empty */}
      <rect x="70" y="48" width="80" height="28" rx="4" fill="url(#d-drawer)" />
      <rect x="70" y="48" width="80" height="28" rx="4" stroke="#5ee9a8" strokeWidth="0.7" strokeOpacity="0.30" />
      {/* drawer open shadow depth */}
      <rect x="72" y="76" width="76" height="8" rx="2" fill="#08110b" opacity="0.5" />
      {/* handle */}
      <rect x="103" y="59" width="14" height="5" rx="2.5" fill="#5ee9a8" opacity="0.55" />
      {/* empty label area */}
      <rect x="78" y="54" width="40" height="4" rx="2" fill="#5ee9a8" opacity="0.10" />
      <text x="98" y="68" textAnchor="middle" fontSize="7" fill="#9bd4b3" opacity="0.45" fontFamily="Inter, sans-serif">
        empty
      </text>

      {/* drawer 2 — closed */}
      <rect x="70" y="82" width="80" height="28" rx="4" fill="url(#d-drawer)" />
      <rect x="70" y="82" width="80" height="28" rx="4" stroke="#5ee9a8" strokeWidth="0.7" strokeOpacity="0.22" />
      <rect x="103" y="93" width="14" height="5" rx="2.5" fill="#5ee9a8" opacity="0.40" />
      <rect x="78" y="88" width="28" height="3" rx="1.5" fill="#5ee9a8" opacity="0.10" />

      {/* drawer 3 — closed */}
      <rect x="70" y="116" width="80" height="22" rx="4" fill="url(#d-drawer)" />
      <rect x="70" y="116" width="80" height="22" rx="4" stroke="#5ee9a8" strokeWidth="0.7" strokeOpacity="0.18" />
      <rect x="103" y="125" width="14" height="5" rx="2.5" fill="#5ee9a8" opacity="0.30" />

      {/* floating document icon above */}
      <g opacity="0.6" transform="translate(148, 26)">
        <rect width="22" height="26" rx="3" fill="#102015" stroke="#5ee9a8" strokeWidth="1" />
        <rect x="4" y="7" width="14" height="2" rx="1" fill="#5ee9a8" opacity="0.5" />
        <rect x="4" y="12" width="10" height="2" rx="1" fill="#5ee9a8" opacity="0.35" />
        <rect x="4" y="17" width="12" height="2" rx="1" fill="#5ee9a8" opacity="0.25" />
        <circle cx="11" cy="0" r="3" fill="#5ee9a8" opacity="0.4" />
      </g>

      {/* magnifying glass search overlay */}
      <g transform="translate(50, 28)" opacity="0.55">
        <circle cx="10" cy="10" r="8" stroke="#c8f59f" strokeWidth="1.5" fill="none" />
        <line x1="16" y1="16" x2="22" y2="22" stroke="#c8f59f" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="6" y1="10" x2="14" y2="10" stroke="#c8f59f" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   CONTRIBUTOR — empty profile with disconnected nodes
   ───────────────────────────────────────────────────────────── */
export function ContributorEmptySvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="No activity illustration: empty contributor profile with disconnected network nodes"
    >
      <defs>
        <radialGradient id="c-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#5ee9a8" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#08110b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="c-avatar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e4a35" />
          <stop offset="100%" stopColor="#102015" />
        </linearGradient>
        <filter id="c-shadow">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#5ee9a8" floodOpacity="0.15" />
        </filter>
      </defs>

      <ellipse cx="110" cy="120" rx="88" ry="48" fill="url(#c-glow)" />

      {/* ── central avatar ── */}
      <circle cx="110" cy="72" r="34" fill="url(#c-avatar)" stroke="#5ee9a8" strokeWidth="1.2" strokeOpacity="0.35" filter="url(#c-shadow)" />
      {/* avatar — head */}
      <circle cx="110" cy="64" r="12" fill="#5ee9a8" opacity="0.22" />
      {/* avatar — body silhouette */}
      <path d="M88 98 Q88 82 110 82 Q132 82 132 98" fill="#5ee9a8" opacity="0.14" />
      {/* dashed ring — "no data" pulse */}
      <circle cx="110" cy="72" r="42" stroke="#5ee9a8" strokeWidth="1" strokeDasharray="5 4" strokeOpacity="0.22" />

      {/* ── disconnected nodes ── */}
      {/* node TL */}
      <circle cx="52" cy="52" r="9" fill="#102015" stroke="#9bd4b3" strokeWidth="1.1" strokeOpacity="0.45" />
      <rect x="46" y="49" width="12" height="2" rx="1" fill="#9bd4b3" opacity="0.3" />
      <rect x="48" y="53" width="8" height="2" rx="1" fill="#9bd4b3" opacity="0.2" />
      {/* broken connector TL */}
      <line x1="60" y1="56" x2="72" y2="62" stroke="#5ee9a8" strokeWidth="1.1" strokeDasharray="3 3" strokeOpacity="0.35" />

      {/* node TR */}
      <circle cx="168" cy="52" r="9" fill="#102015" stroke="#9bd4b3" strokeWidth="1.1" strokeOpacity="0.45" />
      <rect x="162" y="49" width="12" height="2" rx="1" fill="#9bd4b3" opacity="0.3" />
      <rect x="164" y="53" width="8" height="2" rx="1" fill="#9bd4b3" opacity="0.2" />
      {/* broken connector TR */}
      <line x1="160" y1="56" x2="148" y2="62" stroke="#5ee9a8" strokeWidth="1.1" strokeDasharray="3 3" strokeOpacity="0.35" />

      {/* node BL */}
      <circle cx="46" cy="120" r="8" fill="#102015" stroke="#9bd4b3" strokeWidth="1" strokeOpacity="0.35" />
      <line x1="53" y1="115" x2="76" y2="100" stroke="#5ee9a8" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.28" />

      {/* node BR */}
      <circle cx="174" cy="120" r="8" fill="#102015" stroke="#9bd4b3" strokeWidth="1" strokeOpacity="0.35" />
      <line x1="167" y1="115" x2="144" y2="100" stroke="#5ee9a8" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.28" />

      {/* node B center */}
      <circle cx="110" cy="140" r="7" fill="#102015" stroke="#9bd4b3" strokeWidth="1" strokeOpacity="0.35" />
      <line x1="110" y1="133" x2="110" y2="110" stroke="#5ee9a8" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.28" />

      {/* zero datasets badge */}
      <g transform="translate(96, 58)">
        <rect width="28" height="14" rx="7" fill="#102015" stroke="#5ee9a8" strokeWidth="0.9" strokeOpacity="0.4" />
        <text x="14" y="10" textAnchor="middle" fontSize="8" fontWeight="700" fontFamily="Inter, sans-serif" fill="#5ee9a8" opacity="0.65">
          0
        </text>
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROYALTIES — empty bar chart + coin drip
   ───────────────────────────────────────────────────────────── */
export function RoyaltiesEmptySvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="No royalties illustration: empty bar chart with a coin drop"
    >
      <defs>
        <radialGradient id="r-glow" cx="50%" cy="75%" r="50%">
          <stop offset="0%" stopColor="#5ee9a8" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#08110b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="r-bar-full" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c8f59f" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#5ee9a8" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="r-bar-empty" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5ee9a8" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#5ee9a8" stopOpacity="0.04" />
        </linearGradient>
        <filter id="r-glow-f">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#5ee9a8" floodOpacity="0.25" />
        </filter>
      </defs>

      <ellipse cx="110" cy="148" rx="80" ry="24" fill="url(#r-glow)" />

      {/* axis */}
      <line x1="52" y1="134" x2="180" y2="134" stroke="#5ee9a8" strokeWidth="1" strokeOpacity="0.22" />
      <line x1="52" y1="40" x2="52" y2="134" stroke="#5ee9a8" strokeWidth="1" strokeOpacity="0.22" />
      {/* axis ticks */}
      {[60,90,120].map(y => (
        <line key={y} x1="48" y1={y} x2="55" y2={y} stroke="#5ee9a8" strokeWidth="0.8" strokeOpacity="0.25" />
      ))}

      {/* ── bars ── */}
      {/* bar 1 — tiny (almost zero) */}
      <rect x="66" y="126" width="18" height="8" rx="3" fill="url(#r-bar-full)" />
      {/* bar 2 — zero/empty */}
      <rect x="94" y="50" width="18" height="84" rx="3" fill="url(#r-bar-empty)" stroke="#5ee9a8" strokeWidth="0.7" strokeDasharray="3 2" strokeOpacity="0.25" />
      {/* bar 3 — zero/empty */}
      <rect x="122" y="68" width="18" height="66" rx="3" fill="url(#r-bar-empty)" stroke="#5ee9a8" strokeWidth="0.7" strokeDasharray="3 2" strokeOpacity="0.2" />
      {/* bar 4 — zero/empty */}
      <rect x="150" y="90" width="18" height="44" rx="3" fill="url(#r-bar-empty)" stroke="#5ee9a8" strokeWidth="0.7" strokeDasharray="3 2" strokeOpacity="0.15" />

      {/* ── coin drip ── */}
      {/* coin body */}
      <ellipse cx="103" cy="48" rx="14" ry="6" fill="#5ee9a8" opacity="0.18" />
      <rect x="89" y="42" width="28" height="12" rx="2" fill="#5ee9a8" opacity="0.10" />
      <ellipse cx="103" cy="42" rx="14" ry="6" fill="#5ee9a8" opacity="0.30" stroke="#c8f59f" strokeWidth="0.8" strokeOpacity="0.5" filter="url(#r-glow-f)" />
      <text x="103" y="45" textAnchor="middle" fontSize="7" fontWeight="700" fontFamily="Inter, sans-serif" fill="#08110b" opacity="0.55">$</text>
      {/* drip trail */}
      <line x1="103" y1="48" x2="103" y2="62" stroke="#5ee9a8" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2 3" opacity="0.4" />
      <ellipse cx="103" cy="65" rx="3" ry="1.5" fill="#5ee9a8" opacity="0.22" />

      {/* "0" labels on empty bars */}
      <text x="103" y="46" textAnchor="middle" fontSize="7" fill="#5ee9a8" opacity="0.0">0</text>
      {[103,131,159].map((x, i) => (
        <text key={i} x={x} y="48" textAnchor="middle" fontSize="7" fontFamily="Inter, sans-serif" fill="#5ee9a8" opacity="0.28">0</text>
      ))}
    </svg>
  );
}
