// Vercel build for the hospital portal.
//  1. generate the Prisma client
//  2. next build
//  3. copy the rhel query engine into .next/server so Prisma finds it at runtime
//     (the pnpm-hoisted engine is otherwise missed by the function bundler)
//
// The schema is applied to the database out of band:
//   pnpm --filter @szhms/database db:push     (or db:deploy with migrations)
// Set SZHMS_DB_PUSH=1 to also push + seed during the build (first deploy only).

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
  for (const e of entries) if (e.isFile() && e.name === name) return join(dir, e.name);
  for (const e of entries) {
    if (e.isDirectory() && e.name !== ".bin") {
      const found = findFile(join(dir, e.name), name, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

if (process.env.SZHMS_DB_PUSH === "1") {
  console.log("── db push (SZHMS_DB_PUSH=1) ──");
  run("pnpm --filter @szhms/database run db:push");
  console.log("── seed ──");
  run("pnpm --filter @szhms/database run db:seed", { allowFail: true });
} else {
  console.log("── prisma generate ──");
  run("pnpm --filter @szhms/database run db:generate");
}

console.log("── next build ──");
run("pnpm run build");

console.log("── copy prisma engine into .next/server ──");
let src = null;
try {
  for (const d of readdirSync(join(ROOT, "node_modules", ".pnpm"))) {
    if (d.startsWith("@prisma+client@")) {
      const cand = join(
        ROOT,
        "node_modules",
        ".pnpm",
        d,
        "node_modules",
        ".prisma",
        "client",
        ENGINE,
      );
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
  console.error(`ERROR: ${ENGINE} was not generated — check the prisma generate step`);
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
