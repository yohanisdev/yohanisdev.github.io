# porftolio

A static portfolio site. Open `index.html` in a browser or serve this folder with a local static server.

## Files

- `index.html` — page content and structure
- `tailwind.config.js` — Tailwind CDN theme configuration
- `page.css` — custom styles used by this page
- `script.js` — page behavior and Three.js background animation
- `style.css` — legacy stylesheet, currently not loaded by `index.html`

Keep `tailwind.config.js` loaded before the Tailwind CDN script in `index.html` so the theme is available when Tailwind starts.
