# HTTPscape

An escape room hidden inside a single evolving website. It offers no room names,
progress meter, instructions, or hints; the page itself is the puzzle.

## Run locally

This is a zero-build static site. Serve the repository with any HTTP server:

```sh
npx serve .
```

Opening `index.html` directly also works.

## Test

```sh
npm run check
npm run test:e2e
```

The end-to-end test expects Microsoft Edge at its standard Windows installation
path. Set `EDGE_PATH` to use another Chromium-based Edge executable.

## Deployment

The site is designed for GitHub Pages and can be served directly from the repository root. Player progress is saved in the browser under `httpscape-progress-v2`; no player data leaves the device.
