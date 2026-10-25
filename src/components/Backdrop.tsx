import { useEffect, useMemo } from 'react';

/** Fixed night sky: slow aurora ribbons, twinkling stars, and an amber ring wherever you touch ("the sky answers"). */
export function Backdrop() {
  const stars = useMemo(() => {
    let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    return Array.from({ length: 30 }, () => ({ x: r() * 100, y: r() * 62, size: 1.5 + r() * 2.5, d: 3 + r() * 5, delay: -r() * 8, o: 0.25 + r() * 0.55 }));
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('.cm-editor, input, textarea')) return;
      const el = document.createElement('span');
      el.className = 'ripple';
      el.style.left = `${e.clientX}px`; el.style.top = `${e.clientY}px`;
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove(), { once: true });
    };
    window.addEventListener('pointerdown', onDown, { passive: true });
    return () => window.removeEventListener('pointerdown', onDown);
  }, []);

  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-glow" />
      <i className="ribbon r1" /><i className="ribbon r2" /><i className="ribbon r3" />
      {stars.map((p, i) => (
        <i key={i} className="star-dot" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.o, animationDuration: `${p.d}s`, animationDelay: `${p.delay}s` }} />
      ))}
    </div>
  );
}
