# David Bennett, Ph.D. — personal site

A static site built with [Astro](https://astro.build) and [Tailwind CSS v4](https://tailwindcss.com).
It ships as plain HTML and CSS with a small amount of JavaScript; the 3D hero (three.js) loads on demand.

## Run it locally

Requires Node 18.20 or newer.

```bash
npm install
npm run dev        # http://localhost:4321, reloads as you edit
npm run build      # production build into dist/
npm run preview    # serve the production build
```

## Put it on GitHub

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/daveb08/<repo-name>.git
git push -u origin main
```

## Deploy on Cloudflare (Workers static assets)

1. In the Cloudflare dashboard go to **Workers & Pages > Create application**, choose **Import a repository**
   and pick this GitHub repository.
2. Build command `npm run build`; deploy command `npx wrangler deploy` (the defaults).
   `wrangler.jsonc` tells Cloudflare to serve the built `dist/` folder.
3. Deploy. Every push to `main` rebuilds and redeploys.
4. Under the Worker's **Settings > Domains & Routes** add `davidbennettphd.com` and `www.davidbennettphd.com`
   as custom domains.

`public/_headers` sets long-lived caching for built assets and a few security headers.

## Where things live

```
src/
  pages/index.astro        page: lists the sections in order
  layouts/Layout.astro     <head>, meta tags, fonts, scripts
  components/              one file per section
    Header  Hero  Specs  About  Work  Simulators  Career  Timeline  Publications  Contact
  data/timeline.js         career timeline entries
  styles/
    global.css             Tailwind import and design tokens exposed to Tailwind
    base.css               colours, fonts and element defaults (CSS variables)
    nav.css hero.css ...   one stylesheet per component
  scripts/
    main.js                entry point
    hero-scene.js          the 3D hero (three.js)
    reveal.js menu.js ...  small behaviours, one per file
  assets/david-bennett.jpg portrait (resized and converted to WebP at build time)
public/
  _headers                 caching and security headers for Cloudflare Pages
  David-Bennett-CV.pdf     the file behind "Download CV"
  favicon.svg  robots.txt
```

## Common edits

- **Text:** edit the matching file in `src/components/`.
- **Career timeline:** add or change entries in `src/data/timeline.js`. `track: 's'` puts an entry on the
  science and engineering side, `track: 't'` on the teaching side.
- **Colours and fonts:** the variables at the top of `src/styles/base.css`. They are also available as
  Tailwind utilities (`bg-surface`, `text-muted`, `text-signal`, `font-display`).
- **CV:** replace `public/David-Bennett-CV.pdf`, keeping the file name.
- **Email address:** search the project for `mailto:`.
- **Portrait:** replace `src/assets/david-bennett.jpg`.

## How the styling is organised

Tailwind is set up with the site's design tokens and is used for utilities. The bespoke pieces
(hero, timeline, animations) are written as per-component stylesheets inside Tailwind's `components`
layer, so any Tailwind utility added to an element overrides them. There are no inline `style`
attributes in the markup.

## Performance and accessibility

Lighthouse on the production build scored 100 for performance, accessibility, best practices and SEO,
on both the mobile and desktop presets. That run was local and on a machine without a graphics card,
so re-run it against the live Vercel URL.

What keeps it fast:

- three.js loads on the visitor's first interaction, or 2.5 seconds after the page has loaded.
- The 3D loop pauses when the hero is off screen or the tab is hidden. On devices that cannot hold a
  smooth frame rate it settles on a still frame and wakes for a few seconds when touched.
- The font is self-hosted, the portrait is served as responsive WebP, and all CSS is inlined.
- Animations are disabled for visitors who ask for reduced motion.

## Before going live

- The copy is a first draft written from the CV and LinkedIn profile. Read it through.
- Early engineering dates in the timeline (1997 to 2002) are estimated.
- `David-Bennett-CV.pdf` was rebuilt from the CV text without the phone number. Replace it with your own.
- The "open to" sentence in the hero and the talk topics are suggestions to confirm.
- The domain is set to `https://davidbennettphd.com` in `astro.config.mjs`; canonical and `og:url` follow it.
