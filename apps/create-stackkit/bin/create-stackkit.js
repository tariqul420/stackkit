#!/usr/bin/env node

try {
  // eslint-disable-next-line
  require("ts-node/register");
  // eslint-disable-next-line
  require("../src/index.ts");
} catch {
  // eslint-disable-next-line
  require("../dist/index.js");
}
