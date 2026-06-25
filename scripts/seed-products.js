import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(rootDir, ".env") });

const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/zhifan";
const productsPath = path.join(rootDir, "data", "jinqiao-products.json");

async function main() {
  const raw = await fs.readFile(productsPath, "utf8");
  const products = JSON.parse(raw.replace(/^\uFEFF/, ""));

  await mongoose.connect(mongoUri);
  const collection = mongoose.connection.collection("products");

  await collection.createIndex({ slug: 1 }, { unique: true });
  await collection.createIndex({ manufacturer: 1, categorySlug: 1, model: 1 });
  await collection.createIndex({
    model: "text",
    name: "text",
    summary: "text",
    categoryName: "text",
    manufacturer: "text",
    standard: "text",
    standards: "text"
  });

  const slugs = products.map((product) => product.slug);
  await collection.deleteMany({ manufacturer: "金桥", slug: { $nin: slugs } });

  let changed = 0;
  for (const product of products) {
    const now = new Date();
    const result = await collection.updateOne(
      { slug: product.slug },
      {
        $set: {
          ...product,
          source: product.source || "\u91d1\u6865\u4ea7\u54c1\u8be6\u60c5\u9875\u624b\u518c 2024",
          updatedAt: now
        },
        $setOnInsert: { createdAt: now }
      },
      { upsert: true }
    );
    if (result.upsertedCount || result.modifiedCount || result.matchedCount) changed += 1;
  }

  console.log("Seeded " + changed + " products into MongoDB.");
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
