import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import { products as productCategories, categoryMeta } from "../src/data/productCatalog.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3000);
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/zhifan_welding";

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    company: { type: String, trim: true, maxlength: 120 },
    customerLocation: { type: String, trim: true, maxlength: 40 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ["new", "contacted", "closed"], default: "new" },
    source: { type: String, default: "website" },
    ip: { type: String, trim: true },
    userAgent: { type: String, trim: true }
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    manufacturer: { type: String, required: true, index: true, trim: true },
    categorySlug: { type: String, required: true, index: true, trim: true },
    categoryName: { type: String, required: true, trim: true },
    model: { type: String, required: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    standard: { type: String, trim: true },
    standards: [{ type: String, trim: true }],
    summary: { type: String, trim: true },
    introduction: { type: String, trim: true },
    applications: [{ type: String, trim: true }],
    composition: [{ name: String, value: String }],
    depositedMetal: [{ name: String, value: String }],
    dimensions: [{ name: String, value: String }],
    certifications: [{ type: String, trim: true }],
    inStock: { type: Boolean, default: false, index: true },
    stockSource: { type: String, trim: true },
    notes: { type: String, trim: true },
    source: { type: String, default: "Jinqiao 2024 product manual" },
    clickCount: { type: Number, default: 0, index: true },
    lastClickedAt: { type: Date }
  },
  { timestamps: true }
);

productSchema.index({ model: "text", name: "text", summary: "text", categoryName: "text", manufacturer: "text", standard: "text", standards: "text" });

inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ customerLocation: 1, createdAt: -1 });

productSchema.index({ name: 1 });
productSchema.index({ summary: 1 });
productSchema.index({ categorySlug: 1, manufacturer: 1, model: 1 });
productSchema.index({ categorySlug: 1, manufacturer: 1, clickCount: -1, model: 1 });

const Inquiry = mongoose.model("Inquiry", inquirySchema);
const Product = mongoose.model("Product", productSchema);

const seedProductsPath = path.resolve(__dirname, "../data/jinqiao-products.json");
let seedProductsCache = null;
let indexHtmlCache = null;
const apiCache = new Map();
const CACHE_TTL_MS = 2 * 60 * 1000;
const siteOrigin = (process.env.SITE_ORIGIN || "https://zhifanwelding.com.cn").replace(/\/$/, "");
const companyDescription = "宁波志凡焊材有限公司位于宁波市鄞州区富宁路119号，专业批发焊材近二十八年，系金桥、大西洋、东风、天泰、孚尔姆、运河、亚泰等品牌全国一级经销商。年供货量数万吨，常备库存数千吨，全系列覆盖实芯气保焊丝、药芯气保焊丝、埋弧焊丝焊剂、不锈钢及铝焊材，并配套焊割配件与五金工具。主营服务江浙沪及周边船厂、机械厂、钢结构、压力容器、电力工程及石化项目，提供一站式配货、原厂质保书、项目跟单及专属保供服务，现货充足，宁波48小时、浙江96小时高效送达。";
const baseKeywords = [
  "宁波焊材批发", "舟山焊材供应", "浙江焊材供应商", "绍兴焊材", "新昌焊材", "江浙沪焊材供应",
  "船厂焊材", "钢结构焊材", "压力容器焊材", "电力工程焊材", "石化项目焊材",
  "焊材现货供应", "焊材质量证明书", "焊材厂家授权经销商"
];

function getCachedJson(key) {
  const item = apiCache.get(key);
  if (!item || item.expiresAt < Date.now()) {
    apiCache.delete(key);
    return null;
  }
  return item.value;
}

function setCachedJson(key, value, ttl = CACHE_TTL_MS) {
  apiCache.set(key, { value, expiresAt: Date.now() + ttl });
}

function sendCachedJson(res, payload, browserSeconds = 60) {
  res.set("Cache-Control", "public, max-age=" + browserSeconds + ", stale-while-revalidate=300");
  res.json(payload);
}

function loadSeedProducts() {
  if (!seedProductsCache) {
    const raw = fs.readFileSync(seedProductsPath, "utf8").replace(/^\uFEFF/, "");
    seedProductsCache = JSON.parse(raw);
  }
  return seedProductsCache;
}

const productSearchFields = ["model", "name", "summary", "standard", "standards", "categoryName", "manufacturer"];
const SEARCH_CACHE_VERSION = 2;

function productSearchTerms(value) {
  const terms = String(value || "")
    .trim()
    .normalize("NFKC")
    .split(/[\s,，,、；;]+/)
    .map((term) => term.trim())
    .filter(Boolean)
    .slice(0, 6);
  return [...new Set(terms)];
}

function compactSearchText(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function looseTermRegex(term) {
  const compact = compactSearchText(term);
  if (!compact) return null;
  return new RegExp(compact.split("").map(escapeRegex).join("[\\s./\\\\\\-_()（）]*"), "i");
}

function buildProductSearchQuery(search) {
  const terms = productSearchTerms(search);
  if (terms.length === 0) return null;
  return {
    $and: terms.map((term) => {
      const exact = new RegExp(escapeRegex(term), "i");
      const loose = looseTermRegex(term);
      const patterns = loose ? [exact, loose] : [exact];
      return {
        $or: productSearchFields.flatMap((field) => patterns.map((pattern) => ({ [field]: pattern })))
      };
    })
  };
}

function productSearchHaystack(product) {
  return [
    product.model,
    product.name,
    product.summary,
    product.standard,
    ...(product.standards || []),
    product.categoryName,
    product.manufacturer
  ].join(" ");
}

function productMatches(product, filters) {
  if (filters.category && product.categorySlug !== filters.category) return false;
  if (filters.manufacturer && product.manufacturer !== filters.manufacturer) return false;
  const terms = productSearchTerms(filters.search);
  if (terms.length > 0) {
    const haystack = productSearchHaystack(product).normalize("NFKC").toLowerCase();
    const compactHaystack = compactSearchText(haystack);
    if (!terms.every((term) => haystack.includes(term.toLowerCase()) || compactHaystack.includes(compactSearchText(term)))) return false;
  }
  return true;
}

function productSearchScore(product, search) {
  const terms = productSearchTerms(search);
  if (terms.length === 0) return 0;
  const model = compactSearchText(product.model);
  const name = compactSearchText(product.name);
  const standard = compactSearchText([product.standard, ...(product.standards || [])].join(" "));
  const category = compactSearchText(product.categoryName);
  const manufacturer = compactSearchText(product.manufacturer);
  let score = 0;
  for (const term of terms) {
    const compact = compactSearchText(term);
    if (!compact) continue;
    if (model === compact) score += 120;
    else if (model.startsWith(compact)) score += 90;
    else if (model.includes(compact)) score += 70;
    if (standard.includes(compact)) score += 45;
    if (name.includes(compact)) score += 35;
    if (category.includes(compact)) score += 18;
    if (manufacturer.includes(compact)) score += 12;
  }
  return score;
}

function sortProductsByRelevance(products, search) {
  if (!search) {
    return products.sort((a, b) => {
      const clickDiff = Number(b.clickCount || 0) - Number(a.clickCount || 0);
      if (clickDiff) return clickDiff;
      return (a.manufacturer + "-" + a.model).localeCompare(b.manufacturer + "-" + b.model, "zh-CN");
    });
  }
  return products.sort((a, b) => {
    const scoreDiff = productSearchScore(b, search) - productSearchScore(a, search);
    if (scoreDiff) return scoreDiff;
    const clickDiff = Number(b.clickCount || 0) - Number(a.clickCount || 0);
    if (clickDiff) return clickDiff;
    return (a.manufacturer + "-" + a.model).localeCompare(b.manufacturer + "-" + b.model, "zh-CN");
  });
}

function mergeProducts(primary, fallback) {
  const seen = new Set();
  const merged = [];
  for (const product of [...primary, ...fallback]) {
    if (!product?.slug || seen.has(product.slug)) continue;
    seen.add(product.slug);
    merged.push(product);
  }
  return merged;
}

function listSeedProducts(filters = {}) {
  return sortProductsByRelevance(loadSeedProducts().filter((product) => productMatches(product, filters)), filters.search).slice(0, 200);
}

function publicProductSummary(product) {
  const { slug, manufacturer, categorySlug, categoryName, model, name, standard, summary, clickCount, inStock } = product;
  return { slug, manufacturer, categorySlug, categoryName, model, name, standard, summary, inStock: Boolean(inStock), clickCount: clickCount || 0 };
}

function buildCategories(products) {
  const map = new Map();
  for (const product of products) {
    const key = product.categorySlug;
    if (!map.has(key)) map.set(key, { slug: key, name: product.categoryName, total: 0, manufacturers: [] });
    const item = map.get(key);
    item.total += 1;
    const manufacturer = item.manufacturers.find((entry) => entry.name === product.manufacturer);
    if (manufacturer) manufacturer.count += 1;
    else item.manufacturers.push({ name: product.manufacturer, count: 1 });
  }
  return Array.from(map.values());
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateInquiry(body) {
  const inquiry = {
    name: normalizeText(body.name),
    phone: normalizeText(body.phone),
    company: normalizeText(body.company),
    customerLocation: normalizeText(body.customerLocation),
    message: normalizeText(body.message)
  };

  if (!inquiry.name) return { error: "Please enter a contact name." };
  if (!inquiry.phone) return { error: "Please enter a phone number." };
  if (!/^[-+()\d\s]{6,40}$/.test(inquiry.phone)) return { error: "Invalid phone number." };
  if (!inquiry.message) return { error: "Please enter the inquiry details." };
  if (inquiry.message.length > 2000) return { error: "Inquiry details must be within 2000 characters." };
  return { inquiry };
}

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: false,
  originAgentCluster: false
}));
app.use(cors({ origin: true }));
app.use(express.json({ limit: "64kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.get("/api/product-categories", async (_req, res, next) => {
  try {
    const cacheKey = "product-categories";
    const cached = getCachedJson(cacheKey);
    if (cached) return sendCachedJson(res, cached, 120);

    if (mongoose.connection.readyState !== 1) {
      const payload = { items: buildCategories(loadSeedProducts()) };
      setCachedJson(cacheKey, payload);
      return sendCachedJson(res, payload, 120);
    }

    const groups = await Product.aggregate([
      { $group: { _id: { categorySlug: "$categorySlug", categoryName: "$categoryName", manufacturer: "$manufacturer" }, count: { $sum: 1 } } },
      { $sort: { "_id.categoryName": 1, "_id.manufacturer": 1 } }
    ]);

    if (groups.length === 0) {
      const payload = { items: buildCategories(loadSeedProducts()) };
      setCachedJson(cacheKey, payload);
      return sendCachedJson(res, payload, 120);
    }

    const map = new Map();
    for (const row of groups) {
      const key = row._id.categorySlug;
      if (!map.has(key)) map.set(key, { slug: key, name: row._id.categoryName, total: 0, manufacturers: [] });
      const item = map.get(key);
      item.total += row.count;
      item.manufacturers.push({ name: row._id.manufacturer, count: row.count });
    }

    const payload = { items: Array.from(map.values()) };
    setCachedJson(cacheKey, payload);
    sendCachedJson(res, payload, 120);
  } catch (error) {
    const payload = { items: buildCategories(loadSeedProducts()) };
    setCachedJson("product-categories", payload);
    sendCachedJson(res, payload, 120);
  }
});

app.get("/api/products", async (req, res, next) => {
  const search = normalizeText(req.query.search);
  const category = normalizeText(req.query.category);
  const manufacturer = normalizeText(req.query.manufacturer);
  const requestedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(requestedLimit, 200)) : 200;
  const filters = { search, category, manufacturer };
  const cacheKey = "products:v" + SEARCH_CACHE_VERSION + ":" + JSON.stringify({ ...filters, limit });

  try {
    const cached = getCachedJson(cacheKey);
    if (cached) return sendCachedJson(res, cached, search ? 30 : 120);
    const query = {};
    if (category) query.categorySlug = category;
    if (manufacturer) query.manufacturer = manufacturer;
    if (search) {
      Object.assign(query, buildProductSearchQuery(search));
    }

    if (mongoose.connection.readyState !== 1) {
      const payload = { items: listSeedProducts(filters).slice(0, limit).map(publicProductSummary), source: "seed" };
      setCachedJson(cacheKey, payload);
      return sendCachedJson(res, payload, search ? 30 : 120);
    }

    const mongoItems = await Product.find(query)
      .select("slug manufacturer categorySlug categoryName model name standard summary standards inStock clickCount")
      .sort({ clickCount: -1, manufacturer: 1, model: 1 })
      .limit(limit)
      .lean();

    const seedItems = (category || search || manufacturer) ? listSeedProducts(filters).map(publicProductSummary) : [];
    const items = sortProductsByRelevance(mergeProducts(mongoItems, seedItems), search).slice(0, limit);

    const payload = { items, source: seedItems.length > 0 ? "mongo+seed" : "mongo" };
    setCachedJson(cacheKey, payload);
    sendCachedJson(res, payload, search ? 30 : 120);
  } catch (error) {
    const payload = { items: listSeedProducts(filters).slice(0, limit).map(publicProductSummary), source: "seed" };
    setCachedJson(cacheKey, payload);
    sendCachedJson(res, payload, search ? 30 : 120);
  }
});

app.post("/api/products/:slug/click", async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Product.updateOne(
        { slug: req.params.slug },
        { $inc: { clickCount: 1 }, $set: { lastClickedAt: new Date() } }
      );
      apiCache.clear();
    }
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/products/:slug", async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const item = await Product.findOne({ slug: req.params.slug }).lean();
      if (item) return res.json({ item, source: "mongo" });
    }

    const seedItem = loadSeedProducts().find((product) => product.slug === req.params.slug);
    if (!seedItem) return res.status(404).json({ message: "Product not found." });
    res.json({ item: seedItem, source: "seed" });
  } catch (error) {
    const seedItem = loadSeedProducts().find((product) => product.slug === req.params.slug);
    if (!seedItem) return res.status(404).json({ message: "Product not found." });
    res.json({ item: seedItem, source: "seed" });
  }
});

app.post("/api/inquiries", async (req, res, next) => {
  try {
    const { inquiry, error } = validateInquiry(req.body || {});
    if (error) return res.status(400).json({ message: error });

    const saved = await Inquiry.create({
      ...inquiry,
      ip: req.ip,
      userAgent: req.get("user-agent") || ""
    });

    res.status(201).json({ id: saved._id, message: "Inquiry saved." });
  } catch (error) {
    next(error);
  }
});

app.get("/api/inquiries", async (req, res, next) => {
  try {
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken || req.get("x-admin-token") !== adminToken) return res.status(401).json({ message: "Unauthorized." });

    const items = await Inquiry.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absoluteUrl(pathname = "/") {
  const normalized = pathname.startsWith("/") ? pathname : "/" + pathname;
  return siteOrigin + normalized;
}

function cleanSeoText(value, max = 155) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  return normalized.length > max ? normalized.slice(0, max - 1) + "…" : normalized;
}

function uniqueTerms(terms) {
  return [...new Set(terms.flatMap((term) => String(term || "").split(/[,，、；;]+/)).map((term) => term.trim()).filter(Boolean))];
}

function readIndexHtml() {
  const indexPath = path.join(distDir, "index.html");
  if (!indexHtmlCache || process.env.NODE_ENV !== "production") {
    indexHtmlCache = fs.readFileSync(indexPath, "utf8").replace(/^\uFEFF/, "");
  }
  return indexHtmlCache;
}

function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "宁波志凡焊材有限公司",
    url: siteOrigin,
    image: absoluteUrl("/assets/site/zhifan-logo.png"),
    telephone: "0574-89007658",
    address: {
      "@type": "PostalAddress",
      addressCountry: "CN",
      addressRegion: "浙江省",
      addressLocality: "宁波市",
      streetAddress: "鄞州区富宁路119号"
    },
    areaServed: ["宁波", "舟山", "浙江", "绍兴", "新昌", "江浙沪"],
    openingHours: "Mo-Sa 08:00-16:30",
    description: companyDescription
  };
}

function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path)
    }))
  };
}

function injectSeoHtml(html, meta) {
  const title = escapeHtml(meta.title || "宁波志凡焊材有限公司");
  const description = escapeHtml(cleanSeoText(meta.description || companyDescription, 170));
  const keywords = escapeHtml(uniqueTerms([...(meta.keywords || []), ...baseKeywords]).join(","));
  const canonical = escapeHtml(meta.canonical || siteOrigin);
  const schema = (meta.schema || [organizationSchema()]).map((item) =>
    `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, "\\u003c")}</script>`
  ).join("\n    ");
  let output = html
    .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[\s\S]*?"\s*\/>/s, `<meta name="description" content="${description}" />`)
    .replace(/<meta name="keywords" content="[\s\S]*?"\s*\/>/s, `<meta name="keywords" content="${keywords}" />`);
  const extraHead = [
    `<link rel="canonical" href="${canonical}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:type" content="${meta.ogType || "website"}" />`,
    schema
  ].filter(Boolean).join("\n    ");
  return output.replace("</head>", `    ${extraHead}\n  </head>`);
}

function productStandards(product) {
  const raw = [product?.standard, ...(product?.standards || [])]
    .map((standard) => String(standard || "").trim())
    .filter(Boolean);
  const unique = [...new Set(raw)];
  return unique.filter((standard) => !unique.some((other) => other !== standard && other.includes(standard)));
}

function productDisplayName(product) {
  let baseName = String(product?.name || "").trim();
  const model = String(product?.model || "").trim();
  const manufacturer = String(product?.manufacturer || "").trim();
  if (manufacturer && baseName.startsWith(manufacturer)) baseName = baseName.slice(manufacturer.length).trim();
  const modelName = baseName && model && baseName.toLowerCase().includes(model.toLowerCase()) ? baseName : [model, baseName].filter(Boolean).join(" ");
  return [manufacturer, modelName].filter(Boolean).join(" ").trim();
}

function firstProductSentence(product) {
  const source = [product?.introduction, ...(product?.applications || []), product?.summary, product?.name].filter(Boolean).join("。");
  return String(source).replace(/\s+/g, " ").split(/[。；;]/)[0] || "支持按执行标准、成分和熔敷金属性能选型";
}

function categoryMetaFor(slug = "") {
  if (!slug) {
    return {
      title: "产品中心 | 宁波舟山浙江焊材现货供应 | 宁波志凡焊材有限公司",
      description: "按产品大类、厂家、型号和执行标准筛选焊材现货，覆盖碳钢焊条、实芯气保焊丝、药芯焊丝、不锈钢焊材、埋弧焊丝焊剂、铝焊丝、特种焊材和设备配件。",
      keywords: ["产品中心", "焊材现货", ...productCategories.map((item) => item.title)],
      canonical: absoluteUrl("/products")
    };
  }
  const meta = categoryMeta[slug] || productCategories.find((item) => item.slug === slug) || {};
  return {
    title: `${meta.title || "焊材产品"}现货清单 | 宁波舟山浙江焊材供应 | 宁波志凡焊材有限公司`,
    description: cleanSeoText(`${meta.title || "焊材产品"}型号清单，${meta.description || "支持按厂家、型号、执行标准和现货状态筛选。"} 服务宁波、舟山、浙江、绍兴、新昌及江浙沪船厂、钢结构、压力容器、电力工程和石化项目。`, 165),
    keywords: [meta.title, "焊材现货", "厂家筛选", "型号规格", "执行标准"],
    canonical: absoluteUrl("/products/" + slug)
  };
}

function productMetaFor(product) {
  const standards = productStandards(product);
  const stock = product?.inStock ? "仓内现货产品，" : "";
  return {
    title: `${product.manufacturer} ${product.model} ${product.categoryName} | 标准 成分 熔敷金属 | 宁波志凡焊材有限公司`,
    description: cleanSeoText(`${stock}${productDisplayName(product)}，${firstProductSentence(product)}。${standards.length ? "执行标准：" + standards.slice(0, 4).join("、") + "。" : ""}可查看化学成分、熔敷金属力学性能、规格与认证情况，服务宁波、舟山、浙江、绍兴、新昌及江浙沪项目采购。`, 170),
    keywords: [product.manufacturer, `${product.manufacturer}${product.model}`, product.model, product.name, product.categoryName, ...standards, product.inStock ? "仓内现货产品" : "", "熔敷金属", "化学成分", "力学性能"],
    canonical: absoluteUrl("/products/" + product.slug),
    ogType: "product",
    schema: [
      organizationSchema(),
      breadcrumbSchema([
        { name: "首页", path: "/" },
        { name: "产品中心", path: "/products" },
        { name: product.categoryName, path: "/products/" + product.categorySlug },
        { name: product.model, path: "/products/" + product.slug }
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: productDisplayName(product),
        brand: { "@type": "Brand", name: product.manufacturer },
        category: product.categoryName,
        sku: product.model,
        description: firstProductSentence(product),
        additionalProperty: standards.map((standard) => ({ "@type": "PropertyValue", name: "执行标准", value: standard }))
      }
    ]
  };
}

async function findProductBySlug(slug) {
  if (mongoose.connection.readyState === 1) {
    const item = await Product.findOne({ slug }).lean();
    if (item) return item;
  }
  return loadSeedProducts().find((product) => product.slug === slug);
}

async function productUrlsForSitemap() {
  const seedItems = loadSeedProducts().map((product) => product.slug);
  if (mongoose.connection.readyState !== 1) return [...new Set(seedItems)];
  const mongoItems = await Product.find().select("slug").lean();
  return [...new Set([...mongoItems.map((item) => item.slug), ...seedItems])];
}
const distDir = path.resolve(__dirname, "../dist");

app.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send([
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Sitemap: " + absoluteUrl("/sitemap.xml")
  ].join("\n"));
});

app.get("/sitemap.xml", async (_req, res, next) => {
  try {
    const staticPaths = ["/", "/products", "/knowledge", "/team-vision"];
    const categoryPaths = productCategories.map((item) => "/products/" + item.slug);
    const productPaths = (await productUrlsForSitemap()).map((slug) => "/products/" + slug);
    const qaDir = path.resolve(__dirname, "../public/articles/qa");
    const articlePaths = fs.existsSync(qaDir)
      ? fs.readdirSync(qaDir).filter((name) => name.endsWith(".html")).map((name) => "/articles/qa/" + name)
      : [];
    const urls = [...new Set([...staticPaths, ...categoryPaths, ...productPaths, ...articlePaths])];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((pathname) => `  <url><loc>${absoluteUrl(pathname)}</loc><changefreq>${pathname.startsWith("/products/") ? "weekly" : "monthly"}</changefreq><priority>${pathname === "/" ? "1.0" : "0.7"}</priority></url>`).join("\n")}\n</urlset>`;
    res.type("application/xml").send(body);
  } catch (error) {
    next(error);
  }
});

app.use(express.static(distDir, {
  maxAge: "1h",
  setHeaders(res, filePath) {
    if (path.basename(filePath) === "index.html") {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    } else if (path.basename(filePath) === "styles.css") {
      res.setHeader("Cache-Control", "public, max-age=3600");
    } else if (/\.(?:webp|avif|png|jpg|jpeg|svg|ico|css|js)$/i.test(filePath)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  }
}));

app.get("*", async (req, res, next) => {
  try {
    if (req.path.startsWith("/api")) return next();
    if (req.path.startsWith("/assets/") || /\.[a-z0-9]+$/i.test(req.path)) {
      return res.status(404).type("text/plain").send("Not found");
    }

    const html = readIndexHtml();
    let meta = {
      title: "宁波志凡焊材有限公司 | 金桥大西洋东风天泰焊材一级经销商",
      description: companyDescription,
      keywords: ["宁波志凡焊材有限公司", "Founded in 1998", "焊材一级经销商"],
      canonical: absoluteUrl(req.path === "/index.html" ? "/" : req.path),
      schema: [organizationSchema()]
    };

    if (req.path === "/products" || req.path === "/products/") {
      meta = { ...categoryMetaFor(""), schema: [organizationSchema(), breadcrumbSchema([{ name: "首页", path: "/" }, { name: "产品中心", path: "/products" }])] };
    } else if (req.path.startsWith("/products/")) {
      const slug = decodeURIComponent(req.path.replace(/^\/products\//, "").replace(/\/$/, ""));
      if (categoryMeta[slug]) {
        meta = { ...categoryMetaFor(slug), schema: [organizationSchema(), breadcrumbSchema([{ name: "首页", path: "/" }, { name: "产品中心", path: "/products" }, { name: categoryMeta[slug].title, path: "/products/" + slug }])] };
      } else {
        const product = await findProductBySlug(slug);
        if (product) meta = productMetaFor(product);
      }
    } else if (req.path === "/knowledge" || req.path === "/knowledge/") {
      meta = {
        title: "焊接材料问答Q&A | 焊材选型 操作 缺陷 储存 | 宁波志凡焊材有限公司",
        description: "围绕焊材基础、常见选型、行业应用、现场缺陷和储存烘干整理焊接材料问答，帮助船厂、钢结构、压力容器、机械制造和电力工程客户快速确认焊材方向。",
        keywords: ["焊接材料问答", "焊材选型", "焊接操作", "焊接缺陷", "焊条烘干", "J422", "J507", "ER50-6", "E71T-1"],
        canonical: absoluteUrl("/knowledge"),
        schema: [organizationSchema(), breadcrumbSchema([{ name: "首页", path: "/" }, { name: "焊接材料问答Q&A", path: "/knowledge" }])]
      };
    }

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.type("html").send(injectSeoHtml(html, meta));
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Server error." });
});

async function start() {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    await Promise.all([Product.createIndexes(), Inquiry.createIndexes()]);
    console.log("MongoDB connected and indexes ensured.");
  } catch (error) {
    console.warn("MongoDB unavailable, product APIs will use bundled seed data:", error.message);
  }

  app.listen(port, () => console.log("Zhifan site server listening on http://localhost:" + port));
}

start();
