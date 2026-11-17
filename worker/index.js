// Cloudflare Worker for davidbennettphd.com.
// Serves the built site from ./dist, and handles POST /api/contact by verifying Cloudflare
// Turnstile and forwarding the message to Dave's inbox through Cloudflare Email Routing.
import { EmailMessage } from 'cloudflare:email';

const FROM = 'contact@davidbennettphd.com';
const TOPICS = { role: 'Role or consulting project', teaching: 'Course or teaching', talk: 'Talk or workshop', other: 'Something else' };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed.' }, 405);
      try { return await contact(request, env); }
      catch (e) { console.error('contact failed', e && e.stack || e); return json({ ok: false, error: 'The message could not be sent.' }, 500); }
    }
    return env.ASSETS.fetch(request);
  },
};

async function contact(request, env) {
  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: 'Bad request.' }, 400); }
  const name = clean(b.name, 120), email = clean(b.email, 200), message = String(b.message || '').trim().slice(0, 5000);
  const topic = TOPICS[b.topic] || TOPICS.other;
  if (b.website) return json({ ok: true }); // honeypot: bots fill the hidden field
  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'Please add your name, a valid email and a message.' }, 400);

  if (!env.TURNSTILE_SECRET) return json({ ok: false, error: 'The form is not set up yet.' }, 503);
  const v = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: String(b.token || ''), remoteip: request.headers.get('CF-Connecting-IP') || '' }),
  }).then((r) => r.json()).catch(() => ({ success: false }));
  if (!v.success) return json({ ok: false, error: 'The bot check failed. Please reload the page and try again.' }, 403);

  const to = env.CONTACT_TO;
  const text = `New message from davidbennettphd.com\n\nName:  ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}\n\n--\nReply to this email to answer ${name} directly.`;
  const raw = [
    `From: "davidbennettphd.com" <${FROM}>`,
    `To: <${to}>`,
    `Reply-To: ${displayName(name)} <${email}>`,
    `Subject: ${encodeWord(`Website: ${topic} - ${name}`)}`,
    `Message-ID: <${crypto.randomUUID()}@davidbennettphd.com>`,
    `Date: ${new Date().toUTCString()}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(text).replace(/.{1,76}/g, '$&\r\n'),
  ].join('\r\n');
  await env.SEND_EMAIL.send(new EmailMessage(FROM, to, raw));
  return json({ ok: true });
}

// One line, no control characters (stops header injection), limited length.
function clean(s, max) { return String(s || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max); }
function b64(s) { let bin = ''; for (const c of new TextEncoder().encode(s)) bin += String.fromCharCode(c); return btoa(bin); }
function isAscii(s) { return /^[\x20-\x7e]*$/.test(s); }
function encodeWord(s) { return isAscii(s) ? s : `=?UTF-8?B?${b64(s)}?=`; }
function displayName(s) { return isAscii(s) ? `"${s.replace(/["\\]/g, '')}"` : encodeWord(s); }
function json(o, status = 200) { return new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }); }
