import { episodeNames } from './episodes';
import { buildLevels, titleFor } from './puzzles';
import { SCENES, type SceneKey } from './scenes';

export type Question = { id: number; world: string; title: string; prompt: string; hint: string; starter: string; target: string; scene: SceneKey; html: string; height: number; xp: number; topic?: string; wide?: boolean; state?: boolean };
type Open = { id: number; title: string; prompt: string; hint: string; starter?: string; target: string; scene: SceneKey; xp: number; topic: string; wide?: boolean; state?: boolean };

const openingQuestions: Open[] = [
  { id: 1, title: 'A first rule', topic: 'Selectors', scene: 'card', prompt: 'Make the .title text the color #ff7a59.', hint: 'A rule is a selector, then declarations inside braces.', starter: '.title {\n  \n}', target: '.title {\n  color: #ff7a59;\n}', xp: 10 },
  { id: 2, title: 'Warm the canvas', topic: 'Background', scene: 'card', prompt: 'Give .card a background color of #ffd9a8.', hint: 'background-color fills the box.', target: '.card {\n  background-color: #ffd9a8;\n}', xp: 10 },
  { id: 3, title: 'Breathing room', topic: 'Padding', scene: 'card', prompt: 'Give .card 24px of padding on every side.', hint: 'Padding is the space inside the border.', target: '.card {\n  padding: 24px;\n}', xp: 10 },
  { id: 4, title: 'Round the light', topic: 'Border radius', scene: 'card', prompt: 'Round the corners of .card with a 16px radius.', hint: 'border-radius rounds corners.', target: '.card {\n  border-radius: 16px;\n}', xp: 10 },
  { id: 5, title: 'Raise the title', topic: 'Font size', scene: 'card', prompt: 'Set the font size of .title to 32px.', hint: 'font-size takes a length such as 32px.', target: '.title {\n  font-size: 32px;\n}', xp: 12 },
  { id: 6, title: 'Centre the line', topic: 'Text align', scene: 'card', prompt: 'Centre the text of .title.', hint: 'text-align: center.', target: '.title {\n  text-align: center;\n}', xp: 12 },
  { id: 7, title: 'Heavier ink', topic: 'Font weight', scene: 'card', prompt: 'Make .title extra bold with a font weight of 800.', hint: 'font-weight accepts numbers up to 900.', target: '.title {\n  font-weight: 800;\n}', xp: 14 },
  { id: 8, title: 'A golden edge', topic: 'Border', scene: 'card', prompt: 'Give .card a 2px solid border in #ffbd78.', hint: 'The border shorthand is width, style, color.', target: '.card {\n  border: 2px solid #ffbd78;\n}', xp: 14 },
  { id: 9, title: 'Space below', topic: 'Margin', scene: 'card', prompt: 'Set the bottom margin of .title to 20px.', hint: 'margin-bottom pushes the next element away.', target: '.title {\n  margin-bottom: 20px;\n}', xp: 14 },
  { id: 10, title: 'Out of sight', topic: 'Display', scene: 'card', prompt: 'Remove .badge from the page completely.', hint: 'display: none removes a box from layout.', target: '.badge {\n  display: none;\n}', xp: 14 },
  { id: 11, title: 'Soft shadow', topic: 'Box shadow', scene: 'card', prompt: 'Give .card a shadow: 0 horizontal offset, 10px vertical offset, 30px blur, color rgba(74, 37, 72, 0.35).', hint: 'box-shadow: x y blur color.', target: '.card {\n  box-shadow: 0 10px 30px rgba(74, 37, 72, 0.35);\n}', xp: 16 },
  { id: 12, title: 'Pill button', topic: 'Border radius', scene: 'card', prompt: 'Turn .btn into a pill: border-radius 999px and padding 12px 28px.', hint: 'A huge radius makes the ends round.', target: '.btn {\n  border-radius: 999px;\n  padding: 12px 28px;\n}', xp: 16 },
  { id: 13, title: 'The touch of light', topic: 'Hover', scene: 'card', prompt: 'When the pointer is over .btn, change its background-color to #ff7a59.', hint: ':hover matches while the pointer is over an element.', target: '.btn:hover {\n  background-color: #ff7a59;\n}', xp: 18, state: true },
  { id: 14, title: 'A row of lights', topic: 'Flexbox', scene: 'boxes', prompt: 'Make .row a flex container with a 12px gap.', hint: 'display: flex lays children in a row.', target: '.row {\n  display: flex;\n  gap: 12px;\n}', xp: 18 },
  { id: 15, title: 'Dead centre', topic: 'Flexbox', scene: 'boxes', prompt: 'Centre the boxes both ways: .row is flex with justify-content and align-items center.', hint: 'Two properties centre both axes.', target: '.row {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}', xp: 18 },
  { id: 16, title: 'Three lanes', topic: 'Grid', scene: 'grid', prompt: 'Make .grid a grid with 3 equal columns (repeat(3, 1fr)) and a 10px gap.', hint: 'repeat(3, 1fr) makes three equal tracks.', target: '.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 10px;\n}', xp: 20 },
  { id: 17, title: 'Dusk gradient', topic: 'Gradients', scene: 'card', prompt: 'Give .card a background of linear-gradient(135deg, #ffbd78, #ff7a59).', hint: 'Angle first, then the colour stops.', target: '.card {\n  background: linear-gradient(135deg, #ffbd78, #ff7a59);\n}', xp: 20 },
  { id: 18, title: 'One variable', topic: 'Custom properties', scene: 'card', prompt: 'Declare --glow: #ffbd78 on :root, then use var(--glow) as the color of .title.', hint: 'Custom properties start with two dashes.', target: ':root {\n  --glow: #ffbd78;\n}\n.title {\n  color: var(--glow);\n}', xp: 22 },
  { id: 19, title: 'Light that slides', topic: 'Animation', scene: 'card', prompt: 'Define @keyframes fade from opacity 0 to opacity 1, and run it on .card for 1s with ease-out.', hint: 'Name the keyframes, then reference the name in animation.', target: '@keyframes fade {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}\n.card {\n  animation: fade 1s ease-out;\n}', xp: 24 },
  { id: 20, title: 'The final pattern', topic: 'Responsive', scene: 'card', prompt: 'Keep the 16px padding on .card, and from 600px wide screens up raise it to 40px (min-width media query).', hint: 'Mobile first: base style, then the query.', starter: '.card {\n  padding: 16px;\n}\n', target: '.card {\n  padding: 16px;\n}\n@media (min-width: 600px) {\n  .card {\n    padding: 40px;\n  }\n}', xp: 28, wide: true },
];
export const episodePalette = ['#ffbd78', '#ff8fb0', '#c7a1ff', '#9fe8ff', '#ffe3a1', '#86efb8', '#ff7a6b', '#8fb4ff', '#f5a3e6', '#b6ee86'];
const worldOf = (id: number) => { const e = Math.ceil(id / 20); return `EPISODE ${String(e).padStart(2, '0')} · ${episodeNames[e - 1]}`; };
const full = (q: Omit<Question, 'world' | 'html' | 'height' | 'starter'> & { starter?: string }): Question => ({ ...q, starter: q.starter ?? '', html: SCENES[q.scene].html, height: SCENES[q.scene].h, world: worldOf(q.id) });

// Levels 21 to 1000 come from the puzzle library in puzzles.ts (deterministic, every prompt unique).
const generated: Question[] = buildLevels(21, 1000, new Set(openingQuestions.map((q) => q.prompt))).map((l) => full({ id: l.id, title: titleFor(l.id - 21), prompt: l.prompt, hint: l.hint, starter: l.starter, target: l.target, scene: l.scene, xp: 10 + l.tier * 2, topic: l.topic, wide: l.wide, state: l.state }));
export const questions: Question[] = [...openingQuestions.map(full), ...generated];
