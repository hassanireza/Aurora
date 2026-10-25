/* The little worlds every level is rendered into.
   BASE uses :where() everywhere, so it has zero specificity: any selector the learner writes beats it. */
export const BASE = `
:where(html){background:#f6efe9}
:where(body){font:16px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif;color:#2b1d2c}
:where(.btn){display:inline-block;padding:8px 14px;background:#2b1d2c;color:#fff;border:0;border-radius:6px;text-decoration:none;font:inherit}
:where(.badge){display:inline-block;padding:2px 8px;background:#ffbd78;font-size:12px;border-radius:99px}
:where(.row){height:170px;background:#fff3e6;outline:1px dashed #d7b999}
:where(.box){width:64px;background:#ffbd78;color:#2b1630;padding:8px;text-align:center;border-radius:8px}
:where(.box.a){height:44px}:where(.box.b){height:72px}:where(.box.c){height:56px}:where(.box.d){height:40px}:where(.box.e){height:64px}
:where(.grid){background:#fff3e6}
:where(.cell){background:#ffbd78;color:#2b1630;padding:12px;text-align:center;border-radius:6px;min-height:36px}
:where(.page>*){padding:10px;background:#ffd9b0;border-radius:6px}
:where(.scroller){height:160px;overflow:auto;background:#fff3e6}
:where(.frame){margin:0;width:300px}
:where(.photo){display:block;width:200px;height:120px}
:where(.panel){background:#fff;padding:12px;border-radius:8px}
`;

const IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='%23ff8fb0'/><stop offset='1' stop-color='%239fe8ff'/></linearGradient></defs><rect width='300' height='200' fill='url(%23g)'/><circle cx='220' cy='60' r='24' fill='%23fff3c4'/><path d='M0 200V150Q80 110 150 150T300 140V200Z' fill='%232b1d2c'/></svg>";

const cells = (n: number) => Array.from({ length: n }, (_, i) => `<div class="cell">${i + 1}</div>`).join('');

export type Scene = { html: string; h: number };
export const SCENES = {
  card: { h: 300, html: `<div class="card"><span class="badge">New</span><h2 class="title">Northern Lights</h2><p class="text">Ribbons of green and rose drift over the frozen lake.</p><a class="btn" href="#">Explore</a></div>` },
  list: { h: 230, html: `<ul class="list"><li class="item">Dawn</li><li class="item">Noon</li><li class="item">Dusk</li><li class="item">Night</li><li class="item">Aurora</li></ul>` },
  nav: { h: 130, html: `<nav class="nav"><a href="#">Home</a><a href="#">Sky</a><a href="#">Maps</a><a href="#" class="active">Tours</a></nav>` },
  boxes: { h: 220, html: `<div class="row"><div class="box a">A</div><div class="box b">B</div><div class="box c">C</div></div>` },
  boxes5: { h: 260, html: `<div class="row"><div class="box a">A</div><div class="box b">B</div><div class="box c">C</div><div class="box d">D</div><div class="box e">E</div></div>` },
  grid: { h: 300, html: `<div class="grid">${cells(6)}</div>` },
  form: { h: 300, html: `<form class="form" onsubmit="return false"><label class="label" for="n">Name</label><input class="field" id="n" placeholder="Your name"><label class="check"><input type="checkbox" checked> Subscribe</label><button class="btn" type="button">Send</button> <button class="btn off" type="button" disabled>Wait</button></form>` },
  post: { h: 340, html: `<article class="post"><h2 class="title">Reading the sky</h2><p class="lead">Every cloud is a sentence.</p><p class="text">Weather writes slowly, and light <strong>edits</strong> it.</p><p class="text">Look up before you look down.</p><a class="link" href="https://example.com/sky" target="_blank">Read more</a> <a class="link" href="/archive">Archive</a></article>` },
  deck: { h: 320, html: `<section class="deck"><h3 class="head">Tonight</h3><ul class="steps"><li>Pack a flask</li><li>Find dark sky</li><li class="done">Charge camera</li><li>Wait for green</li></ul><p class="note">Clear skies expected.</p><p class="note"></p></section>` },
  media: { h: 260, html: `<figure class="frame"><img class="photo" alt="" src="${IMG}"><figcaption class="cap">Lake at midnight</figcaption></figure>` },
  sticky: { h: 220, html: `<div class="scroller"><div class="bar">Sticky bar</div><p>Light moves slowly across the ice.</p><p>Nothing here is in a hurry.</p><p>The sky keeps its own calendar.</p><p>Snow muffles every sound.</p></div>` },
  areas: { h: 300, html: `<div class="page"><header class="hd">Header</header><nav class="sd">Side</nav><main class="mn">Main</main><footer class="ft">Footer</footer></div>` },
  container: { h: 230, html: `<div class="wrap"><div class="panel"><h3 class="title">Panel</h3><p class="text">I listen to my container.</p></div></div>` },
} satisfies Record<string, Scene>;
export type SceneKey = keyof typeof SCENES;

/** The same scene the free terminal opens with. */
export const TERMINAL_HTML = SCENES.card.html;
