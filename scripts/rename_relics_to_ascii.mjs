/**
 * 将 public/images/relics 下中文文件名改为 relic-001.ext（与 JSON 序号一致），
 * 便于 GitHub Pages / CDN 稳定访问。
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dir = path.join(root, "public", "images", "relics");
const manifestPath = path.join(root, "src", "data", "relicImageFiles.json");

const oldNames = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const newNames = oldNames.map((old, i) => {
  const ext = path.extname(old);
  return `relic-${String(i + 1).padStart(3, "0")}${ext}`;
});

const tmp = oldNames.map((_, i) => path.join(dir, `.relic-rename-tmp-${i}`));

for (let i = 0; i < oldNames.length; i++) {
  const from = path.join(dir, oldNames[i]);
  if (!fs.existsSync(from)) {
    console.error("Missing file:", from);
    process.exit(1);
  }
  fs.renameSync(from, tmp[i]);
}
for (let i = 0; i < oldNames.length; i++) {
  fs.renameSync(tmp[i], path.join(dir, newNames[i]));
}

fs.writeFileSync(
  manifestPath,
  `${JSON.stringify(newNames, null, 2)}\n`,
  "utf8"
);
console.log("Renamed", newNames.length, "relic images + updated relicImageFiles.json");
