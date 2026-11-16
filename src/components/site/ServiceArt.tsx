/**
 * Small looping line drawings, one per service (same order as the dictionary). Pure SVG + CSS
 * (see .art-* in globals.css), so they run on phones too and cost nothing to render.
 */
const stroke = { fill: 'none', stroke: 'var(--beam)', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const faint = { ...stroke, stroke: 'var(--border)' };

function WebSystem() {
  // A dashboard assembling itself: window, sidebar, chart bars growing.
  return (
    <>
      <rect x="8" y="8" width="144" height="84" rx="8" {...faint} />
      <line x1="8" y1="22" x2="152" y2="22" {...faint} />
      <circle cx="17" cy="15" r="2" fill="var(--beam)" />
      <circle cx="25" cy="15" r="2" fill="var(--border)" />
      <rect x="16" y="30" width="26" height="54" rx="4" {...stroke} className="art-draw" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={54 + i * 18}
          y={44}
          width="10"
          height="38"
          rx="2"
          fill="var(--beam)"
          className="art-bar"
          style={{ animationDelay: `${i * 0.18}s`, transformOrigin: `${59 + i * 18}px 82px` }}
        />
      ))}
    </>
  );
}

function Automation() {
  // A form filling itself line by line, then a check mark.
  return (
    <>
      <rect x="30" y="6" width="100" height="88" rx="8" {...faint} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="42" y={18 + i * 20} width="76" height="12" rx="3" {...faint} />
          <line
            x1="46"
            y1={24 + i * 20}
            x2="104"
            y2={24 + i * 20}
            {...stroke}
            strokeWidth={3}
            className="art-type"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        </g>
      ))}
      <path d="M68 80 l8 7 l16 -15" {...stroke} strokeWidth={2.4} className="art-check" />
    </>
  );
}

function ChatAgent() {
  // Conversation: the customer asks, the agent types, then answers.
  return (
    <>
      <rect x="14" y="12" width="74" height="22" rx="11" {...faint} className="art-pop" style={{ animationDelay: '0s' }} />
      <rect x="72" y="42" width="74" height="22" rx="11" fill="color-mix(in srgb, var(--beam) 18%, transparent)" stroke="var(--beam)" strokeWidth={1.4} className="art-pop" style={{ animationDelay: '1.2s' }} />
      <g className="art-typing">
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={96 + i * 9} cy="53" r="2.4" fill="var(--beam)" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </g>
      <rect x="14" y="72" width="54" height="18" rx="9" {...faint} className="art-pop" style={{ animationDelay: '2.4s' }} />
    </>
  );
}

function MobileApp() {
  // A phone scanning: the light line sweeps the camera frame.
  return (
    <>
      <rect x="56" y="4" width="48" height="92" rx="10" {...faint} />
      <line x1="72" y1="10" x2="88" y2="10" {...faint} />
      <path d="M64 24 v-6 h6 M90 18 h6 v6 M96 74 v6 h-6 M70 80 h-6 v-6" {...stroke} />
      <rect x="66" y="30" width="28" height="40" rx="3" {...faint} />
      <line x1="64" y1="30" x2="96" y2="30" stroke="var(--beam)" strokeWidth={2} className="art-scan" />
      <circle cx="80" cy="88" r="3" {...faint} />
    </>
  );
}

function Integration() {
  // Two systems linked by a cable; packets travel both ways.
  return (
    <>
      <rect x="8" y="30" width="44" height="40" rx="8" {...faint} />
      <rect x="108" y="30" width="44" height="40" rx="8" {...faint} />
      <path d="M52 44 C 80 44, 80 44, 108 44" {...faint} />
      <path d="M108 56 C 80 56, 80 56, 52 56" {...faint} />
      <circle r="3.2" fill="var(--beam)" className="art-packet" style={{ offsetPath: "path('M52 44 C 80 44, 80 44, 108 44')" }} />
      <circle r="3.2" fill="var(--beam)" className="art-packet" style={{ offsetPath: "path('M108 56 C 80 56, 80 56, 52 56')", animationDelay: '0.9s' }} />
      <path d="M22 50 h16 M30 42 v16" {...stroke} />
      <path d="M122 44 h16 M122 50 h16 M122 56 h10" {...stroke} />
    </>
  );
}

function Architecture() {
  // A blueprint drawing itself: grid, boxes and the links between them.
  return (
    <>
      {[20, 40, 60, 80].map((y) => (
        <line key={`h${y}`} x1="4" y1={y} x2="156" y2={y} stroke="var(--border)" strokeWidth={0.6} strokeDasharray="2 4" />
      ))}
      {[30, 60, 90, 120].map((x) => (
        <line key={`v${x}`} x1={x} y1="6" x2={x} y2="94" stroke="var(--border)" strokeWidth={0.6} strokeDasharray="2 4" />
      ))}
      <rect x="62" y="8" width="36" height="20" rx="4" {...stroke} className="art-draw" />
      <rect x="18" y="66" width="36" height="20" rx="4" {...stroke} className="art-draw" style={{ animationDelay: '0.4s' }} />
      <rect x="106" y="66" width="36" height="20" rx="4" {...stroke} className="art-draw" style={{ animationDelay: '0.8s' }} />
      <path d="M80 28 V46 H36 V66 M80 46 H124 V66" {...stroke} className="art-draw" style={{ animationDelay: '1.2s' }} />
    </>
  );
}

const ARTS = [WebSystem, Automation, ChatAgent, MobileApp, Integration, Architecture];

export default function ServiceArt({ index }: { index: number }) {
  const Art = ARTS[index % ARTS.length];
  return (
    <svg viewBox="0 0 160 100" className="h-24 w-auto overflow-visible" aria-hidden="true">
      <Art />
    </svg>
  );
}
