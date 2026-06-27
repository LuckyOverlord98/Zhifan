# Resource Loading Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make site image, CSS, and static asset loading consistently fast while keeping the industrial visual design intact.

**Architecture:** Treat `public/assets` as the source asset store, `scripts/optimize-assets.py` as the canonical image pipeline, `src/data/imageManifest.js` as the runtime manifest, and `OptimizedImage` as the only React image delivery component. CSS background images and static article HTML must use optimized WebP/AVIF paths directly because they do not pass through React.

**Tech Stack:** React 19, Vite 6, Express static serving, Python Pillow image optimization, CodeGraph for code navigation, PowerShell 7 for local commands.

---

## CodeGraph Map For This Work

Use these commands from the project root:

```powershell
& 'C:\Users\Ning Sun\AppData\Local\codegraph\current\bin\codegraph.cmd' status
& 'C:\Users\Ning Sun\AppData\Local\codegraph\current\bin\codegraph.cmd' files
& 'C:\Users\Ning Sun\AppData\Local\codegraph\current\bin\codegraph.cmd' explore OptimizedImage
& 'C:\Users\Ning Sun\AppData\Local\codegraph\current\bin\codegraph.cmd' explore optimize assets
& 'C:\Users\Ning Sun\AppData\Local\codegraph\current\bin\codegraph.cmd' explore static cache
& 'C:\Users\Ning Sun\AppData\Local\codegraph\current\bin\codegraph.cmd' node vite.config.js
```

Current CodeGraph index after init: 19 files, 313 nodes, 703 edges. The resource-loading blast radius is:

- `scripts/optimize-assets.py`: source image to WebP variants and manifest.
- `src/data/imageManifest.js`: generated manifest consumed by React.
- `src/components/OptimizedImage.jsx`: React `<picture>` wrapper.
- `src/App.jsx`: main consumers of `OptimizedImage`, CSS variable product-card backgrounds, and external map link.
- `scripts/update-static-article-seo.py`: static article `<picture>` rewrite for Q&A pages.
- `styles.css` and `public/styles.css`: CSS background images and copied static CSS.
- `server/index.js`: cache headers for `dist` static resources.

## Current Findings

- React image delivery is already structured: `OptimizedImage` reads `imageManifest.js`, emits WebP `srcset`, width/height, lazy loading by default, and async decoding for non-eager images.
- CSS backgrounds bypass `OptimizedImage`; they currently point to optimized WebP paths in most key areas.
- Static Q&A pages use generated `<picture>` elements for `knowledge-operation.png`, but the generator only knows this one image pattern.
- Original source images in `public/assets` are often large, for example warehouse real images around 3.7-5MB and many section PNGs around 1.7-2.8MB. This is acceptable as source material only if runtime never directly requests them on normal pages.
- `dist/assets/hero-welding.png` is about 2MB after build. Verify whether any runtime path still references it directly, then either remove the old source reference or replace it with optimized WebP/AVIF-only delivery.
- Server static cache is already good for hashed assets: images, CSS, and JS get `max-age=31536000, immutable`; non-hashed `styles.css` gets one hour.
- API list caching exists in `server/index.js` with 2-minute server memory TTL and browser cache of 30-120 seconds.
- No overseas runtime dependency was found in normal asset loading. The only external user-facing URL found is the Amap deep link in contact.

### Task 1: Add An Asset Audit Script

**Files:**
- Create: `scripts/audit-assets.cjs`
- Modify: `package.json`
- Test: command output from `npm.cmd run audit:assets`

- [ ] **Step 1: Create the audit script**

Create `scripts/audit-assets.cjs`:

```javascript
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const assetRoot = path.join(root, "public", "assets");
const sourceLimit = 1024 * 1024;
const optimizedLimit = 220 * 1024;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

function rel(file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

const files = walk(assetRoot).map((file) => ({ file, size: fs.statSync(file).size }));
const largeSources = files
  .filter((item) => !item.file.includes(`${path.sep}optimized${path.sep}`))
  .filter((item) => item.size > sourceLimit)
  .sort((a, b) => b.size - a.size);
const largeOptimized = files
  .filter((item) => item.file.includes(`${path.sep}optimized${path.sep}`))
  .filter((item) => item.size > optimizedLimit)
  .sort((a, b) => b.size - a.size);

console.log(JSON.stringify({
  sourceOver1MB: largeSources.map((item) => ({ path: rel(item.file), kb: Math.round(item.size / 102.4) / 10 })),
  optimizedOver220KB: largeOptimized.map((item) => ({ path: rel(item.file), kb: Math.round(item.size / 102.4) / 10 }))
}, null, 2));

if (largeOptimized.length > 0) process.exitCode = 1;
```

- [ ] **Step 2: Wire the script**

Add this script to `package.json`:

```json
"audit:assets": "node scripts/audit-assets.cjs"
```

- [ ] **Step 3: Run the audit**

Run:

```powershell
npm.cmd run audit:assets
```

Expected: JSON report. If optimized images above 220KB exist, the script exits non-zero so the issue is visible before push.

- [ ] **Step 4: Commit**

```powershell
git add scripts/audit-assets.cjs package.json
git commit -m "Add asset size audit"
```

### Task 2: Make CSS Backgrounds Responsive By Breakpoint

**Files:**
- Modify: `styles.css`
- Modify: `public/styles.css`
- Test: `npm.cmd run preflight`

- [ ] **Step 1: Replace large default CSS background URLs with 768px variants**

In `styles.css`, change section background defaults that currently use `-1280.webp` to use `-768.webp` where the rendered area is a tile/card under 720px wide. Keep 1280px for hero-wide background bands.

Example pattern:

```css
.delivery-card.steel {
  background-image: url("/assets/optimized/sections__delivery-steel-structure-768.webp");
}
```

- [ ] **Step 2: Add desktop override for wide viewports**

Add a grouped override:

```css
@media (min-width: 1180px) {
  .delivery-card.steel { background-image: url("/assets/optimized/sections__delivery-steel-structure-1280.webp"); }
  .delivery-card.shipyard { background-image: url("/assets/optimized/sections__delivery-shipyard-1280.webp"); }
  .delivery-card.auto { background-image: url("/assets/optimized/sections__delivery-auto-factory-1280.webp"); }
  .delivery-card.machinery { background-image: url("/assets/optimized/sections__delivery-machinery-1280.webp"); }
}
```

- [ ] **Step 3: Sync static CSS**

Run:

```powershell
npm.cmd run prebuild
```

Expected: `Synced styles.css for static article pages.`

- [ ] **Step 4: Verify**

Run:

```powershell
npm.cmd run preflight
```

Expected: all local checks pass.

- [ ] **Step 5: Commit**

```powershell
git add styles.css public/styles.css
git commit -m "Tune responsive CSS background assets"
```

### Task 3: Reduce Original Image Fallback Risk

**Files:**
- Modify: `src/components/OptimizedImage.jsx`
- Modify: `scripts/optimize-assets.py`
- Test: `npm.cmd run preflight`

- [ ] **Step 1: Make WebP fallback first for optimized images**

Change `OptimizedImage` so the `<img src>` uses the largest generated WebP variant by default, not the original PNG/JPG fallback. Keep the original path available only for unsupported situations through `<picture>` behavior if needed.

Implementation:

```jsx
const fallbackVariant = image.variants[image.variants.length - 1];
const fallbackSrc = fallbackVariant?.src || image.fallback || src;
```

Then use:

```jsx
src={fallbackSrc}
```

- [ ] **Step 2: Add eager/fetch priority support for hero image only**

Keep default lazy. Where the real first-screen hero image is rendered in `src/App.jsx`, pass:

```jsx
<OptimizedImage src="/assets/hero-welding.png" alt="焊材仓储与工业焊接场景" loading="eager" fetchPriority="high" sizes="(max-width: 760px) 100vw, 44vw" />
```

If this hero is not visibly first-paint-critical because CSS background owns the hero, do not mark it eager.

- [ ] **Step 3: Verify**

Run:

```powershell
npm.cmd run preflight
```

Expected: all local checks pass.

- [ ] **Step 4: Commit**

```powershell
git add src/components/OptimizedImage.jsx src/App.jsx
git commit -m "Prefer optimized image fallbacks"
```

### Task 4: Extend Static Article Image Rewriter

**Files:**
- Modify: `scripts/update-static-article-seo.py`
- Test: run script then `npm.cmd run preflight`

- [ ] **Step 1: Replace hard-coded knowledge-only logic with manifest lookup**

Update `picture_for` so it parses `src/data/imageManifest.js` and looks up any `/assets/...` key, not just `knowledge-operation.png`. Generate source paths with the correct `../` or `../../` prefix based on article depth.

- [ ] **Step 2: Run static article rewrite**

Run:

```powershell
& 'C:\Users\Ning Sun\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts\update-static-article-seo.py
```

Expected: printed `{'updated': <count>}`.

- [ ] **Step 3: Verify static articles still render**

Run:

```powershell
npm.cmd run preflight
```

Expected: all local checks pass.

- [ ] **Step 4: Commit**

```powershell
git add scripts/update-static-article-seo.py public/articles
git commit -m "Generalize static article responsive images"
```

### Task 5: Add Preload Discipline For Critical Resources

**Files:**
- Modify: `index.html`
- Test: `npm.cmd run preflight`

- [ ] **Step 1: Preload only the true first-screen background**

If the first screen uses CSS `hero-building-zhifan-1280.webp`, add one preload in `index.html`:

```html
<link rel="preload" as="image" href="/assets/optimized/sections__hero-building-zhifan-1280.webp" imagesrcset="/assets/optimized/sections__hero-building-zhifan-768.webp 768w, /assets/optimized/sections__hero-building-zhifan-1280.webp 1280w" imagesizes="100vw" />
```

Do not preload carousel certificates, below-fold delivery images, Q&A backgrounds, or product tile images.

- [ ] **Step 2: Verify**

Run:

```powershell
npm.cmd run preflight
```

Expected: all local checks pass.

- [ ] **Step 3: Commit**

```powershell
git add index.html
git commit -m "Preload critical hero asset"
```

## Resource Management Logic

1. Put original images in `public/assets/<domain>/name.png|jpg` only as source material.
2. Run `scripts/optimize-assets.py` after every image add, replace, or crop.
3. Reference images in React only through `<OptimizedImage src="/assets/..." />` unless the asset is already a tiny icon.
4. Reference CSS backgrounds through `/assets/optimized/...webp`; use 768px by default for tiles and 1280px for full-width bands.
5. Static articles must use generated `<picture>` markup from `scripts/update-static-article-seo.py`.
6. Avoid external runtime assets. Amap links are okay as outbound links; no overseas fonts, maps, CDNs, analytics, or icon sprites.
7. Keep original source images out of normal request paths. If a browser can request a 2MB PNG on first paint, treat it as a bug.
8. Use long cache only for hashed or content-stable assets. Keep non-hashed root `styles.css` at short cache or make it hashed before increasing TTL.
9. Run `npm.cmd run preflight` before deploy and `npm.cmd run audit:assets` once Task 1 exists.
10. For every future visual asset change, local commit after successful optimization and verification.

## Self-Review

- Spec coverage: covers CodeGraph mapping, current findings, CSS backgrounds, React images, static articles, cache headers, and future resource workflow.
- Placeholder scan: no TBD/TODO placeholders.
- Type consistency: file paths and script names match current repo structure.