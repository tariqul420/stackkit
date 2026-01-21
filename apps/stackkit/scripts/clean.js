#!/usr/bin/env node
/* eslint-disable */
const fs = require("fs-extra");
const path = require("path");

async function main() {
  try {
    const cwd = path.join(__dirname, "..");
    const targets = ["dist", "templates", "modules"];

    for (const t of targets) {
      const p = path.join(cwd, t);
      if (await fs.pathExists(p)) {
        await fs.remove(p);
        console.log(`Removed ${p}`);
      }
    }

    console.log("Clean complete.");
  } catch (err) {
    console.error("Clean failed:", err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}

main();
