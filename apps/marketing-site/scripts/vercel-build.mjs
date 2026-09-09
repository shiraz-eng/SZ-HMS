// Vercel build for the marketing site.
//  1. generate the Prisma client (schema is owned/pushed by the portal deploy)
//  2. next build
//  3. copy the rhel query engine into .next/server so the Stripe webhook +
//     checkout action can reach the database at runtime

import { execSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const APP = process.cwd();
const ROOT = join(APP, "..", "..");
const ENGINE = "libquery_engine-rhel-openssl-3.0.x.so.node";

function run(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: APP });
}

function findFile(dir, name, depth = 0) {
  if (depth > 9) return null;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const e of entries) if (e.isFile() && e.name === name) return join(dir, e.name);
  for (const e of entries) {
    if (e.isDirectory() && e.name !== ".bin") {
      const found = findFile(join(dir, e.name), name, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

console.log("── prisma generate ──");
run("pnpm --filter @szhms/database run db:generate");

console.log("── next build ──");
run("pnpm run build");

console.log("── copy prisma engine into .next/server ──");
let src = null;
try {
  for (const d of readdirSync(join(ROOT, "node_modules", ".pnpm"))) {
    if (d.startsWith("@prisma+client@")) {
      const cand = join(ROOT, "node_modules", ".pnpm", d, "node_modules", ".prisma", "client", ENGINE);
      if (existsSync(cand)) {
        src = cand;
        break;
      }
    }
  }
} catch {
  /* fall through */
}
if (!src) src = findFile(join(ROOT, "node_modules"), ENGINE);
if (!src) {
  console.error(`ERROR: ${ENGINE} was not generated`);
  process.exit(1);
}

const destDir = join(APP, ".next", "server");
mkdirSync(destDir, { recursive: true });
copyFileSync(src, join(destDir, ENGINE));
const schema = join(ROOT, "packages", "database", "prisma", "schema.prisma");
if (existsSync(schema)) copyFileSync(schema, join(destDir, "schema.prisma"));
console.log(`  copied ${src} -> ${join(destDir, ENGINE)}`);
console.log("── build complete ──");
