// "Rooted in culture" — DNA gradient card recreated from the reference image:
// warm orange -> blue gradient, blurred DNA helix strand, white ring grid, grain.
function DnaCard() {
  return (
    <div className="dna-card" aria-hidden="true">
      <svg viewBox="0 0 640 420" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="dnaBg" x1="0" y1="0.4" x2="1" y2="0.6">
            <stop offset="0" stopColor="#F7B267" />
            <stop offset="0.34" stopColor="#F4A261" />
            <stop offset="0.55" stopColor="#EC9A8F" />
            <stop offset="0.74" stopColor="#7FA0CF" />
            <stop offset="1" stopColor="#3E63A8" />
          </linearGradient>
          <pattern id="dnaRings" width="56" height="56" patternUnits="userSpaceOnUse">
            <circle cx="28" cy="28" r="6.5" fill="none" stroke="#ffffff" strokeWidth="2.6" opacity="0.9" />
          </pattern>
          <filter id="dnaBlur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="11" />
          </filter>
          <filter id="dnaGrain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>

        {/* gradient base */}
        <rect width="640" height="420" fill="url(#dnaBg)" />

        {/* blurred DNA helix strand, upper-right like the reference */}
        <g filter="url(#dnaBlur)" transform="translate(310 130) rotate(-26)">
          {/* strand A */}
          <path
            d="M0 40 C 50 -20, 105 100, 160 40 C 215 -20, 270 100, 325 40"
            fill="none" stroke="#E14B62" strokeWidth="22" strokeLinecap="round"
          />
          {/* strand B */}
          <path
            d="M0 110 C 50 170, 105 50, 160 110 C 215 170, 270 50, 325 110"
            fill="none" stroke="#E76F51" strokeWidth="22" strokeLinecap="round"
          />
          {/* rungs */}
          <g stroke="#F7C948" strokeWidth="14" strokeLinecap="round">
            <line x1="34" y1="50" x2="40" y2="104" />
            <line x1="78" y1="30" x2="84" y2="126" />
            <line x1="122" y1="48" x2="126" y2="106" />
            <line x1="196" y1="50" x2="202" y2="104" />
            <line x1="240" y1="30" x2="246" y2="126" />
            <line x1="286" y1="48" x2="290" y2="106" />
          </g>
        </g>

        {/* white ring grid */}
        <rect x="34" y="34" width="572" height="352" fill="url(#dnaRings)" />

        {/* film grain */}
        <rect width="640" height="420" filter="url(#dnaGrain)" opacity="0.10" />
      </svg>
    </div>
  );
}

export default function CultureSection() {
  return (
    <section className="culture" id="tech">
      <div className="culture-inner">
        <div className="culture-copy">
          <div className="kicker">Rooted in culture</div>
          <h2>Preserving our Tswana DNA</h2>
          <p>
            Every voice we build carries the cadence, warmth and idiom of the
            people who speak it — technology that remembers where it comes from.
          </p>
        </div>
        <DnaCard />
      </div>
    </section>
  );
}
