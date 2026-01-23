/* eslint-disable @typescript-eslint/no-require-imports */
import fs from "fs-extra";
import path from "path";
import { getPackageRoot } from "../utils/package-root";

const baseDirs: Record<string, string> = {
  express: "./src",
  react: "./src",
  nextjs: ".",
};

export async function convertToJavaScript(targetDir: string, framework: string): Promise<void> {
  const tsFiles = [
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "next-env.d.ts",
    "vite-env.d.ts",
  ];
  for (const file of tsFiles) {
    const filePath = path.join(targetDir, file);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  }

  const removeDtsFiles = async (dir: string) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules") {
        await removeDtsFiles(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".d.ts")) {
        await fs.remove(fullPath);
      }
    }
  };
  await removeDtsFiles(targetDir);

  const babel = require("@babel/core");
  const transpileAllTsFiles = async (dir: string) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules") {
        await transpileAllTsFiles(fullPath);
      } else if (entry.isFile()) {
        if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
          const code = await fs.readFile(fullPath, "utf8");
          const isTsx = entry.name.endsWith(".tsx");
          const outFile = fullPath.replace(/\.tsx$/, ".jsx").replace(/\.ts$/, ".js");
          const presets: (string | [string, Record<string, unknown>])[] = [
            [
              require.resolve("@babel/preset-typescript"),
              {
                onlyRemoveTypeImports: true,
                allowDeclareFields: true,
                allowNamespaces: true,
                optimizeForSpeed: true,
                allExtensions: true,
                isTSX: isTsx,
              },
            ],
            [
              require.resolve("@babel/preset-env"),
              {
                targets: { node: "18" },
                modules: false,
              },
            ],
          ];
          if (isTsx) {
            presets.push([
              require.resolve("@babel/preset-react"),
              {
                runtime: "automatic",
              },
            ]);
          }
          // Use recast + Babel AST transform (same approach as transform.tools)
          try {
            const recast = require("recast");
            const { transformFromAstSync } = require("@babel/core");
            const transformTypescript = require("@babel/plugin-transform-typescript");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let getBabelOptions: any = require("recast/parsers/_babel_options");
            if (getBabelOptions && getBabelOptions.default)
              getBabelOptions = getBabelOptions.default;
            const babelParser = require("recast/parsers/babel").parser;

            const ast = recast.parse(code, {
              parser: {
                parse: (source: string, options: Record<string, unknown>) => {
                  const babelOptions = getBabelOptions(options || {});
                  if (isTsx) {
                    babelOptions.plugins.push("typescript", "jsx");
                  } else {
                    babelOptions.plugins.push("typescript");
                  }
                  return babelParser.parse(source, babelOptions);
                },
              },
            });

            const opts = {
              cloneInputAst: false,
              code: false,
              ast: true,
              plugins: [transformTypescript],
              configFile: false,
            };

            const { ast: transformedAST } = transformFromAstSync(ast, code, opts);
            const resultCode = recast.print(transformedAST).code;
            await fs.writeFile(outFile, resultCode, "utf8");
            await fs.remove(fullPath);
            continue;
          } catch {
            // ignore recast errors, fall back to babel
          }

          const result = await babel.transformAsync(code, {
            filename: entry.name,
            presets,
            comments: true,
            retainLines: true,
            compact: false,
            babelrc: false,
            configFile: false,
          });
          await fs.writeFile(outFile, result.code, "utf8");
          await fs.remove(fullPath);
        }
      }
    }
  };
  await transpileAllTsFiles(targetDir);

  const baseDir = baseDirs[framework];
  if (baseDir) {
    const replaceAliases = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== "node_modules") {
          await replaceAliases(full);
        } else if (entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".jsx"))) {
          const content = await fs.readFile(full, "utf-8");
          if (content.includes("@/")) {
            const fileDir = path.dirname(full);
            const newContent = content.replace(/from ['"]@\/([^'"]*)['"]/g, (match, p1) => {
              const resolved = path.resolve(baseDir, p1);
              let relPath = path.relative(fileDir, resolved);
              if (!relPath.startsWith(".")) relPath = "./" + relPath;
              return `from '${relPath}'`;
            });
            await fs.writeFile(full, newContent, "utf-8");
          }
        }
      }
    };
    await replaceAliases(targetDir);
  }

  const templatesRoot = path.join(getPackageRoot(), "templates");
  const templateName = framework;

  let fileReplacements = [];
  let jsScripts = null;
  if (templateName) {
    const templateJsonPath = path.join(templatesRoot, templateName, "template.json");
    if (await fs.pathExists(templateJsonPath)) {
      try {
        const templateJson = await fs.readJson(templateJsonPath);
        if (Array.isArray(templateJson.fileReplacements)) {
          fileReplacements = templateJson.fileReplacements;
        }
        if (templateJson.jsScripts) {
          jsScripts = templateJson.jsScripts;
        }
      } catch {
        // ignore errors reading template.json
      }
    }
  }
  for (const rep of fileReplacements) {
    const filePath = path.join(targetDir, rep.file);
    if (await fs.pathExists(filePath)) {
      let content = await fs.readFile(filePath, "utf8");
      if (rep.from && rep.to) {
        content = content.replace(rep.from, rep.to);
        await fs.writeFile(filePath, content, "utf8");
      }
    }
  }
  if (jsScripts) {
    const packageJsonPath = path.join(targetDir, "package.json");
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.scripts = { ...packageJson.scripts, ...jsScripts };
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
  }
  const jsconfig = path.join(targetDir, "jsconfig.json");
  if (!(await fs.pathExists(jsconfig))) {
    for (const tmpl of await fs.readdir(templatesRoot, { withFileTypes: true })) {
      if (tmpl.isDirectory()) {
        const templateJsconfig = path.join(templatesRoot, tmpl.name, "jsconfig.json");
        if (await fs.pathExists(templateJsconfig)) {
          await fs.copy(templateJsconfig, jsconfig);
          break;
        }
      }
    }
  }
  const srcDir = path.join(targetDir, "src");
  if (await fs.pathExists(srcDir)) {
    const srcFiles = await fs.readdir(srcDir);
    for (const file of srcFiles) {
      if (
        (file.endsWith(".js") || file.endsWith(".jsx")) &&
        file.replace(/\.(js|jsx)$/, ".ts") &&
        srcFiles.includes(file.replace(/\.(js|jsx)$/, ".ts"))
      ) {
        await fs.remove(path.join(srcDir, file.replace(/\.(js|jsx)$/, ".ts")));
      }
      if (file.endsWith(".jsx") && srcFiles.includes(file.replace(/\.jsx$/, ".tsx"))) {
        await fs.remove(path.join(srcDir, file.replace(/\.jsx$/, ".tsx")));
      }
    }
  }
  const packageJsonPath = path.join(targetDir, "package.json");
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    if (packageJson.devDependencies) {
      delete packageJson.devDependencies["typescript"];
      delete packageJson.devDependencies["@types/node"];
      delete packageJson.devDependencies["@types/react"];
      delete packageJson.devDependencies["@types/react-dom"];
    }
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }
}
