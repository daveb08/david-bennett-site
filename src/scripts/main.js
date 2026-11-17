import './reveal.js';
import './buttons.js';
import './menu.js';
import './copy-email.js';
import './contact-form.js';
import './drag-hint.js';
import './timeline.js';
import './sketches.js';

// three.js is the heaviest thing on the page. Load it on the visitor's first interaction,
// or shortly after the page has finished loading, whichever comes first.
let started = false;
const events = ['pointermove', 'pointerdown', 'touchstart', 'keydown', 'scroll'];
const loadScene = () => {
  if (started) return;
  started = true;
  events.forEach((e) => removeEventListener(e, loadScene));
  import('./hero-scene.js').catch(() => {
    const stage = document.getElementById('stage');
    if (stage) stage.style.display = 'none';
  });
};
events.forEach((e) => addEventListener(e, loadScene, { passive: true, once: true }));
const later = () => setTimeout(loadScene, 2500);
if (document.readyState === 'complete') later();
else addEventListener('load', later, { once: true });
