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
assertContains("styles.css", "Product home cards must always expose all 8 categories", "home product categories always visible");
assertContains("styles.css", ".certificate-modal", "certificate preview modal styling");
assertContains("styles.css", "object-fit: contain", "certificate complete image fitting");
assertContains("src/components/ProductSearch.jsx", "getVisibleLimit", "viewport-aware search result limit");
assertContains("src/components/ProductSearch.jsx", "createPortal", "body-level product search dropdown portal");
assertContains("src/components/ProductSearch.jsx", "item.standard", "standard number shown in product search results");
assertContains("scripts/import-qa-articles.py", "og:title", "QA article Open Graph title generation");
assertContains("public/articles/qa/qa-12-j507-electrode.html", "article-photo-video", "QA article video generation output");
assertContains("scripts/apply-jinqiao-missing-docx.py", "equipment-accessories", "equipment category slug matches frontend catalog");
assertContains("src/data/productCatalog.js", "aluminum-wires", "eighth product category");
assertContains("src/App.jsx", "product-filter-grid", "primary category and manufacturer filters");
assertContains("src/App.jsx", "formatKnowledgeCategoryTitle", "numbered knowledge category labels");
assertContains("src/App.jsx", "certificate-preview-trigger", "clickable certificate preview");
assertContains("server/index.js", "productSearchTerms", "like-term product search across standards");
assertContains("src/App.jsx", "certification-card", "product certification detail tile");
assertContains("server/index.js", "certifications: [{ type: String, trim: true }]", "product certification schema field");

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
assertContains("public/articles/qa/qa-12-j507-electrode.html", "生成时间：2026-06-26", "QA article generated date in hero");
assertContains("public/articles/qa/qa-12-j507-electrode.html", "property=\"og:title\"", "QA article Open Graph title markup");
assertContains("public/articles/qa/qa-12-j507-electrode.html", "article-photo-video", "QA article video markup");
assertContains("public/articles/qa/qa-12-j507-electrode.html", "preload=\"metadata\"", "QA article video metadata preload");
assertContains("public/articles/qa/qa-12-j507-electrode.html", "联系业务找型号", "QA article contact CTA");


run("node", ["--check", "scripts/seed-products.js"]);
assertContains("scripts/seed-products.js", "zhifan_welding", "seed MongoDB default database");
assertContains("scripts/seed-products.js", "manufacturer: { $in: manufacturers }", "stale multi-manufacturer product cleanup");
assertContains("scripts/import-dongfeng-products.py", "pdfplumber", "Dongfeng PDF extraction");
assertContains("scripts/import-dongfeng-products.py", "PRODUCT_ROW_RE", "Dongfeng product row boundary detection");

const productData = JSON.parse(read("data/jinqiao-products.json").replace(/^\uFEFF/, ""));
const genericJinqiaoContent = productData.filter((product) => product.manufacturer === "金桥" && (
  (product.introduction || "").includes("详情页整理执行标准") ||
  (product.applications || []).join("").includes("按母材、强度等级")
));
if (genericJinqiaoContent.length !== 0) fail("expected all Jinqiao products to have specific intro/application content, found generic placeholders: " + genericJinqiaoContent.map((product) => product.model).join(", "));
function requireJinqiaoManualContent(model, introNeedle, applicationNeedle) {
  const product = productData.find((item) => item.manufacturer === "金桥" && item.model === model);
  if (!product) fail("missing Jinqiao product " + model);
  if (!product.introduction || !product.introduction.includes(introNeedle)) fail("Jinqiao product " + model + " missing manual introduction content");
  if (!(product.applications || []).join("").includes(applicationNeedle)) fail("Jinqiao product " + model + " missing manual application content");
}
requireJinqiaoManualContent("J422", "钛钙型药皮", "Q235");
requireJinqiaoManualContent("J507", "低氢钠型药皮", "受压、动载");
requireJinqiaoManualContent("JQ.CE71T-1", "氧化钛型气体保护药芯焊丝", "490MPa");
requireJinqiaoManualContent("JQ.TH500-NQ-II", "耐候钢用气保护实心焊丝", "500MPa");
requireJinqiaoManualContent("JQ.H08MnMoTiB(H08C)", "高强钢埋弧焊丝", "X70");
requireJinqiaoManualContent("JQ.H08MnNiTiB(H08D)", "非合金细晶粒钢埋弧焊丝", "X65");
requireJinqiaoManualContent("JQ.H08MnSiCuCrNi-II", "耐候钢用气保护实心焊丝", "440MPa");
requireJinqiaoManualContent("JQ.MG70S-3", "低合金钢用气体保护实心焊丝", "500MPa");
requireJinqiaoManualContent("JQ.MG50-G-1", "碳钢用气体保护实心焊丝", "500MPa");
const jinqiaoCe71t1 = productData.find((product) => product.model === "JQ.CE71T-1");
if (!jinqiaoCe71t1 || !Array.isArray(jinqiaoCe71t1.certifications) || !jinqiaoCe71t1.certifications.includes("CCS") || !jinqiaoCe71t1.certifications.includes("TüV")) fail("JQ.CE71T-1 missing certification data");
if (!jinqiaoCe71t1.composition?.some((row) => row.name === "C" && row.value.includes("≤0.18"))) fail("JQ.CE71T-1 missing GB/T composition reference");
if (!jinqiaoCe71t1.depositedMetal?.some((row) => row.name.includes("抗拉强度") && row.value.includes("490-670"))) fail("JQ.CE71T-1 missing mechanical performance reference");
const dongfengProducts = productData.filter((product) => product.manufacturer === "上海东风");
if (dongfengProducts.length < 200) fail("expected at least 200 Dongfeng products, found " + dongfengProducts.length);

function requireProduct(model, categorySlug) {
  const product = dongfengProducts.find((item) => item.model === model);
  if (!product) fail("missing Dongfeng product " + model);
  if (product.categorySlug !== categorySlug) fail("Dongfeng product " + model + " category expected " + categorySlug + ", got " + product.categorySlug);
  if (!product.standard || !product.standards || product.standards.length === 0) fail("Dongfeng product " + model + " missing standards");
  if (!product.dimensions || product.dimensions.some((item) => /\?/.test(item.value) || !item.value.includes("Φ"))) fail("Dongfeng product " + model + " has invalid dimensions");
  return product;
}

for (const [model, category] of [
  ["SH.J422", "carbon-steel-electrodes"],
  ["SH.J507", "carbon-steel-electrodes"],
  ["SH.Y71T-1", "flux-cored-wires"],
  ["SH.Y81K2", "special-materials"],
  ["SH.S50-6", "solid-wires"],
  ["SH.M08MnA", "submerged-arc"],
  ["SH.S308L", "stainless-materials"],
  ["SH.A002", "stainless-materials"],
  ["SH.A302", "stainless-materials"],
  ["SH.E2209", "stainless-materials"],
  ["SH.Y308L", "stainless-materials"],
  ["SH.Y409Ti", "stainless-materials"],
  ["SH.Y439Ti", "stainless-materials"],
]) requireProduct(model, category);

const nbDongfeng = dongfengProducts.filter((product) => (product.standards || []).some((standard) => standard.startsWith("NB/T")));
if (nbDongfeng.some((product) => !(product.standards || []).includes("NB/T 47018 承压产品"))) fail("Dongfeng NB/T products missing NB/T 47018 note");
if (dongfengProducts.some((product) => (product.dimensions || []).some((item) => item.value.includes("?")))) fail("Dongfeng dimensions contain ? instead of Φ");

run("git", ["diff", "--check"]);

log("All local checks passed. For ECS, still verify /styles.css MIME and /api/health after deploy.");
