import React from 'react';

/* ─────────────────────────────────────────────────────────────────
   Bloom — the HydraSubs mascot
   A hydrangea flower head built from individual four-petal florets
   (the way a real hydrangea actually looks — a dense cluster of many
   small blossoms, not one giant flower). No face: the bud closes and
   opens, sways gently, and lets the colors/sparkle communicate state.

   States:
     idle    — tight cluster of small round glossy bud-dots, soft
               glow, a few tiny twinkling sparkles around the cluster
               (mirrors how real unopened hydrangea buds look — tiny
               round beads, not one big shape)
     active  — florets fanned partway out, swaying + breathing,
               sparkles twinkling around the opening cluster
     done    — full 13-floret open cluster, gentle sparkle ring

   Usage:
     <Mascot />
     <Mascot state="active" size={64} />
     <Mascot state="done" size={48} />
   ───────────────────────────────────────────────────────────────── */

const FLORET_COLORS = [
  '#ec4899', '#a855f7', '#60a5fa', '#c026d3', '#f472b6',
  '#818cf8', '#e879f9', '#d8b4fe', '#f0abfc', '#fbcfe8',
  '#a5b4fc', '#f9a8d4', '#c4b5fd',
];

/* 13 floret positions: ring of 11 plus 2 extra florets stacked on
   the vertical axis (one nudged up, one nudged down) to fill the
   center. Each entry is [x, y, scale] in local flower-space. */
const FLORET_LAYOUT = [
  [0, -19, 0.85],
  [14, -13, 0.85],
  [-14, -13, 0.85],
  [20, 0, 0.85],
  [-20, 0, 0.85],
  [14, 13, 0.85],
  [-14, 13, 0.85],
  [0, 19, 0.85],
  [0, -2, 0.85],
  [8, -1, 0.7],
  [-8, -1, 0.7],
  [0, -9, 0.72],
  [0, 7, 0.72],
];

/* small round bud-dots clustered tightly — matches how a real
   unopened hydrangea head looks (tiny glossy beads, not one shape) */
const BUD_DOTS = [
  { x: -6, y: -8,  r: 6,   color: '#ec4899' },
  { x: 6,  y: -8,  r: 6,   color: '#a855f7' },
  { x: 0,  y: -15, r: 5.5, color: '#c026d3' },
  { x: -11,y: -1,  r: 5.5, color: '#f472b6' },
  { x: 11, y: -1,  r: 5.5, color: '#818cf8' },
  { x: 0,  y: -3,  r: 6,   color: '#e879f9' },
  { x: -6, y: 5,   r: 5,   color: '#d8b4fe' },
  { x: 6,  y: 5,   r: 5,   color: '#f0abfc' },
  { x: 0,  y: 9,   r: 4.5, color: '#fbcfe8' },
];

/* Sparkle rings sized per state — wider as the bloom opens up,
   so the twinkles always sit just outside the petals/dots. */
const SPARKLES_BY_STATE = {
  idle: [
    { x: -22, y: -16, s: 3.4, delay: '0s',   opacity: 0.85, dot: false },
    { x: 21,  y: -10, s: 2.4, delay: '0.5s', opacity: 0.7,  dot: false },
    { x: -18, y: 14,  s: 2.4, delay: '0.9s', opacity: 0.7,  dot: false },
    { x: 22,  y: 10,  s: 1.2, delay: '1.2s', opacity: 0.8,  dot: true },
  ],
  active: [
    { x: -26, y: -18, s: 3.2, delay: '0.2s', opacity: 0.8,  dot: false },
    { x: 25,  y: -16, s: 2.6, delay: '0.7s', opacity: 0.75, dot: false },
    { x: -25, y: 16,  s: 2.6, delay: '1.1s', opacity: 0.75, dot: false },
    { x: 26,  y: 17,  s: 1.4, delay: '0.4s', opacity: 0.85, dot: true },
    { x: 0,   y: -27, s: 1.4, delay: '1.4s', opacity: 0.8,  dot: true },
  ],
  done: [
    { x: -30, y: -20, s: 3.4, delay: '0s',   opacity: 0.9,  dot: false },
    { x: 29,  y: -18, s: 2.8, delay: '0.6s', opacity: 0.8,  dot: false },
    { x: -28, y: 19,  s: 2.4, delay: '1s',   opacity: 0.75, dot: false },
    { x: 30,  y: 20,  s: 1.6, delay: '0.3s', opacity: 0.85, dot: true },
    { x: 0,   y: -31, s: 1.5, delay: '1.3s', opacity: 0.8,  dot: true },
    { x: 0,   y: 31,  s: 1.3, delay: '0.85s',opacity: 0.7,  dot: true },
  ],
};

let _uid = 0;

const Floret = ({ x, y, scale, color, active }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <path d="M 0 -11 Q 7 -7 7 0 Q 7 7 0 11 Q -7 7 -7 0 Q -7 -7 0 -11" fill={color} />
    <path d="M 11 0 Q 7 7 0 7 Q -7 7 -11 0 Q -7 -7 0 -7 Q 7 -7 11 0" fill={color} />
    <circle cx="0" cy="0" r="2.6" fill="#facc15" />
    {active && (
      <animateTransform
        attributeName="transform"
        type="scale"
        additive="sum"
        values="1;1.06;1"
        dur="2.2s"
        repeatCount="indefinite"
      />
    )}
  </g>
);

const Sparkle = ({ x, y, s, delay, opacity = 0.85, dot = false }) =>
  dot ? (
    <circle cx={x} cy={y} r={s} fill="#fde68a" opacity={opacity}>
      <animate attributeName="opacity" values={`${opacity};0.15;${opacity}`} dur="1.8s" repeatCount="indefinite" begin={delay} />
    </circle>
  ) : (
    <path
      d={`M ${x} ${y - s} l ${s * 0.42} ${s} ${s} ${s * 0.42} -${s} ${s * 0.42} -${s * 0.42} ${s} -${s * 0.42} -${s} -${s} -${s * 0.42} ${s} -${s * 0.42} z`}
      fill="#fde68a"
      opacity={opacity}
    >
      <animate attributeName="opacity" values={`${opacity};0.15;${opacity}`} dur="1.8s" repeatCount="indefinite" begin={delay} />
    </path>
  );

const SparkleRing = ({ state }) => (
  <>
    {SPARKLES_BY_STATE[state].map((sp, i) => (
      <Sparkle key={i} {...sp} />
    ))}
  </>
);

const Mascot = ({ size = 56, state = 'idle', className = '' }) => {
  const id = React.useMemo(() => `bloom-${++_uid}`, []);
  const swayDur = state === 'active' ? '1.4s' : '4s';
  const isDone = state === 'done';
  const isActive = state === 'active';
  const isIdle = !isDone && !isActive;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Bloom the mascot, ${state}`}
    >
      <line x1="32" y1="42" x2="32" y2="60" stroke="#2f7a3d" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 32 50 Q 44 46 49 54 Q 38 57 32 50" fill="#3d9b4d" />

      <g transform="translate(32,28)">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-3;3;-3"
          dur={swayDur}
          repeatCount="indefinite"
          additive="sum"
        />

        {isIdle && (
          <g>
            {/* soft ambient glow behind the bud cluster */}
            <circle cx="0" cy="-2" r="20" fill="#a855f7" opacity="0.16">
              <animate attributeName="opacity" values="0.12;0.2;0.12" dur={swayDur} repeatCount="indefinite" />
            </circle>

            {/* tight cluster of small glossy bud-dots */}
            {BUD_DOTS.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.color} />
            ))}
            <circle cx="-4" cy="-9" r="1.6" fill="#fff" opacity="0.6" />
            <circle cx="3" cy="-17" r="1.3" fill="#fff" opacity="0.6" />

            <SparkleRing state="idle" />
          </g>
        )}

        {(isActive || isDone) && (
          <g>
            <circle cx="0" cy="0" r="24" fill="#a855f7" opacity={isDone ? 0.12 : 0.16}>
              <animate attributeName="opacity"
                values={isDone ? '0.08;0.16;0.08' : '0.12;0.22;0.12'}
                dur={swayDur} repeatCount="indefinite" />
            </circle>

            {FLORET_LAYOUT.map(([fx, fy, fscale], i) => {
              const factor = isDone ? 1 : 0.55;
              return (
                <Floret
                  key={i}
                  x={fx * factor}
                  y={fy * factor}
                  scale={fscale * (isDone ? 1 : 0.8)}
                  color={FLORET_COLORS[i]}
                  active={isActive}
                />
              );
            })}

            <SparkleRing state={isDone ? 'done' : 'active'} />
          </g>
        )}
      </g>
    </svg>
  );
};

export default Mascot;