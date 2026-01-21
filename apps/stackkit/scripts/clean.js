#!/usr/bin/env node
/* eslint-disable */
const fs = require("fs-extra");
const path = require("path");

async function main() {
  try {
    const cwd = path.join(__dirname, "..");
    const targets = ["dist", "templates", "modules"];

    let removedCount = 0;
    const removedList = [];
    for (const t of targets) {
      const p = path.join(cwd, t);
      if (await fs.pathExists(p)) {
        await fs.remove(p);
        removedCount += 1;
        removedList.push(p);
        if (process.env.DEBUG_CLEAN) console.log(`Removed ${p}`);
      }
    }

    if (removedCount === 0) {
      console.log("Clean complete. Nothing to remove.");
    } else if (process.env.DEBUG_CLEAN) {
      console.log(`Clean complete. Removed ${removedCount} items.`);
    } else {
      console.log("Clean complete.");
    }
  } catch (err) {
    console.error("Clean failed:", err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}

main();
