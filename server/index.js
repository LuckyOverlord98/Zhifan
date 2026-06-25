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

const Inquiry = mongoose.model("Inquiry", inquirySchema);

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
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
    if (!adminToken || req.get("x-admin-token") !== adminToken) {
      return res.status(401).json({ message: "Unauthorized." });
    }

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
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    app.listen(port, () => {
      console.log(`Zhifan site server listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

start();