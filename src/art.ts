/** Pure geometry for the aurora ribbons, shared by the logo, the hero and the backdrop. */
export type Ribbon = { c1: string; c2: string; y: number; amp: number; freq: number; ph: number };
export const RIBBONS: Ribbon[] = [
  { c1: '#ffbd78', c2: '#ff7a6b', y: 30, amp: 14, freq: 0.9, ph: 0 },
  { c1: '#ff8fb0', c2: '#a55cff', y: 38, amp: 12, freq: 1.3, ph: 1.7 },
  { c1: '#ffe3a1', c2: '#ffbd78', y: 26, amp: 10, freq: 1.7, ph: 3.1 },
  { c1: '#9fe8ff', c2: '#7a6cff', y: 46, amp: 9, freq: 1.1, ph: 4.6 },
];
/** A wavy band across a 100 x 100 box. */
export function ribbonPath(r: Ribbon, t = 0): string {
  let top = '', bot = '';
  for (let i = 0; i <= 20; i++) {
    const x = (i / 20) * 100;
    const y = r.y + Math.sin(x * 0.045 * r.freq + t + r.ph) * r.amp * 0.55 + Math.sin(x * 0.11 + t * 1.7 + r.ph) * r.amp * 0.18;
    top += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(2)}`;
    bot = `L${x.toFixed(1)} ${(y + 40 + Math.sin(t + x * 0.06) * 6).toFixed(2)}` + bot;
  }
  return `${top}${bot}Z`;
}
export const HILLS = ['M0 100V82Q14 70 28 80T54 76Q70 66 84 78T100 74V100Z', 'M0 100V90Q20 82 40 89T78 86Q92 84 100 88V100Z'];
