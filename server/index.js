import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";

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
    notes: { type: String, trim: true },
    source: { type: String, default: "Jinqiao 2024 product manual" }
  },
  { timestamps: true }
);

productSchema.index({ model: "text", name: "text", summary: "text", categoryName: "text", manufacturer: "text", standard: "text", standards: "text" });

const Inquiry = mongoose.model("Inquiry", inquirySchema);
const Product = mongoose.model("Product", productSchema);

const seedProductsPath = path.resolve(__dirname, "../data/jinqiao-products.json");
let seedProductsCache = null;

function loadSeedProducts() {
  if (!seedProductsCache) {
    const raw = fs.readFileSync(seedProductsPath, "utf8").replace(/^\uFEFF/, "");
    seedProductsCache = JSON.parse(raw);
  }
  return seedProductsCache;
}

function productMatches(product, filters) {
  if (filters.category && product.categorySlug !== filters.category) return false;
  if (filters.manufacturer && product.manufacturer !== filters.manufacturer) return false;
  if (filters.search) {
    const haystack = [product.model, product.name, product.summary, product.standard, ...(product.standards || []), product.categoryName, product.manufacturer].join(" ").toLowerCase();
    if (!haystack.includes(filters.search.toLowerCase())) return false;
  }
  return true;
}

function listSeedProducts(filters = {}) {
  return loadSeedProducts()
    .filter((product) => productMatches(product, filters))
    .sort((a, b) => (a.manufacturer + "-" + a.model).localeCompare(b.manufacturer + "-" + b.model, "zh-CN"))
    .slice(0, 200);
}

function publicProductSummary(product) {
  const { slug, manufacturer, categorySlug, categoryName, model, name, standard, summary } = product;
  return { slug, manufacturer, categorySlug, categoryName, model, name, standard, summary };
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
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true }));
app.use(express.json({ limit: "64kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.get("/api/product-categories", async (_req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ items: buildCategories(loadSeedProducts()) });

    const groups = await Product.aggregate([
      { $group: { _id: { categorySlug: "$categorySlug", categoryName: "$categoryName", manufacturer: "$manufacturer" }, count: { $sum: 1 } } },
      { $sort: { "_id.categoryName": 1, "_id.manufacturer": 1 } }
    ]);

    if (groups.length === 0) return res.json({ items: buildCategories(loadSeedProducts()) });

    const map = new Map();
    for (const row of groups) {
      const key = row._id.categorySlug;
      if (!map.has(key)) map.set(key, { slug: key, name: row._id.categoryName, total: 0, manufacturers: [] });
      const item = map.get(key);
      item.total += row.count;
      item.manufacturers.push({ name: row._id.manufacturer, count: row.count });
    }

    res.json({ items: Array.from(map.values()) });
  } catch (error) {
    res.json({ items: buildCategories(loadSeedProducts()) });
  }
});

app.get("/api/products", async (req, res, next) => {
  const search = normalizeText(req.query.search);
  const category = normalizeText(req.query.category);
  const manufacturer = normalizeText(req.query.manufacturer);
  const filters = { search, category, manufacturer };

  try {
    const query = {};
    if (category) query.categorySlug = category;
    if (manufacturer) query.manufacturer = manufacturer;
    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      query.$or = [{ model: pattern }, { name: pattern }, { summary: pattern }, { standard: pattern }, { standards: pattern }];
    }

    if (mongoose.connection.readyState !== 1) {
      return res.json({ items: listSeedProducts(filters).map(publicProductSummary), source: "seed" });
    }

    const items = await Product.find(query)
      .select("slug manufacturer categorySlug categoryName model name standard summary")
      .sort({ manufacturer: 1, model: 1 })
      .limit(200)
      .lean();

    if (items.length === 0 && (category || search || manufacturer)) {
      const seedItems = listSeedProducts(filters).map(publicProductSummary);
      if (seedItems.length > 0) return res.json({ items: seedItems, source: "seed" });
    }

    res.json({ items, source: "mongo" });
  } catch (error) {
    res.json({ items: listSeedProducts(filters).map(publicProductSummary), source: "seed" });
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

const distDir = path.resolve(__dirname, "../dist");
app.use(express.static(distDir));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(distDir, "index.html"));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Server error." });
});

async function start() {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log("MongoDB connected.");
  } catch (error) {
    console.warn("MongoDB unavailable, product APIs will use bundled seed data:", error.message);
  }

  app.listen(port, () => console.log("Zhifan site server listening on http://localhost:" + port));
}

start();
