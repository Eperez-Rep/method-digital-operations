# Method™

Landing page with horizontal scroll sections, an animated canvas background (node network), and EN/ES + light/dark theme support.

## Structure

```
index.html    → page structure
style.css     → styles and design variables
script.js     → i18n, theme, canvas animation, and auto-slide
```

## Running it

No build step or dependencies required. Open `index.html` in your browser, or serve it locally:

```bash
npx serve .
```

or with Python:

```bash
python3 -m http.server
```

## Panels

1. **Home** — main headline.
2. **Services** — list of work areas.
3. **More information** — direct link to WhatsApp.
4. Home clone (seamless visual loop).

The horizontal scroll advances automatically every 6 seconds.

## Quick customization

- **Languages**: text in `script.js`, `T` object (`en` / `es`).
- **Theme**: color variables in `style.css`, `:root` and `[data-theme="light"]` blocks.
- **WhatsApp**: link in `index.html`, panel 3 (`href="https://wa.me/..."`).
- **Canvas**: node count and behavior in `script.js`, `initNodes()` / `draw()` functions.
