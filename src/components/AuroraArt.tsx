import { useId } from 'react';
import { HILLS, RIBBONS, ribbonPath } from '../art';

/** The Aurora mark: a glowing window onto the northern sky, with orbit rings and a small constellation. Used for the hero. */
export function AuroraArt({ size = 300, rings = true, className = '' }: { size?: number; rings?: boolean; className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={className} width={size} height={size} viewBox="-400 -400 800 800" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`h${id}`}><stop offset="0" stopColor="#ffbd78" stopOpacity=".5" /><stop offset=".5" stopColor="#c9703c" stopOpacity=".15" /><stop offset="1" stopColor="#c9703c" stopOpacity="0" /></radialGradient>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#120b33" /><stop offset=".55" stopColor="#43214a" /><stop offset="1" stopColor="#c9703c" /></linearGradient>
        <clipPath id={`c${id}`}><circle r="130" /></clipPath>
        {RIBBONS.map((r, i) => <linearGradient key={i} id={`r${id}${i}`} x1="0" y1={r.y - r.amp} x2="0" y2={r.y + 46} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={r.c1} stopOpacity=".95" /><stop offset=".5" stopColor={r.c2} stopOpacity=".5" /><stop offset="1" stopColor={r.c2} stopOpacity="0" /></linearGradient>)}
      </defs>
      <circle r="330" fill={`url(#h${id})`} />
      {rings && <>
        <ellipse className="cell-ring a" rx="318" ry="214" transform="rotate(-24)" fill="none" stroke="#ffd9a8" strokeOpacity=".4" strokeWidth="5" />
        <ellipse className="cell-ring b" rx="226" ry="166" transform="rotate(38)" fill="none" stroke="#ffd9a8" strokeOpacity=".22" strokeWidth="4" />
        <path d="M-236 128 L-84 54 L150 -22 L262 -178" fill="none" stroke="#ffe3c4" strokeOpacity=".32" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 14" />
      </>}
      <g className="cell-core" clipPath={`url(#c${id})`}>
        <g transform="translate(-130 -130) scale(2.6)">
          <rect width="100" height="100" fill={`url(#s${id})`} />
          {RIBBONS.map((r, i) => <path key={i} className={`ribbon-shape rs${i}`} d={ribbonPath(r)} fill={`url(#r${id}${i})`} fillOpacity=".85" />)}
          <g fill="#fff"><circle cx="20" cy="12" r="1" opacity=".8" /><circle cx="64" cy="8" r="1.2" opacity=".9" /><circle cx="84" cy="22" r=".9" opacity=".6" /><circle cx="40" cy="20" r=".7" opacity=".6" /></g>
          <path d={HILLS[0]} fill="#07040f" /><path d={HILLS[1]} fill="#030208" />
        </g>
      </g>
      <circle r="130" fill="none" stroke="#ffd9a8" strokeOpacity=".55" strokeWidth="4" />
      {rings && <g fill="#fff0d8"><circle cx="-236" cy="128" r="14" className="twinkle" /><circle cx="150" cy="-22" r="10" opacity=".8" /><circle cx="262" cy="-178" r="17" className="twinkle t2" /></g>}
    </svg>
  );
}
