const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "styles.css");
fs.copyFileSync(source, path.join(root, "public", "styles.css"));
fs.copyFileSync(source, path.join(root, "src", "styles.css"));
console.log("Synced styles.css for static article pages and Vite entry.");