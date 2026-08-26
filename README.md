# HTTPscape

An escape room hidden inside an evolving local-news website. It offers no room
names, progress meter, instructions, or hints; ordinary page content and controls
become the puzzle.

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

The site is designed for GitHub Pages and can be served directly from the
repository root. Progress lasts only for the current page session; reloading or
using the reset control starts a new run.
