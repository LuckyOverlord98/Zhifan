# Development Lessons Compressed

Updated: 2026-06-28
Project: `outputs/welding-distributor-site`
Purpose: compact handoff notes for preventing repeated blockers and keeping future output faster.

## Current Baseline

- Site stack: React 19 + Vite 6 frontend, Node.js + Express backend, MongoDB with bundled JSON seed fallback.
- Local standard ports: Vite `5173`, Node API `3000`.
- Deployment owner: Confucius/Kuhn subagent handles GitHub push, ECS build/deploy, and online smoke tests when explicitly asked.
- Main local quality gate: `npm.cmd run preflight`.
- Latest known local commit from the last UI/layout fix: `21d8e6e Refine product center filters and layout`.

## High-Frequency Blockers And Fixes

### 1. White Screen From Runtime Errors

Common symptoms:
- `Uncaught ReferenceError: scrolled is not defined`
- blank React page after a small header or hook change.

Fix pattern:
- Check browser console first, not CSS first.
- Verify hook/state variables are declared in the component scope where used.
- Run `npm.cmd run preflight`.
- Do one rendered smoke check for the edited route.

### 2. JS/CSS MIME Or Static Asset Routing

Common symptoms:
- `Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/css".`
- `/styles.css` returns `text/html`.
- static Q&A pages lose CSS.

Fix pattern:
- Verify Nginx/Express static root and SPA fallback are not serving `index.html` for CSS/JS.
- After deploy, always check:

```powershell
curl -I http://zhifanwelding.com.cn/styles.css
curl http://zhifanwelding.com.cn/api/health
```

Expected: `/styles.css` is `text/css`; API health returns JSON.

### 3. Encoding And Chinese Mojibake

Common symptoms:
- Chinese becomes repeated question marks or mojibake.
- `Φ` becomes `?`.
- PowerShell heredoc or inline scripts corrupt Chinese.

Fix pattern:
- Prefer PowerShell 7.
- Do not write Chinese-heavy files through fragile shell heredocs.
- For scripts, write UTF-8 files inside the workspace and run them, or use escaped Unicode when needed.
- Scan changed files for raw repeated-question-mark garble.
- Keep Chinese files UTF-8 without BOM unless a tool specifically requires otherwise.

### 4. Old Services Or Wrong Ports

Common symptoms:
- browser shows stale UI after code changed.
- `127.0.0.1:5173` refuses connection.
- tests hit an old Node/Vite process.

Fix pattern:
- Before testing:

```powershell
Get-NetTCPConnection -LocalPort 3000,5173 -State Listen -ErrorAction SilentlyContinue
```

- Restart services before and after major UI/API changes.
- Stop temporary dev/API sessions after smoke tests.

### 5. Sandbox And Permission Failures

Common symptoms:
- Vite/esbuild cache blocked.
- `git add` / `git commit` cannot write index or refs.
- network/SSH/ECS commands fail inside sandbox.

Fix pattern:
- Use escalation up front for:
  - `npm.cmd run preflight`
  - local server HTTP smoke
  - git index/ref writes
  - SSH/ECS/network operations
- If a path such as `C:\tmp` is blocked, switch to the workspace temp area. Do not retry the same blocked path repeatedly.

### 6. Product Data Classification Errors

Common symptoms:
- flux-cored wire incorrectly appears under carbon steel electrodes.
- stainless steel Dongfeng models appear in the wrong category.
- dimensions and deposited-metal data mix together.

Fix pattern:
- Keep the 8 product categories fixed.
- Classify by PDF chapter/product type first, model prefix second.
- If ambiguous, create a manual review table instead of guessing.
- Field separation rules:
  - `dimensions`: diameter/spec only, use `Φ`.
  - `composition`: chemical composition only.
  - `depositedMetal`: mechanical properties only.
  - `certifications`: certification tile only when source data has certifications.

### 7. Search Dropdown And Tile Overflow

Common symptoms:
- search results are clipped by a tile.
- dropdown does not align under the search bar.
- mobile image/background covers results.

Fix pattern:
- Search dropdown must have a high z-index and escape card clipping.
- Results should be capped by viewport, normally 5-7 visible, max 20 with internal scroll.
- Show `搜索中` while querying; show `暂无匹配型号` only after no results.
- Search must cover model, product name, manufacturer, category, `standard`, and `standards`.

### 8. Pagination Mistakes

Common symptoms:
- all page buttons render at once.
- no first/last navigation.
- pagination appears but page switching is not limited.

Fix pattern:
- Product list page size: 15.
- Page-number buttons: max 5.
- Include `首页`, `上一页`, current window, `下一页`, `尾页`.

### 9. Visual Changes Without Rendered Validation

Common symptoms:
- code says fixed, but desktop/mobile is still visually broken.
- certificate images show only the top half.
- map-card buttons overflow.

Fix pattern:
- For layout changes, validate desktop plus one mobile viewport when practical.
- For certificates, use `object-fit: contain`; never crop authorization documents.
- For map/contact cards, allow wrapping and constrain button width.

## Verification Ladder

Use the smallest check that proves the current change.

1. Source checks:

```powershell
git status --short
rg -n "\?\?\?" src public styles.css
```

2. Build gate:

```powershell
npm.cmd run preflight
```

3. Local HTTP/API smoke when UI/API changed:

```powershell
npm.cmd run dev -- --host 127.0.0.1
npm.cmd run server
curl http://127.0.0.1:3000/api/health
curl "http://127.0.0.1:3000/api/products?search=J507&limit=8"
```

4. Browser smoke when visual state matters:
- home not blank.
- no framework overlay.
- console has no relevant app errors.
- target interaction works.

5. Online smoke after deployment:

```powershell
curl -I http://zhifanwelding.com.cn/
curl -I http://zhifanwelding.com.cn/styles.css
curl http://zhifanwelding.com.cn/api/health
curl "http://zhifanwelding.com.cn/api/products?search=J507&limit=8"
```

## Output Performance Rules

To keep future turns faster:

- Lead with the concrete result, not a long diary.
- For implementation turns, use this order: changed, verified, commit hash, next risk.
- Do not repeat full build logs; quote only exit status and key failing lines.
- When handing off to Confucius, state exactly which local tests already ran so it does not repeat them.
- Keep final answers under 8 bullets unless the user asks for a full report.
- When blocked, report the exact blocker and the next smallest useful action.
- Prefer one durable markdown note over long chat summaries.

## Confucius Handoff Template

Use when the user asks to push/deploy:

```text
Please push current local commit and deploy to ECS.

Already completed locally:
- commit: <hash and message>
- preflight: passed / not run, reason
- local HTTP smoke: passed / not run, reason
- browser smoke: passed / failed / skipped, reason

Do not repeat local build unless remote state requires it.
Please do:
- git push
- ECS pull/build/restart
- online smoke: /, /styles.css MIME, /api/health, product search, one detail route
- report commit hash, deploy commands summary, smoke results
```

## Pre-Compression Handoff Template

Before context compression, write:

```markdown
## Current State
- Directory:
- Branch/HEAD:
- Last user request:
- Completed:
- Not completed:

## Recent Changes
- Files:
- Key logic:
- Data source:

## Verification Evidence
- Commands:
- Results:
- Browser/API checks:

## Known Risks
- Encoding:
- MIME/deploy:
- Data validation:
- Responsive:
- Search/API:

## Next Steps
1.
2.
3.
```

## Current Project Risks To Keep Watching

- `progress.md` has shown mojibake in terminal output; do not overwrite it casually.
- Product import accuracy remains source-sensitive; prefer 2025 manuals first, then 2024, then older PDFs.
- Large animation experiments caused rollback before; use subtle CSS/GSAP only after a preview is accepted.
- Online MIME verification is mandatory after every ECS deploy.
- Search/UI bugs often require both source checks and rendered/browser checks.

