import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const distClient = path.join(rootDir, "dist", "client");
const distRoot = path.join(rootDir, "dist");

if (fs.existsSync(distClient)) {
  const shellHtml = path.join(distClient, "_shell.html");
  const clientIndexHtml = path.join(distClient, "index.html");
  
  if (fs.existsSync(shellHtml)) {
    fs.copyFileSync(shellHtml, clientIndexHtml);
  }

  // Copy client assets and static prerendered files directly to dist root for Vercel SPA deployment
  fs.cpSync(distClient, distRoot, { recursive: true });
  console.log("✅ Postbuild: Copied dist/client files & index.html to dist root for Vercel SPA deployment.");
}
