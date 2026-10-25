import { SCENES } from './scenes';

export type Example = { id: string; title: string; blurb: string; code: string; html?: string };

export const STARTER_CSS = `/* Welcome to the terminal.
   Write CSS here and watch the canvas change. */
.card {
  padding: 20px;
  background: linear-gradient(135deg, #ffbd78, #ff7a59);
  border-radius: 16px;
}
.title {
  margin-top: 0;
  color: #2b1630;
}
`;

export const EXAMPLES: Example[] = [
  { id: 'hello', title: 'Warm card', blurb: 'padding, gradient, radius', code: STARTER_CSS, html: SCENES.card.html },
  { id: 'flex', title: 'Flex row', blurb: 'display flex, gap, centring', code: `.row {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 14px;\n}\n.box {\n  border-radius: 50%;\n}\n`, html: SCENES.boxes.html },
  { id: 'grid', title: 'Grid of cells', blurb: 'repeat, fr units, spans', code: `.grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 10px;\n}\n.cell:first-child {\n  grid-column: span 2;\n}\n`, html: SCENES.grid.html },
  { id: 'hover', title: 'Hover and transition', blurb: 'smooth state changes', code: `.btn {\n  padding: 12px 22px;\n  border-radius: 999px;\n  transition: transform 200ms ease, background-color 200ms ease;\n}\n.btn:hover {\n  transform: translateY(-3px);\n  background-color: #ff7a59;\n}\n`, html: SCENES.card.html },
  { id: 'vars', title: 'Custom properties', blurb: 'one variable, many uses', code: `:root {\n  --glow: #ff8fb0;\n  --space: 18px;\n}\n.card {\n  padding: var(--space);\n  border: 2px solid var(--glow);\n}\n.title {\n  color: var(--glow);\n}\n.btn {\n  background: var(--glow);\n  color: #2b1630;\n}\n`, html: SCENES.card.html },
  { id: 'keyframes', title: 'Keyframes', blurb: 'a looping animation', code: `@keyframes drift {\n  from { transform: translateX(0); }\n  to { transform: translateX(60px); }\n}\n.badge {\n  display: inline-block;\n  animation: drift 1.6s ease-in-out infinite alternate;\n}\n`, html: SCENES.card.html },
  { id: 'responsive', title: 'Responsive', blurb: 'media queries (try the Wide switch)', code: `.grid {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 10px;\n}\n@media (min-width: 600px) {\n  .grid {\n    grid-template-columns: repeat(3, 1fr);\n  }\n}\n`, html: SCENES.grid.html },
  { id: 'pseudo', title: 'Pseudo-elements', blurb: '::before, ::after, ::first-letter', code: `.title::before {\n  content: "✦ ";\n  color: #ffbd78;\n}\n.text::first-letter {\n  font-size: 2.4em;\n  float: left;\n  line-height: 1;\n  margin-right: 6px;\n}\n`, html: SCENES.card.html },
  { id: 'blank', title: 'Blank page', blurb: 'start from nothing', code: '' },
];
