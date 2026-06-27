# Resource Loading And CodeGraph Quick Map

## CodeGraph Commands

Run from `outputs/welding-distributor-site` with PowerShell 7:

```powershell
& 'C:\Users\Ning Sun\AppData\Local\codegraph\current\bin\codegraph.cmd' status
& 'C:\Users\Ning Sun\AppData\Local\codegraph\current\bin\codegraph.cmd' files
& 'C:\Users\Ning Sun\AppData\Local\codegraph\current\bin\codegraph.cmd' explore OptimizedImage
& 'C:\Users\Ning Sun\AppData\Local\codegraph\current\bin\codegraph.cmd' explore optimize assets
& 'C:\Users\Ning Sun\AppData\Local\codegraph\current\bin\codegraph.cmd' explore static cache
```

## Resource Pipeline

`public/assets` stores source images. `scripts/optimize-assets.py` converts PNG/JPG/JPEG into WebP variants under `public/assets/optimized` and writes `src/data/imageManifest.js`. `src/components/OptimizedImage.jsx` reads that manifest and renders responsive `<picture>` markup for React pages.

CSS backgrounds do not use `OptimizedImage`, so `styles.css` must point directly to `/assets/optimized/...webp`. After editing `styles.css`, run `npm.cmd run prebuild` to sync `public/styles.css` for static article pages.

Static Q&A pages are generated HTML. `scripts/update-static-article-seo.py` rewrites article metadata and currently rewrites `knowledge-operation.png` into responsive `<picture>` markup.

## Fast Rules

- Use local assets only; avoid overseas CDNs/fonts/scripts.
- React images: always use `OptimizedImage` unless the image is a tiny icon.
- CSS tile backgrounds: default to 768px WebP; only wide hero/bands use 1280px.
- Do not reference original multi-MB PNG/JPG files from CSS.
- Run `scripts/optimize-assets.py` after adding any image.
- Run `npm.cmd run preflight` before commit/deploy.
- Keep `.codegraph/codegraph.db` uncommitted; commit only `.codegraph/.gitignore` if needed.

## Current Performance Watchlist

- Large original source files exist under `public/assets/sections` and `public/assets/certificates`; these are acceptable only as fallbacks/source material.
- `dist/assets/hero-welding.png` is about 2MB after build. Audit whether it is still directly requested, then prefer optimized WebP fallback or remove the stale direct route.
- Certificate images are large originals but modal/detail viewing can tolerate lazy loading; do not preload them.
- Product card backgrounds are already small WebP files around 22-37KB.
- Express static serving already applies one-year immutable cache to image/CSS/JS extensions and one-hour cache to non-hashed `styles.css`.