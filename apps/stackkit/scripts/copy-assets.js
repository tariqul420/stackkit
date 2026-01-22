#!/usr/bin/env node
/* eslint-disable */
const fs = require("fs-extra");
const path = require("path");

async function copyRecursive(src, dest) {
  try {
    if (await fs.pathExists(dest)) {
      await fs.remove(dest);
    }
    await fs.copy(src, dest);
    return true;
  } catch (err) {
    console.error(`Failed to copy from ${src} to ${dest}:`, err.message || err);
    return false;
  }
}

async function ensureNonDotFiles(templatesRoot) {
  if (!(await fs.pathExists(templatesRoot))) return;

  const entries = await fs.readdir(templatesRoot, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const tplDir = path.join(templatesRoot, e.name);

    let tplEntries = [];
    try {
      tplEntries = await fs.readdir(tplDir, { withFileTypes: true });
    } catch (err) {
      console.warn(
        `Could not read template dir ${tplDir}:`,
        err && err.message ? err.message : err,
      );
      continue;
    }

    for (const te of tplEntries) {
      if (!te.isFile()) continue;
      if (!te.name.startsWith(".")) continue;

      const dotPath = path.join(tplDir, te.name);
      const nonDotPath = path.join(tplDir, te.name.slice(1));
      try {
        if ((await fs.pathExists(dotPath)) && !(await fs.pathExists(nonDotPath))) {
          await fs.copy(dotPath, nonDotPath);
        }
      } catch (err) {
        console.warn(`Could not ensure ${nonDotPath}:`, err && err.message ? err.message : err);
      }
    }
  }
}

async function main() {
  const packageRoot = path.join(__dirname, "..", "..", "..");
  const srcTemplates = path.join(packageRoot, "templates");
  const srcModules = path.join(packageRoot, "modules");

  const destTemplates = path.join(__dirname, "..", "templates");
  const destModules = path.join(__dirname, "..", "modules");

  let anyCopied = false;

  if (await fs.pathExists(srcTemplates)) {
    const ok = await copyRecursive(srcTemplates, destTemplates);
    if (ok) anyCopied = true;
    else {
      console.error("Templates copy failed");
    }
  } else {
    console.warn(`Source templates not found at ${srcTemplates}, skipping templates copy.`);
  }

  if (await fs.pathExists(srcModules)) {
    const ok = await copyRecursive(srcModules, destModules);
    if (ok) anyCopied = true;
    else {
      console.error("Modules copy failed");
    }
  } else {
    console.warn(`Source modules not found at ${srcModules}, skipping modules copy.`);
  }

  if (await fs.pathExists(destTemplates)) {
    await ensureNonDotFiles(destTemplates);
  }

  if (!anyCopied) {
    console.warn("No assets were copied (no source directories found).");
  } else {
    console.log("Assets copied and dotfile fallbacks ensured.");
  }
}

main().catch((err) => {
  console.error("Unexpected error during copy-assets:", err.message || err);
  process.exitCode = 1;
});
