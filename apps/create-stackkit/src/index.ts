#!/usr/bin/env node
import { execa } from 'execa';

/**
 * Thin wrapper that calls `stackkit init` with arguments
 * This allows users to run `npx create-stackkit@latest my-app`
 */
async function main() {
  const args = process.argv.slice(2);
  
  try {
    // Call stackkit init with forwarded arguments
    await execa('npx', ['stackkit-cli@latest', 'init', ...args], {
      stdio: 'inherit',
    });
  } catch (error) {
    process.exit(1);
  }
}

main();
