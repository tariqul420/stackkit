#!/usr/bin/env node
import { createProject } from "./lib/create-project";

async function main() {
  const args = process.argv.slice(2);
  const projectName = args[0];

  try {
    await createProject(projectName);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error:", (error as Error).message);
    process.exit(1);
  }
}

main();
