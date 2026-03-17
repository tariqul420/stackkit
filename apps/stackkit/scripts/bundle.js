const esbuild = require("esbuild");

const ignoreIconvPlugin = {
  name: "ignore-iconv-encodings",
  setup(build) {
    build.onResolve({ filter: /^iconv-lite\/encodings(\/.*)?$/ }, (args) => ({
      path: args.path,
      namespace: "empty-encodings",
    }));

    build.onLoad({ filter: /.*/, namespace: "empty-encodings" }, () => ({
      contents: "module.exports = {}",
      loader: "js",
    }));
    build.onLoad({ filter: /iconv-lite.*encodings.*\\.json$/ }, () => ({
      contents: "module.exports = {}",
      loader: "js",
    }));

    build.onLoad({ filter: /iconv-lite.*encodings.*\\.js$/ }, () => ({
      contents: "module.exports = {}",
      loader: "js",
    }));
    build.onResolve({ filter: /^chardet$/ }, (args) => ({
      path: args.path,
      namespace: "empty-encodings",
    }));
    build.onResolve({ filter: /^iconv-lite$/ }, (args) => ({
      path: args.path,
      namespace: "empty-encodings",
    }));
    // Alias readable-stream to Node's builtin stream implementation to avoid bundling the polyfill
    build.onResolve({ filter: /^readable-stream$/ }, () => ({ path: "stream", external: true }));
    // Stub rxjs to avoid bundling its large implementation into the CLI build
    build.onResolve({ filter: /^rxjs(\/.*)?$/ }, (args) => ({
      path: args.path,
      namespace: "empty-rxjs",
    }));
    build.onLoad({ filter: /.*/, namespace: "empty-rxjs" }, () => ({
      contents: "module.exports = {};",
      loader: "js",
    }));
    // Stub cli-spinners (large JSON) with a minimal spinner set
    build.onResolve({ filter: /^cli-spinners$/ }, (args) => ({
      path: args.path,
      namespace: "empty-spinners",
    }));
    build.onLoad({ filter: /.*/, namespace: "empty-spinners" }, () => ({
      contents: 'module.exports = { dots: { frames: [".","..","..."], interval: 80 } };',
      loader: "js",
    }));
    // Stub color-convert to a minimal set used by chalk
    build.onResolve({ filter: /^color-convert(\/.*)?$/ }, (args) => ({
      path: args.path,
      namespace: "empty-color",
    }));
    build.onLoad({ filter: /.*/, namespace: "empty-color" }, () => ({
      contents: "module.exports = {}",
      loader: "js",
    }));
  },
};

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    target: ["node18"],
    outfile: "dist/index.js",
    minify: true,
    metafile: true,
    plugins: [ignoreIconvPlugin],
  })
  .then((result) => {
    const fs = require("fs");
    try {
      fs.mkdirSync("dist", { recursive: true });
      fs.writeFileSync("dist/meta.json", JSON.stringify(result.metafile, null, 2));
      console.log("Built and wrote dist/meta.json");
    } catch (err) {
      console.error("Build succeeded but failed to write metafile:", err);
    }
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
