// Vercel build for the hospital portal.
//  1. push the Prisma schema to the database + generate the client
//  2. seed demo data (non-fatal)
//  3. next build
//  4. copy the rhel query engine into .next/server so Prisma finds it at runtime
//     (the pnpm-hoisted engine is otherwise missed by the function bundler)

import { execSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const APP = process.cwd(); // apps/hospital-portal (Vercel Root Directory)
const ROOT = join(APP, "..", "..");
const ENGINE = "libquery_engine-rhel-openssl-3.0.x.so.node";

function run(cmd, { allowFail = false } = {}) {
  console.log(`\n$ ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit", cwd: APP });
  } catch (err) {
    if (allowFail) {
      console.warn(`  ↳ non-fatal: ${cmd} failed, continuing`);
      return;
    }
    throw err;
  }
}

function findFile(dir, name, depth = 0) {
  if (depth > 9) return null;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isFile() && e.name === name) return p;
  }
  for (const e of entries) {
    if (e.isDirectory() && e.name !== ".bin") {
      const found = findFile(join(dir, e.name), name, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

console.log("── db push ──");
run("pnpm --filter @szhms/database run db:push");

console.log("── seed ──");
run("pnpm --filter @szhms/database run db:seed", { allowFail: true });

console.log("── next build ──");
run("pnpm run build");

console.log("── copy prisma engine into .next/server ──");
let src = null;
const pnpmDir = join(ROOT, "node_modules", ".pnpm");
try {
  for (const d of readdirSync(pnpmDir)) {
    if (d.startsWith("@prisma+client@")) {
      const cand = join(pnpmDir, d, "node_modules", ".prisma", "client", ENGINE);
      if (existsSync(cand)) {
        src = cand;
        break;
      }
    }
  }
} catch {
  /* fall through to a broad search */
}
if (!src) src = findFile(join(ROOT, "node_modules"), ENGINE);

if (!src) {
  console.error(`ERROR: ${ENGINE} was not generated — check the db push / prisma generate step`);
  process.exit(1);
}

const destDir = join(APP, ".next", "server");
mkdirSync(destDir, { recursive: true });
copyFileSync(src, join(destDir, ENGINE));
console.log(`  copied ${src}`);
console.log(`      -> ${join(destDir, ENGINE)}`);

const schema = join(ROOT, "packages", "database", "prisma", "schema.prisma");
if (existsSync(schema)) {
  copyFileSync(schema, join(destDir, "schema.prisma"));
  console.log("  copied schema.prisma");
}

console.log("── build complete ──");
