const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const zh = {
  paginationLabel: "\u4ea7\u54c1\u5217\u8868\u5206\u9875",
  prev: "\u4e0a\u4e00\u9875",
  next: "\u4e0b\u4e00\u9875",
  qaTitle: "J507 \u710a\u6761\u9002\u5408\u710a\u4ec0\u4e48\u94a2\u6750",
};

function log(message) {
  console.log("[preflight] " + message);
}

function fail(message) {
  console.error("[preflight] FAIL: " + message);
  process.exit(1);
}

function run(command, args, options = {}) {
  log(command + " " + args.join(" "));
  if (process.platform === "win32" && /\.cmd$/i.test(command)) {
    execFileSync("cmd.exe", ["/d", "/s", "/c", command, ...args], {
      cwd: root,
      stdio: "inherit",
      ...options,
    });
    return;
  }
  execFileSync(command, args, {
    cwd: root,
    stdio: "inherit",
    ...options,
  });
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function assertFile(relativePath, description) {
  if (!exists(relativePath)) fail(description + " missing: " + relativePath);
}

function assertContains(relativePath, needle, description) {
  const content = read(relativePath);
  if (!content.includes(needle)) fail(description + " not found in " + relativePath);
}

function assertNoText(relativePath, pattern, description) {
  const content = read(relativePath);
  if (pattern.test(content)) fail(description + " found in " + relativePath);
}

function collectFiles(dir, predicate, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(full, predicate, result);
    else if (predicate(full)) result.push(full);
  }
  return result;
}

run("node", ["--check", "server/index.js"]);
run("node", ["--check", "scripts/sync-static-css.cjs"]);
run(npm, ["run", "build"]);

assertFile("public/styles.css", "static article stylesheet");
assertFile("dist/styles.css", "built static article stylesheet");
assertContains("dist/styles.css", ".qa-answer-card", "QA article styling");
assertContains("dist/styles.css", ".pagination", "product pagination styling");
assertContains("styles.css", ".product-search-results-floating", "floating product search results");
assertContains("styles.css", ".certificate-modal", "certificate preview modal styling");
assertContains("styles.css", "object-fit: contain", "certificate complete image fitting");
assertContains("src/components/ProductSearch.jsx", "getVisibleLimit", "viewport-aware search result limit");
assertContains("src/components/ProductSearch.jsx", "item.standard", "standard number shown in product search results");
assertContains("src/data/productCatalog.js", "aluminum-wires", "eighth product category");
assertContains("src/App.jsx", "product-filter-grid", "primary category and manufacturer filters");
assertContains("src/App.jsx", "formatKnowledgeCategoryTitle", "numbered knowledge category labels");
assertContains("src/App.jsx", "certificate-preview-trigger", "clickable certificate preview");
assertContains("server/index.js", "productSearchTerms", "like-term product search across standards");

assertContains("src/App.jsx", `aria-label="${zh.paginationLabel}"`, "product pagination navigation");
assertContains("src/App.jsx", zh.prev, "pagination previous button");
assertContains("src/App.jsx", zh.next, "pagination next button");
assertContains("server/index.js", "path.basename(filePath) === \"styles.css\"", "short cache rule for root styles.css");
assertContains("server/index.js", "max-age=31536000, immutable", "long cache rule for hashed/static assets");

assertNoText("styles.css", /image-set\(|__VITE_PUBLIC_ASSET__/, "unresolved Vite asset placeholder or CSS image-set warning source");
assertNoText("dist/styles.css", /image-set\(|__VITE_PUBLIC_ASSET__/, "unresolved Vite asset placeholder or CSS image-set warning source");

const articleFiles = collectFiles(path.join(root, "public", "articles"), (file) => file.endsWith(".html"));
if (articleFiles.length < 80) fail("expected at least 80 article pages, found " + articleFiles.length);

for (const file of articleFiles) {
  const relative = path.relative(root, file);
  const content = fs.readFileSync(file, "utf8");
  if (!content.includes("styles.css")) fail("article page does not reference styles.css: " + relative);
  if (/[\uFFFD]{1,}|\?\?\?/.test(content)) fail("possible UTF-8 corruption marker in " + relative);
}

assertContains("public/articles/qa/qa-12-j507-electrode.html", "qa-answer-card", "QA article card markup");
assertContains("public/articles/qa/qa-12-j507-electrode.html", zh.qaTitle, "QA article UTF-8 content");

run("git", ["diff", "--check"]);

log("All local checks passed. For ECS, still verify /styles.css MIME and /api/health after deploy.");
