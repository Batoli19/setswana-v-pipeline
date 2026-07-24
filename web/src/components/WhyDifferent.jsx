// "Why We Are Different" — SIP/PBX integration diagram feeding a spinning
// gradient ring, over a wireframe horizon grid. Ported from the standalone
// reference design (buildDiagram + buildMesh), rendered declaratively.

// Straight rails + curved feeders that converge on the centre ring.
const RAILS = [
  [306, 225, 544, 225],
  [306, 410, 830, 410],
  [306, 595, 544, 595],
  [1010, 410, 1538, 410],
  [1300, 225, 1538, 225],
  [1300, 595, 1538, 595],
];
const FEEDERS = [
  "M592,273 C592,372 760,346 862,354",
  "M592,547 C592,448 760,466 862,466",
  "M1252,273 C1252,372 1084,346 982,354",
  "M1252,547 C1252,448 1084,466 982,466",
];

// The twelve integration nodes (telephony/SIP ecosystem).
const NODES = [
  { x: 258, y: 225, kind: "text", label: "AVAYA", size: 22, ls: 1 },
  { x: 258, y: 410, kind: "icon", icon: "send" },
  { x: 258, y: 595, kind: "icon", icon: "gear" },
  { x: 592, y: 225, kind: "icon", icon: "bolt" },
  { x: 592, y: 410, kind: "text", label: "CISCO", size: 16, ls: 1.5 },
  { x: 592, y: 595, kind: "icon", icon: "chat" },
  { x: 1252, y: 225, kind: "text", label: "KAMAILIO", size: 12, ls: 1 },
  { x: 1252, y: 410, kind: "icon", icon: "asterisk" },
  { x: 1252, y: 595, kind: "text", label: "OpenSIPS", size: 14, ls: 0.3 },
  { x: 1586, y: 225, kind: "icon", icon: "sparkle" },
  { x: 1586, y: 410, kind: "text", label: "OC", size: 24, ls: 0 },
  { x: 1586, y: 595, kind: "two", label: "+ any SIP", label2: "PBX / SBC", size: 14 },
];

const stroke = { stroke: "#1a1a1a", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
const solid = { fill: "#1a1a1a" };

function Icon({ name }) {
  switch (name) {
    case "send":
      return <path d="M-12 -1 L12 -10 L4 12 L0 2 Z" {...solid} />;
    case "gear":
      return (
        <>
          <circle r="4.5" {...stroke} />
          <path d="M0 -12 V-7 M0 7 V12 M-12 0 H-7 M7 0 H12 M-8.5 -8.5 L-5 -5 M5 5 L8.5 8.5 M8.5 -8.5 L5 -5 M-5 5 L-8.5 8.5" {...stroke} />
        </>
      );
    case "bolt":
      return <path d="M2 -12 L-7 3 L0 3 L-2 12 L8 -3 L1 -3 Z" {...solid} />;
    case "chat":
      return (
        <>
          <rect x="-10" y="-9" width="20" height="14" rx="3" {...stroke} />
          <path d="M-4 5 L-7 10 L-1 5" {...solid} />
          <circle cx="-4" cy="-2" r="1.4" {...solid} />
          <circle cx="0" cy="-2" r="1.4" {...solid} />
          <circle cx="4" cy="-2" r="1.4" {...solid} />
        </>
      );
    case "asterisk":
      return <path d="M0 -10 V10 M-8.5 -5 L8.5 5 M8.5 -5 L-8.5 5" {...stroke} />;
    case "sparkle":
      return <path d="M0 -11 C1.2 -4 4 -1.2 11 0 C4 1.2 1.2 4 0 11 C-1.2 4 -4 1.2 -11 0 C-4 -1.2 -1.2 -4 0 -11 Z" {...solid} />;
    default:
      return null;
  }
}

function Node(n) {
  const common = {
    textAnchor: "middle",
    dominantBaseline: "central",
    fontFamily: "'Space Grotesk', sans-serif",
    fill: "#1a1a1a",
  };
  return (
    <g key={`${n.x}-${n.y}`}>
      <circle cx={n.x} cy={n.y} r="48" fill="#ffffff" stroke="#e2dfdf" strokeWidth="1.5" />
      {n.kind === "text" && (
        <text x={n.x} y={n.y} {...common} fontWeight="700" fontSize={n.size} letterSpacing={n.ls}>
          {n.label}
        </text>
      )}
      {n.kind === "two" && (
        <>
          <text x={n.x} y={n.y - 7} {...common} fontWeight="600" fontSize={n.size}>{n.label}</text>
          <text x={n.x} y={n.y + 9} {...common} fontWeight="600" fontSize={n.size}>{n.label2}</text>
        </>
      )}
      {n.kind === "icon" && (
        <g transform={`translate(${n.x},${n.y})`}>
          <Icon name={n.icon} />
        </g>
      )}
    </g>
  );
}

// Wireframe horizon grid — perspective-spread rows fanning toward the viewer.
function meshPaths() {
  const W = 1840, H = 360, cols = 48, rows = 16, cx = W / 2;
  const pt = (c, r) => {
    const tc = c / cols, tr = r / rows;
    const spread = 0.14 + 0.86 * tr;
    const x = cx + (tc - 0.5) * W * spread;
    const wave =
      Math.sin(tc * Math.PI * 3.2 + tr * 1.8) * (8 + 26 * tr) +
      Math.sin(tc * Math.PI * 6.5 + 1.2) * (3 + 9 * tr);
    const y = 34 + tr * tr * (H - 40) - wave;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  };
  const paths = [];
  for (let r = 0; r <= rows; r++) {
    let d = "";
    for (let c = 0; c <= cols; c++) d += (c ? "L" : "M") + pt(c, r) + " ";
    paths.push({ d, opacity: (0.12 + 0.5 * r / rows).toFixed(2) });
  }
  for (let c = 0; c <= cols; c++) {
    let d = "";
    for (let r = 0; r <= rows; r++) d += (r ? "L" : "M") + pt(c, r) + " ";
    paths.push({ d, opacity: "0.28" });
  }
  return paths;
}
const MESH = meshPaths();

export default function WhyDifferent() {
  return (
    <section className="why-diff" id="tech">
      <div className="wd-diagram">
        <svg className="wd-svg" viewBox="0 0 1840 700" aria-hidden="true">
          <g fill="none" stroke="#e0dddd" strokeWidth="1.5">
            {RAILS.map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
            ))}
            {FEEDERS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          <g>{NODES.map(Node)}</g>
        </svg>

        {/* centre gradient ring the feeders converge on */}
        <div className="wd-ring" aria-hidden="true">
          <span className="wd-ring-glow" />
          <span className="wd-ring-conic" />
          <span className="wd-ring-hole" />
        </div>
      </div>

      {/* wireframe horizon grid */}
      <svg className="wd-mesh" viewBox="0 0 1840 360" preserveAspectRatio="none" aria-hidden="true">
        {MESH.map((p, i) => (
          <path key={i} d={p.d} fill="none" stroke="#c7c4c4" strokeWidth="1" opacity={p.opacity} />
        ))}
      </svg>

      <h2 className="wd-title">Why We Are Different</h2>
    </section>
  );
}
