// Career timeline: the line fills and roles light up as the page scrolls.
import { CALM } from './util.js';

const tl = document.getElementById('tl');
if (tl && !CALM) {
  const fill = document.getElementById('tl-fill');
  const items = tl.querySelectorAll('.ev');
  const end = document.getElementById('tl-end');
  tl.classList.add('live');
  if (end) end.classList.add('wait');
  const update = () => {
    const r = tl.getBoundingClientRect();
    const vh = window.innerHeight || 800;
    const y = Math.max(0, Math.min(r.height, vh * 0.62 - r.top));
    fill.style.height = y + 'px';
    items.forEach((el) => el.classList.toggle('on', el.offsetTop + 24 < y));
    const done = y >= r.height - 1;
    tl.classList.toggle('done', done);
    if (done && end) end.classList.add('on');
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}
