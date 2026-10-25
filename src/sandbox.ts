import { STARTER_CSS } from './examples';
import { TERMINAL_HTML } from './scenes';

const KEY = 'aurora.sandbox.v1';
export type Sandbox = { code: string; html: string };

export function loadSandbox(): Sandbox {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (s && typeof s.code === 'string') return { code: s.code, html: typeof s.html === 'string' ? s.html : TERMINAL_HTML };
  } catch { /* fall through */ }
  return { code: STARTER_CSS, html: TERMINAL_HTML };
}
export function saveSandbox(s: Sandbox) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode / quota */ } }
