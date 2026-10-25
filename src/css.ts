/* The Aurora engine. There is no server and no runtime to download: the browser itself is the interpreter.
   A level is graded by rendering the learner's CSS and the answer key into the same scene (in hidden, script-free
   iframes) and comparing what the browser computed, element by element, at a phone width, at a desktop width, and
   with every :hover / :focus / :active state switched on. Any CSS that renders the same is a correct answer. */
import { BASE } from './scenes';

export const PHONE_W = 360;
export const WIDE_W = 900;
const VIEW_H = 640;
const LOAD_LIMIT = 6000;

const esc = (css: string) => css.replace(/<\/style/gi, '<\\/style');

/** Map interactive pseudo-classes to plain classes so a hidden render can "hold" them. */
export const forceStates = (css: string) => css
  .replace(/:focus-visible/g, '.is-focus').replace(/:focus-within/g, '.is-within')
  .replace(/:focus(?![-\w])/g, '.is-focus').replace(/:hover/g, '.is-hover').replace(/:active(?![-\w])/g, '.is-active');
const FORCED = ['is-hover', 'is-focus', 'is-active', 'is-within'];

export function buildDoc(html: string, css: string, force = false): string {
  const user = force ? forceStates(css) : css;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${esc(BASE)}</style><style>${esc(user)}</style></head><body>${html}</body></html>`;
}

/** Applies the forced-state classes to a rendered preview document. */
export function holdStates(doc: Document | null | undefined, on: boolean) {
  if (!doc?.body) return;
  doc.body.querySelectorAll('*').forEach((el) => FORCED.forEach((c) => el.classList.toggle(c, on)));
}

/* ───────── Reading what the browser computed ───────── */
type Snap = Map<string, string>;
const IMPLICIT = ['::first-line', '::first-letter', '::marker', '::placeholder'] as const;
const IMPLICIT_PROPS = ['color', 'font-size', 'font-weight', 'font-style', 'font-variant-caps', 'text-transform', 'letter-spacing', 'text-decoration-line', 'text-shadow', 'background-color', 'opacity', 'float', 'line-height', 'margin-right', 'content'];
const num = (v: string) => v.replace(/-?\d+\.\d+/g, (m) => String(Math.round(parseFloat(m) * 100) / 100));

function labels(els: Element[]): string[] {
  const seen = new Map<string, number>(); const base = els.map((el) => {
    const t = el.tagName.toLowerCase(), id = el.id ? `#${el.id}` : '', cls = el.classList.length ? `.${[...el.classList].filter((c) => !FORCED.includes(c))[0] ?? ''}` : '';
    return `${t}${id}${cls === '.' ? '' : cls}`;
  });
  const total = new Map<string, number>(); base.forEach((b) => total.set(b, (total.get(b) ?? 0) + 1));
  return base.map((b) => { const n = (seen.get(b) ?? 0) + 1; seen.set(b, n); return total.get(b)! > 1 ? `${b}:${n}` : b; });
}

function waitLoad(frame: HTMLIFrameElement): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = window.setTimeout(() => reject(new Error('TIMEOUT')), LOAD_LIMIT);
    frame.addEventListener('load', () => { window.clearTimeout(t); resolve(); }, { once: true });
  });
}

async function snapshot(html: string, css: string, width: number, force: boolean): Promise<Snap> {
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-same-origin'); // no scripts: learner CSS can never run code
  frame.setAttribute('aria-hidden', 'true'); frame.tabIndex = -1;
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${width}px;height:${VIEW_H}px;border:0;visibility:hidden;pointer-events:none`;
  const loaded = waitLoad(frame);
  frame.srcdoc = buildDoc(html, css, force);
  document.body.appendChild(frame);
  try {
    await loaded;
    const doc = frame.contentDocument!, win = frame.contentWindow!;
    try { await doc.fonts?.ready; } catch { /* ignore */ }
    if (force) holdStates(doc, true);
    void doc.body.offsetWidth;
    // Freeze time: transitions jump to their end value, animations rest on their first frame.
    const anims = doc.getAnimations();
    for (const a of anims) {
      if ('transitionProperty' in a) { try { a.finish(); } catch { /* ignore */ } } else { a.pause(); a.currentTime = 0; }
    }
    void doc.body.offsetWidth;
    const els = [doc.body, ...Array.from(doc.body.querySelectorAll('*'))].filter((e) => !['SCRIPT', 'STYLE'].includes(e.tagName));
    const names = labels(els);
    const out: Snap = new Map();
    els.forEach((el, i) => {
      const cs = win.getComputedStyle(el), L = names[i];
      for (let k = 0; k < cs.length; k++) { const p = cs[k]; out.set(`${L}|${p}`, num(cs.getPropertyValue(p))); }
      for (const ps of ['::before', '::after'] as const) {
        const pc = win.getComputedStyle(el, ps), content = pc.content;
        if (!content || content === 'none' || content === 'normal') continue;
        for (let k = 0; k < pc.length; k++) { const p = pc[k]; out.set(`${L}${ps}|${p}`, num(pc.getPropertyValue(p))); }
      }
      for (const ps of IMPLICIT) {
        if (ps === '::marker' && win.getComputedStyle(el).display !== 'list-item') continue;
        if (ps === '::placeholder' && !(el as HTMLInputElement).placeholder) continue;
        const pc = win.getComputedStyle(el, ps);
        for (const p of IMPLICIT_PROPS) out.set(`${L}${ps}|${p}`, num(pc.getPropertyValue(p)));
      }
    });
    anims.forEach((a, i) => {
      const eff = a.effect as KeyframeEffect | null; if (!eff) return;
      const t = eff.target, at = t ? names[els.indexOf(t)] ?? 'element' : 'element';
      let kf = '';
      try { kf = JSON.stringify(eff.getKeyframes().map((f) => { const { easing, composite, ...rest } = f as Record<string, unknown>; void easing; void composite; return rest; })); } catch { /* ignore */ }
      const ct = eff.getComputedTiming();
      out.set(`${at}|@animation:${(a as CSSAnimation).animationName ?? i}`, num(`${kf} ${ct.duration} ${ct.delay} ${ct.iterations} ${ct.direction} ${ct.fill} ${ct.easing}`));
    });
    return out;
  } finally { frame.remove(); }
}

/* ───────── Comparing ───────── */
export type Diff = { where: string; prop: string; got: string; want: string };
export type CheckResult = { solved: boolean; diffs: Diff[] };
const NOISE = /^(inline-size|block-size|min-inline|max-inline|min-block|max-block|perspective-origin|transform-origin|-webkit-|border-(block|inline)|margin-(block|inline)|padding-(block|inline)|inset-(block|inline)|-internal)/;
const CONTEXTS: Array<[string, number, boolean]> = [['', PHONE_W, false], ['at 900px', WIDE_W, false], ['with hover and focus', PHONE_W, true]];

export async function checkCss(html: string, userCss: string, targetCss: string): Promise<CheckResult> {
  const diffs: Diff[] = [];
  const runs = await Promise.all(CONTEXTS.map(async ([label, w, force]) => {
    const [mine, key] = await Promise.all([snapshot(html, userCss, w, force), snapshot(html, targetCss, w, force)]);
    return { label, mine, key };
  }));
  for (const { label, mine, key } of runs) {
    const keys = new Set([...mine.keys(), ...key.keys()]);
    for (const k of keys) {
      const a = mine.get(k) ?? '(none)', b = key.get(k) ?? '(none)';
      if (a === b) continue;
      const [where, prop] = k.split('|');
      diffs.push({ where: label ? `${where} (${label})` : where, prop, got: a, want: b });
    }
  }
  const solved = diffs.length === 0;
  return { solved, diffs: solved ? [] : tidy(diffs) };
}

/** Collapse noise (logical twins, prefixed aliases, derived origins) so a learner sees the few lines that matter. */
function tidy(all: Diff[]): Diff[] {
  const hasColor = new Set(all.filter((d) => d.prop === 'color').map((d) => d.where));
  const derived = (d: Diff) => hasColor.has(d.where) && /(^|-)color$/.test(d.prop) && d.prop !== 'color' && d.prop !== 'background-color';
  const real = all.filter((d) => !NOISE.test(d.prop) && !derived(d));
  const pool = real.length ? real : all;
  const seen = new Set<string>(), out: Diff[] = [];
  for (const d of pool) { const id = `${d.where}|${d.prop}`; if (!seen.has(id)) { seen.add(id); out.push(d); } }
  const lone = out.filter((d) => !/^(border|margin|padding|outline|column|row)-/.test(d.prop) || out.filter((o) => o.where === d.where).length < 4);
  return (lone.length ? lone : out).slice(0, 8);
}

/* ───────── Gentle linting: catches typos the browser would silently ignore ───────── */
export type Issue = { line: number; text: string };
const SKIP_AT = /^@(font-face|property|counter-style|page|font-feature-values|view-transition|font-palette-values)/i;

export function lintCss(code: string): Issue[] {
  const issues: Issue[] = [];
  const stack: { skip: boolean; line: number }[] = [];
  let seg = '', line = 1, segLine = 1, quote = '', paren = 0, comment = false;
  const decl = (text: string, ln: number) => {
    const t = text.trim();
    if (!t || t.startsWith('@')) return;
    const i = t.indexOf(':');
    if (i < 1) { issues.push({ line: ln, text: `"${t.slice(0, 30)}" is not a declaration (expected property: value)` }); return; }
    const prop = t.slice(0, i).trim(), value = t.slice(i + 1).replace(/!\s*important\s*$/i, '').trim();
    if (prop.startsWith('--')) return;
    if (!/^[-\w]+$/.test(prop)) return;
    if (!value) { issues.push({ line: ln, text: `${prop} has no value` }); return; }
    if (typeof CSS === 'undefined' || !CSS.supports) return;
    if (!CSS.supports(`${prop}: initial`)) issues.push({ line: ln, text: `"${prop}" is not a CSS property` });
    else if (!CSS.supports(prop, value)) issues.push({ line: ln, text: `"${value}" is not a valid value for ${prop}` });
  };
  for (let i = 0; i < code.length; i++) {
    const ch = code[i], nx = code[i + 1];
    if (ch === '\n') line++;
    if (comment) { if (ch === '*' && nx === '/') { comment = false; i++; } continue; }
    if (quote) { seg += ch; if (ch === '\\') { seg += nx ?? ''; i++; } else if (ch === quote) quote = ''; continue; }
    if (ch === '/' && nx === '*') { comment = true; i++; continue; }
    if (ch === '"' || ch === "'") { quote = ch; if (!seg.trim()) segLine = line; seg += ch; continue; }
    if (ch === '(') paren++;
    if (ch === ')') paren = Math.max(0, paren - 1);
    if (paren > 0) { seg += ch; continue; }
    if (!seg.trim() && !/\s/.test(ch)) segLine = line;
    if (ch === '{') { const pre = seg.trim(); stack.push({ skip: !!stack[stack.length - 1]?.skip || SKIP_AT.test(pre), line: segLine }); seg = ''; continue; }
    if (ch === '}') {
      if (!stack.length) issues.push({ line, text: 'Unexpected } with no matching {' });
      else { const top = stack.pop()!; if (!top.skip && seg.trim() && !seg.includes('{')) decl(seg, segLine); }
      seg = ''; continue;
    }
    if (ch === ';') { if (stack.length && !stack[stack.length - 1].skip) decl(seg, segLine); seg = ''; continue; }
    seg += ch;
  }
  if (comment) issues.push({ line, text: 'A /* comment is never closed' });
  if (quote) issues.push({ line, text: 'A quote is never closed' });
  for (const open of stack) issues.push({ line: open.line, text: 'This { is never closed with }' });
  return issues.slice(0, 6);
}
