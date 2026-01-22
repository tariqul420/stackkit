#!/usr/bin/env node
/* eslint-disable */
try {
  require("../dist/index.js");
} catch (err) {
  console.error(
    "Failed to load compiled CLI (did you run 'npm run build'?)",
    err && err.message ? err.message : err,
  );
  process.exitCode = 1;
}
