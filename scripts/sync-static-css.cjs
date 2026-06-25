const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
fs.copyFileSync(path.join(root, "styles.css"), path.join(root, "public", "styles.css"));
console.log("Synced styles.css for static article pages.");
