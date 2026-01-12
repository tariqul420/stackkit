#!/usr/bin/env node
try {
  // Prefer loading TS source during development if ts-node is available
  require("ts-node/register");
  require("../src/index.ts");
} catch (e) {
  // Fallback to built JS
  require("../dist/index.js");
}
