import { useId } from 'react';
import { HILLS, RIBBONS, ribbonPath } from '../art';

/** Small, crisp brand tile for the header (a tiny version of the app icon): dusk sky, aurora ribbons, dark hills.
 *  Pure vector, no blur filters, so it stays sharp on 3x iPhone screens. */
export function LogoMark({ size = 30 }: { size?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" focusable="false" shapeRendering="geometricPrecision" style={{ display: 'block', flex: 'none' }}>
      <defs>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#120b33" /><stop offset=".55" stopColor="#43214a" /><stop offset="1" stopColor="#c9703c" /></linearGradient>
        <clipPath id={`c${id}`}><rect x="1" y="1" width="98" height="98" rx="24" /></clipPath>
        {RIBBONS.map((r, i) => <linearGradient key={i} id={`r${id}${i}`} x1="0" y1={r.y - r.amp} x2="0" y2={r.y + 46} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={r.c1} stopOpacity=".95" /><stop offset=".5" stopColor={r.c2} stopOpacity=".5" /><stop offset="1" stopColor={r.c2} stopOpacity="0" /></linearGradient>)}
      </defs>
      <g clipPath={`url(#c${id})`}>
        <rect width="100" height="100" fill={`url(#s${id})`} />
        {RIBBONS.map((r, i) => <path key={i} d={ribbonPath(r)} fill={`url(#r${id}${i})`} fillOpacity=".85" />)}
        <g fill="#fff"><circle cx="18" cy="14" r="1.1" opacity=".8" /><circle cx="70" cy="9" r="1.3" opacity=".9" /><circle cx="86" cy="26" r=".9" opacity=".6" /><circle cx="42" cy="8" r=".8" opacity=".6" /></g>
        <path d={HILLS[0]} fill="#07040f" /><path d={HILLS[1]} fill="#030208" />
      </g>
      <rect x="1" y="1" width="98" height="98" rx="24" fill="none" stroke="#ffbd78" strokeOpacity=".35" strokeWidth="2" />
    </svg>
  );
}
