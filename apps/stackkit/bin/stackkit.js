#!/usr/bin/env node
function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

try {
  require("../dist/index.js");
} catch (err) {
  console.error("Failed to load compiled CLI (did you run 'npm run build'?)", getErrorMessage(err));
  process.exitCode = 1;
}
