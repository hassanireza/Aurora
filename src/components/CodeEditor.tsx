import { forwardRef, useImperativeHandle, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { css } from '@codemirror/lang-css';
import { indentUnit, syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { copyLineDown, cursorCharLeft, cursorCharRight, cursorLineBoundaryBackward, cursorLineBoundaryForward, deleteLine, indentLess, indentMore, insertBlankLine, moveLineDown, moveLineUp, redo, selectLine, toggleComment, undo } from '@codemirror/commands';
import { openSearchPanel, search } from '@codemirror/search';
import { EditorState } from '@codemirror/state';
import { tags as t } from '@lezer/highlight';

const night = EditorView.theme({
  '&': { backgroundColor: 'transparent', color: '#f3e4d6' },
  '.cm-content': { caretColor: '#ffbd78', padding: '12px 0' },
  '.cm-cursor': { borderLeftColor: '#ffbd78', borderLeftWidth: '2px' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'rgba(255,189,120,.24)' },
  '.cm-gutters': { backgroundColor: 'transparent', color: '#8f7d86', border: 'none' },
  '.cm-matchingBracket': { backgroundColor: 'rgba(255,189,120,.22)', outline: 'none' },
}, { dark: true });

const ink = syntaxHighlighting(HighlightStyle.define([
  { tag: [t.tagName, t.className, t.labelName, t.attributeName, t.constant(t.className)], color: '#ff8fb0' },
  { tag: [t.propertyName, t.definition(t.propertyName)], color: '#ffcf8a' },
  { tag: [t.keyword, t.controlKeyword], color: '#c7a1ff' },
  { tag: [t.atom, t.bool, t.null, t.standard(t.name)], color: '#ffe3a1' },
  { tag: [t.number, t.unit, t.color], color: '#9fe8ff' },
  { tag: [t.string, t.special(t.string)], color: '#86efb8' },
  { tag: [t.variableName, t.special(t.variableName)], color: '#ffb48a' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#9fe8ff' },
  { tag: t.comment, color: '#8f7a86', fontStyle: 'italic' },
  { tag: [t.operator, t.punctuation, t.bracket, t.separator], color: '#c9b3c0' },
]));


const PAIRS: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
const CLOSERS = [')', ']', '}'];

/** Every command the on-screen toolbar can run (names double as the toolbar's keys). */
const COMMANDS = {
  newline: insertBlankLine,            // Ctrl+Enter: new line below, wherever the cursor is
  outdent: indentLess, undo, redo,
  left: cursorCharLeft, right: cursorCharRight,
  home: cursorLineBoundaryBackward, end: cursorLineBoundaryForward,
  comment: toggleComment,              // Ctrl+/
  duplicate: copyLineDown,             // Shift+Alt+Down
  deleteLine,                          // Ctrl+Shift+K
  moveUp: moveLineUp, moveDown: moveLineDown, // Alt+Up / Alt+Down
  selectLine,                          // Ctrl+L
  find: openSearchPanel,               // Ctrl+F
} as const;
export type EditorCommand = keyof typeof COMMANDS | 'tab';

export type EditorHandle = { insert: (text: string) => void; command: (name: EditorCommand) => void; blur: () => void };

/** CodeMirror configured for phones: no autocapitalise / autocorrect / smart quotes, 2-space indent, brand theme. */
export const CodeEditor = forwardRef<EditorHandle, { value: string; onChange: (v: string) => void }>(function CodeEditor({ value, onChange }, ref) {
  const view = useRef<EditorView | null>(null);
  useImperativeHandle(ref, () => ({
    insert(text) {
      const v = view.current; if (!v) return;
      const { from, to } = v.state.selection.main;
      const next = v.state.doc.sliceString(to, to + 1);
      const quote = text === '"' || text === "'";
      // Match the keyboard behaviour: pairs auto-close, and typing a closer over the same closer just steps past it.
      if (from === to && next === text && (CLOSERS.includes(text) || quote)) {
        v.dispatch({ selection: { anchor: to + 1 }, scrollIntoView: true });
      } else if (from === to && PAIRS[text]) {
        v.dispatch({ changes: { from, insert: text + PAIRS[text] }, selection: { anchor: from + 1 }, scrollIntoView: true, userEvent: 'input.type' });
      } else {
        v.dispatch({ changes: { from, to, insert: text }, selection: { anchor: from + text.length }, scrollIntoView: true, userEvent: 'input.type' });
      }
      v.focus();
    },
    command(name) {
      const v = view.current; if (!v) return;
      if (name === 'tab') {
        const { from, to } = v.state.selection.main;
        if (v.state.doc.lineAt(from).number !== v.state.doc.lineAt(to).number) indentMore(v);       // several lines selected: indent them all
        else v.dispatch({ changes: { from, to, insert: '  ' }, selection: { anchor: from + 2 }, scrollIntoView: true, userEvent: 'input.indent' });
      } else COMMANDS[name](v);
      if (name !== 'find') v.focus();
    },
    blur() { view.current?.contentDOM.blur(); },
  }), []);

  return (
    <CodeMirror
      value={value}
      minHeight="168px"
      maxHeight="340px"
      onChange={onChange}
      onCreateEditor={(v) => { view.current = v; }}
      theme="none"
      extensions={[
        css(), night, ink, indentUnit.of('  '), search({ top: true }),
        EditorState.phrases.of({ next: 'Next', previous: 'Prev', all: 'All', 'match case': 'Aa', 'by word': 'Word', replace: 'Replace', 'replace all': 'Replace all', Find: 'Find in code', Replace: 'Replace with' }),
        EditorView.contentAttributes.of({ autocapitalize: 'off', autocorrect: 'off', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'CSS code editor', enterkeyhint: 'enter' }),
      ]}
      basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: false, highlightActiveLineGutter: false, autocompletion: false, closeBrackets: true, searchKeymap: true }}
    />
  );
});
