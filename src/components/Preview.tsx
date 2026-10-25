import { useEffect, useRef, useState } from 'react';
import { PHONE_W, WIDE_W, buildDoc, holdStates } from '../css';

type Props = { html: string; css: string; height: number; wide?: boolean; hold?: boolean; label: string; reload?: number };

/** A live, script-free render of a scene. It is drawn at a true phone (360px) or desktop (900px) width and scaled to fit,
 *  so media queries and container queries behave exactly like the grader sees them. */
export function Preview({ html, css, height, wide = false, hold = false, label, reload = 0 }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [cw, setCw] = useState(340);
  const [doc, setDoc] = useState(() => buildDoc(html, css, hold));
  const logical = wide ? WIDE_W : PHONE_W;
  const scale = Math.min(1, cw / logical);

  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(() => setCw(el.clientWidth || 340));
    ro.observe(el); setCw(el.clientWidth || 340);
    return () => ro.disconnect();
  }, []);
  // Debounced, so typing never fights the renderer.
  useEffect(() => { const t = window.setTimeout(() => setDoc(buildDoc(html, css, hold)), 220); return () => window.clearTimeout(t); }, [html, css, hold, reload]);
  const sync = () => holdStates(frame.current?.contentDocument, hold);
  useEffect(sync, [hold, doc]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="preview" ref={box} style={{ height: Math.round(height * scale) }}>
      <div style={{ width: Math.round(logical * scale), height: Math.round(height * scale), overflow: 'hidden', flex: 'none' }}>
        <iframe ref={frame} title={label} sandbox="allow-same-origin" srcDoc={doc} onLoad={sync} tabIndex={-1}
          style={{ width: logical, height, transform: `scale(${scale})`, margin: 0 }} />
      </div>
    </div>
  );
}
