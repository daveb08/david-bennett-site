// Contact form: pre-selects the topic from the buttons that link here, loads Cloudflare
// Turnstile when the form comes near the screen, and posts to /api/contact (worker/index.js).
(function () {
  var form = document.getElementById('cform');
  if (!form) return;
  var topic = document.getElementById('ctopic');
  var status = document.getElementById('cstatus');
  var send = document.getElementById('csend');
  var box = document.getElementById('cts');
  var widget = null;

  document.querySelectorAll('a[data-topic]').forEach(function (a) {
    a.addEventListener('click', function () { topic.value = a.getAttribute('data-topic'); });
  });

  var loaded = false;
  function loadTurnstile() {
    if (loaded) return;
    loaded = true;
    window.onTurnstileLoad = function () {
      widget = window.turnstile.render(box, { sitekey: form.dataset.sitekey, theme: 'dark', appearance: 'interaction-only' });
    };
    var s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';
    s.async = true;
    document.head.appendChild(s);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { loadTurnstile(); io.disconnect(); }
    }, { rootMargin: '600px' });
    io.observe(form);
  } else loadTurnstile();
  form.addEventListener('focusin', loadTurnstile);

  function say(msg, cls) { status.textContent = msg; status.className = 'cstatus' + (cls ? ' ' + cls : ''); }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var d = new FormData(form);
    var name = String(d.get('name') || '').trim(), email = String(d.get('email') || '').trim(), message = String(d.get('message') || '').trim();
    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { say('Please add your name, a valid email and a message.', 'err'); return; }
    var token = window.turnstile && widget !== null ? window.turnstile.getResponse(widget) : '';
    if (!token) { say('One moment, checking you are not a bot. Try again in a few seconds.', 'err'); loadTurnstile(); return; }
    send.disabled = true; say('Sending…');
    fetch('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, topic: d.get('topic'), message: message, website: d.get('website'), token: token })
    }).then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .then(function (j) {
        if (j.ok) { form.reset(); say('Thanks, your message is on its way. I will reply by email.', 'ok'); }
        else say((j.error || 'Something went wrong.') + ' You can also email dave@davidbennettphd.com.', 'err');
      })
      .catch(function () { say('Could not send. Please email dave@davidbennettphd.com.', 'err'); })
      .finally(function () { send.disabled = false; if (window.turnstile && widget !== null) window.turnstile.reset(widget); });
  });
})();
