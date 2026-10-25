import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronDown, ChevronLeft, ChevronRight, Code2, FileCode2, Monitor, Pointer, Play, Smartphone, Terminal, Trash2, Undo2 } from 'lucide-react';
import { Accessory, keepFocus } from '../components/Accessory';
import { CodeEditor, type EditorHandle } from '../components/CodeEditor';
import { Preview } from '../components/Preview';
import { Sheet } from '../components/Sheet';
import { EXAMPLES, type Example } from '../examples';
import { useEditing } from '../hooks';
import { lintCss, type Issue } from '../css';
import { loadSandbox, saveSandbox } from '../sandbox';
import { TERMINAL_HTML } from '../scenes';

type Run = { state: 'idle' | 'done' | 'error'; issues: Issue[]; ms?: number; rules?: number };
type Undo = { code: string; html: string; label: string };

/** A free scratchpad: write any CSS, edit the markup it styles, and watch the canvas. Nothing here affects progress. */
export function TerminalScreen({ onBack }: { onBack: () => void }) {
  const saved = useMemo(loadSandbox, []);
  const [code, setCode] = useState(saved.code);
  const [html, setHtml] = useState(saved.html);
  const [run, setRun] = useState<Run>({ state: 'idle', issues: [] });
  const [sheet, setSheet] = useState(false);
  const [markupOpen, setMarkupOpen] = useState(false);
  const [undo, setUndo] = useState<Undo | null>(null);
  const [wide, setWide] = useState(false);
  const [hold, setHold] = useState(false);
  const [reload, setReload] = useState(0);
  const editor = useRef<EditorHandle>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const pendingScroll = useRef(false);
  const editing = useEditing();
  const lines = code.trim() ? code.replace(/\s+$/, '').split('\n').length : 0;

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { const t = window.setTimeout(() => saveSandbox({ code, html }), 400); return () => window.clearTimeout(t); }, [code, html]);
  useEffect(() => { if (!undo) return; const t = window.setTimeout(() => setUndo(null), 7000); return () => window.clearTimeout(t); }, [undo]);
  useEffect(() => {
    if (!editing && pendingScroll.current) {
      pendingScroll.current = false;
      const t = window.setTimeout(() => consoleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 180);
      return () => window.clearTimeout(t);
    }
  }, [editing]);

  /** Re-renders from scratch (animations restart) and reports anything the browser would silently ignore. */
  function start() {
    if (editing) pendingScroll.current = true; else requestAnimationFrame(() => consoleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    (document.activeElement as HTMLElement | null)?.blur?.();
    const t0 = performance.now();
    const issues = lintCss(code);
    setReload((n) => n + 1);
    setRun({ state: issues.length ? 'error' : 'done', issues, ms: Math.max(1, Math.round(performance.now() - t0)), rules: (code.match(/\{/g) ?? []).length });
  }

  const replace = (next: { code: string; html: string }, label: string) => { setUndo({ code, html, label }); setCode(next.code); setHtml(next.html); setRun({ state: 'idle', issues: [] }); };
  const useExample = (e: Example) => { setSheet(false); replace({ code: e.code, html: e.html ?? html }, `Loaded “${e.title}”`); };

  const status = run.state === 'done' ? `DONE · ${run.ms} MS` : run.state === 'error' ? `${run.issues.length} NOTE${run.issues.length === 1 ? '' : 'S'}` : 'READY';
  const runAction = <button className="primary run-mini" onPointerDown={keepFocus} onClick={start}><Play size={15} fill="currentColor" /> Run</button>;

  return (
    <div className="workspace play terminal">
      <div className="focus-bar">
        <button className="done" onClick={() => editor.current?.blur()}><ChevronDown size={18} /> Done</button>
        <span className="focus-title"><Terminal size={14} /> Terminal</span>
      </div>

      <div className="play-bar">
        <button className="back" onClick={onBack}><ChevronLeft size={18} /> MAP</button>
        <div className="level-no">SANDBOX</div>
        <div className="play-bar-end" aria-hidden="true" />
      </div>

      <div className="question-head sandbox-head">
        <div className="eyebrow">FREE PLAY</div>
        <h1>Terminal</h1>
        <p>Write any CSS and edit the markup it styles. Your work is saved on this device, and nothing here counts toward your path.</p>
      </div>

      <div className="card editor-card">
        <div className="card-top">
          <span><Code2 size={14} /> styles.css</span>
          <span className="rt rt-ready">LIVE</span>
          <span className="lines">{lines} {lines === 1 ? 'line' : 'lines'}</span>
          <button className="icon-btn" onClick={() => code && replace({ code: '', html }, 'Editor cleared')} aria-label="Clear editor" disabled={!code}><Trash2 size={16} /></button>
        </div>
        <div className="editor"><CodeEditor ref={editor} value={code} onChange={setCode} /></div>
      </div>

      <div className="card input-card">
        <button className="card-top toggle" onClick={() => setMarkupOpen((o) => !o)} aria-expanded={markupOpen}>
          <span><FileCode2 size={14} /> MARKUP</span>
          <span className="hint-line">{html.trim() ? `${html.split('\n').length} line(s) of HTML` : 'empty page'}</span>
          <ChevronRight size={16} className={`chev${markupOpen ? ' open' : ''}`} />
        </button>
        {markupOpen && (
          <textarea className="stdin" value={html} onChange={(e) => setHtml(e.target.value)} rows={6} autoCapitalize="off" autoCorrect="off" spellCheck={false}
            placeholder={'The HTML your CSS styles.\nExample:\n<div class="card">Hello</div>'} aria-label="HTML markup that the CSS styles" />
        )}
        {markupOpen && <div className="markup-tools"><button className="ghost small" onClick={() => replace({ code, html: TERMINAL_HTML }, 'Markup reset')}>Reset markup</button></div>}
      </div>

      <div className="card output-card" ref={consoleRef}>
        <div className="card-top">
          <span><Terminal size={14} /> CANVAS</span>
          <span className="switches">
            <button className={`sw${wide ? ' on' : ''}`} onClick={() => setWide((w) => !w)} aria-pressed={wide} aria-label={wide ? 'Showing a 900px wide screen' : 'Showing a 360px phone screen'}>{wide ? <Monitor size={14} /> : <Smartphone size={14} />}{wide ? '900' : '360'}</button>
            <button className={`sw${hold ? ' on' : ''}`} onClick={() => setHold((h) => !h)} aria-pressed={hold} aria-label="Hold hover and focus states"><Pointer size={14} />HOLD</button>
          </span>
          <span className={`status s-${run.state === 'error' ? 'error' : run.state === 'done' ? 'ok' : 'idle'}`}>{status}</span>
        </div>
        <Preview html={html} css={code} height={300} wide={wide} hold={hold} reload={reload} label="Live canvas" />
        <pre aria-live="polite">
          {run.state === 'idle' && <span className="muted">The canvas updates as you type. Press Run to restart animations and check for mistakes.</span>}
          {run.state === 'done' && <span className="muted">No problems found. {run.rules} block{run.rules === 1 ? '' : 's'} of CSS rendered.</span>}
          {run.state === 'error' && run.issues.map((i, k) => <span className="err" key={k}>Line {i.line}: {i.text}</span>)}
        </pre>
      </div>

      {undo && <div className="toast" role="status"><span>{undo.label}</span><button onClick={() => { setCode(undo.code); setHtml(undo.html); setUndo(null); }}><Undo2 size={15} /> Undo</button></div>}

      <div className="dock play-dock">
        <div className="actions">
          <button className="ghost" onClick={() => setSheet(true)}><BookOpen size={17} /> Examples</button>
          <button className="primary run-btn" onClick={start}><Play size={15} fill="currentColor" /> Run code</button>
        </div>
      </div>

      <Accessory editor={editor} action={runAction} />

      {sheet && (
        <Sheet eyebrow="START FROM" title="Examples" onClose={() => setSheet(false)}>
          <div className="example-list">
            {EXAMPLES.map((e) => (
              <button key={e.id} className="example" onClick={() => useExample(e)}>
                <span><b>{e.title}</b><small>{e.blurb}</small></span><ChevronRight size={18} />
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}
