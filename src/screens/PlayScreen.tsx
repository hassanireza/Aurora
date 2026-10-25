import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronLeft, Code2, Eye, Lightbulb, Monitor, Pointer, Play, RotateCcw, Smartphone, Sparkles, Terminal } from 'lucide-react';
import { Accessory, keepFocus } from '../components/Accessory';
import { CodeEditor, type EditorHandle } from '../components/CodeEditor';
import { Preview } from '../components/Preview';
import { LEVEL_COUNT } from '../episodes';
import { useEditing } from '../hooks';
import { questions } from '../questions';
import { checkCss, lintCss, type Diff } from '../css';

type Verdict = { kind: 'idle' } | { kind: 'busy'; text: string } | { kind: 'ok'; fresh: boolean } | { kind: 'wrong' } | { kind: 'error'; text: string };
type Props = { id: number; solved: boolean; onSolve: (id: number, xp: number) => void; onOpen: (id: number) => void; onBack: () => void };

export function PlayScreen({ id, solved, onSolve, onOpen, onBack }: Props) {
  const q = questions[id - 1];
  const [code, setCode] = useState(q.starter);
  const [diffs, setDiffs] = useState<Diff[]>([]);
  const [verdict, setVerdict] = useState<Verdict>({ kind: 'idle' });
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const [wide, setWide] = useState(false);
  const [hold, setHold] = useState(false);
  const editor = useRef<EditorHandle>(null);
  const outRef = useRef<HTMLDivElement>(null);
  const runToken = useRef(0);
  const pendingScroll = useRef(false);
  const editing = useEditing();
  const busy = verdict.kind === 'busy';
  const lines = useMemo(() => (code.trim() ? code.replace(/\s+$/, '').split('\n').length : 0), [code]);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => () => { runToken.current++; }, []);
  // After the keyboard closes, bring the result into view (the layout changes back from focus mode first).
  useEffect(() => {
    if (!editing && pendingScroll.current) {
      pendingScroll.current = false;
      const t = window.setTimeout(() => outRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 180);
      return () => window.clearTimeout(t);
    }
  }, [editing]);

  async function run() {
    if (busy) return;
    if (editing) pendingScroll.current = true; else requestAnimationFrame(() => outRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    editor.current?.blur();
    const token = ++runToken.current;
    setReveal(false);
    if (!code.trim()) { setVerdict({ kind: 'error', text: 'Write some CSS first, then run it.' }); return; }
    const issues = lintCss(code);
    if (issues.length) { setVerdict({ kind: 'error', text: issues.map((i) => `Line ${i.line}: ${i.text}`).join('\n') }); return; }
    setVerdict({ kind: 'busy', text: 'Comparing your CSS with the target…' });
    try {
      const r = await checkCss(q.html, code, q.target);
      if (token !== runToken.current) return;
      setDiffs(r.diffs);
      if (r.solved) { setVerdict({ kind: 'ok', fresh: !solved }); onSolve(q.id, q.xp); navigator.vibrate?.(24); }
      else { setVerdict({ kind: 'wrong' }); setAttempts((a) => a + 1); }
    } catch (e) {
      if (token !== runToken.current) return;
      setVerdict({ kind: 'error', text: (e as Error).message === 'TIMEOUT' ? 'The preview took too long to render. Check for anything very heavy and run again.' : (e as Error).message });
    }
  }

  const status = verdict.kind === 'busy' ? 'CHECKING' : verdict.kind === 'error' ? 'ERROR' : verdict.kind === 'ok' ? 'MATCHED' : verdict.kind === 'wrong' ? 'NO MATCH' : 'AWAITING';
  const isDone = solved || verdict.kind === 'ok';
  const last = q.id === LEVEL_COUNT;
  const pad = String(q.id).padStart(3, '0');
  const message = verdict.kind === 'error' ? verdict.text : verdict.kind === 'busy' ? verdict.text : 'Your result updates live as you type. Run it to check it against the target.';

  return (
    <div className="workspace play">
      {/* Focus mode (keyboard open): one slim header instead of the full page chrome */}
      <div className="focus-bar">
        <button className="done" onClick={() => editor.current?.blur()}><ChevronDown size={18} /> Done</button>
        <span className="focus-title"><b>{pad}</b> {q.title}</span>
        <button className={`icon-btn hint-mini${hint ? ' on' : ''}`} onPointerDown={keepFocus} onClick={() => setHint((h) => !h)} aria-label="Show hint" aria-pressed={hint}><Lightbulb size={18} /></button>
      </div>

      <div className="play-bar">
        <button className="back" onClick={onBack}><ChevronLeft size={18} /> MAP</button>
        <div className="level-no">{pad}<span> / {LEVEL_COUNT.toLocaleString()}</span></div>
        <div className="play-bar-end" aria-hidden="true" />
      </div>

      <div className={`question-head${promptOpen ? ' open' : ''}`}>
        <div className="eyebrow">{q.world}{q.topic ? ` · ${q.topic}` : ''}</div>
        <h1>{q.title}</h1>
        <p onClick={() => setPromptOpen((o) => !o)}>{q.prompt}</p>
        <div className="reward"><Sparkles size={13} /> {solved ? 'Already lit' : `+${q.xp} starlight`}<span>·</span>aim for 20 lines or fewer</div>
        {hint && <div className="hint" role="note"><Lightbulb size={16} /><span>{q.hint}</span></div>}
      </div>

      <div className="card editor-card">
        <div className="card-top">
          <span><Code2 size={14} /> styles.css</span>
          <span className="rt rt-ready">LIVE</span>
          <span className="lines">{lines} {lines === 1 ? 'line' : 'lines'}</span>
          <button className="icon-btn" onClick={() => setCode(q.starter)} aria-label="Reset code"><RotateCcw size={16} /></button>
        </div>
        <div className="editor"><CodeEditor ref={editor} value={code} onChange={setCode} /></div>
      </div>

      <div className="card output-card" ref={outRef}>
        <div className="card-top">
          <span><Terminal size={14} /> RESULT</span>
          {(q.wide || q.state) && (
            <span className="switches">
              {q.wide && <button className={`sw${wide ? ' on' : ''}`} onClick={() => setWide((w) => !w)} aria-pressed={wide} aria-label={wide ? 'Showing a 900px wide screen' : 'Showing a 360px phone screen'}>{wide ? <Monitor size={14} /> : <Smartphone size={14} />}{wide ? '900' : '360'}</button>}
              {q.state && <button className={`sw${hold ? ' on' : ''}`} onClick={() => setHold((h) => !h)} aria-pressed={hold} aria-label="Hold hover and focus states"><Pointer size={14} />HOLD</button>}
            </span>
          )}
          <span className={`status s-${verdict.kind}`}>{status}</span>
        </div>
        <Preview html={q.html} css={code} height={q.height} wide={wide} hold={hold} label="Live preview of your CSS" />
        <pre aria-live="polite" className={verdict.kind === 'error' ? 'error' : 'note-line'}>{message}</pre>
        {verdict.kind === 'ok' && <div className="verdict good"><div className="burst" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ ['--a' as string]: `${i * 45}deg` }} />)}</div><Sparkles size={18} /><div><b>{verdict.fresh ? 'Star lit!' : 'Still matches.'}</b><span>{verdict.fresh ? `+${q.xp} starlight added to your sky.` : 'Nice, this level was already lit.'}</span></div></div>}
        {verdict.kind === 'wrong' && <div className="verdict bad"><div><b>Not quite yet.</b><span>The browser renders your CSS differently from the target.{attempts < 2 ? ' Read the prompt again, try the hint, then run again.' : ''}</span></div>
          {attempts >= 2 && !reveal && <button className="ghost" onClick={() => setReveal(true)}><Eye size={15} /> Show what is expected</button>}
          {reveal && (
            <div className="expected">
              <div className="eyebrow">TARGET</div>
              <Preview html={q.html} css={q.target} height={q.height} wide={wide} hold={hold} label="The target result" />
              {diffs.length > 0 && <ul className="diffs">{diffs.map((d, i) => <li key={i}><code>{d.where}</code> <b>{d.prop}</b><span>yours {d.got.length > 60 ? `${d.got.slice(0, 60)}…` : d.got}</span><span>expected {d.want.length > 60 ? `${d.want.slice(0, 60)}…` : d.want}</span></li>)}</ul>}
            </div>
          )}</div>}
      </div>

      <div className="dock play-dock">
        <div className="actions">
          <button className={`ghost hint-btn${hint ? ' on' : ''}`} onClick={() => setHint((h) => !h)} aria-pressed={hint}><Lightbulb size={17} /> Hint</button>
          {isDone && <button className="primary" onClick={() => (last ? onBack() : onOpen(q.id + 1))}>{last ? 'Back to map' : 'Next level'} <ArrowRight size={17} /></button>}
          <button className={isDone ? 'ghost run-btn' : 'primary run-btn'} onClick={run} disabled={busy}><Play size={15} fill="currentColor" />{busy ? 'Checking' : isDone ? 'Run' : 'Run code'}</button>
        </div>
      </div>

      <Accessory editor={editor} action={<button className="primary run-mini" onPointerDown={keepFocus} onClick={run} disabled={busy}><Play size={15} fill="currentColor" /> Run</button>} />
    </div>
  );
}
