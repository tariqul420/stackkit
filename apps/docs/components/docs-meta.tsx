import fs from "fs";
import path from "path";

function findModulesDir(): string | null {
  const candidates = [
    path.resolve(process.cwd(), "../../modules"),
    path.resolve(process.cwd(), "../modules"),
    path.resolve(process.cwd(), "./modules"),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function readJsonSafe(file: string) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    return null;
  }
}

export function ModuleProviders({
  moduleType,
  moduleName,
}: {
  moduleType: string;
  moduleName: string;
}) {
  const modulesDir = findModulesDir();
  if (!modulesDir) return <div>No modules available</div>;

  const genPath = path.join(modulesDir, moduleType, moduleName, "generator.json");
  const gen = readJsonSafe(genPath) || { operations: [] };

  const providers = new Set<string>();
  for (const op of gen.operations || []) {
    if (op.condition && typeof op.condition === "object") {
      for (const k of Object.keys(op.condition)) {
        if (k.toLowerCase().includes("provider") || k.toLowerCase().includes("prismaprovider")) {
          const v = op.condition[k];
          if (typeof v === "string") providers.add(String(v));
          if (Array.isArray(v)) v.forEach((x: any) => providers.add(String(x)));
        }
      }
    }
  }

  const list = Array.from(providers);
  if (list.length === 0) return <div>Providers: (none listed in metadata)</div>;

  return (
    <ul>
      {list.map((p) => (
        <li key={p}>{p}</li>
      ))}
    </ul>
  );
}

export function ModuleCreateCommands({
  moduleType,
  moduleName,
  cliPrefix = "npx stackkit@latest create my-app",
}: {
  moduleType: string;
  moduleName: string;
  cliPrefix?: string;
}) {
  const modulesDir = findModulesDir();
  if (!modulesDir) return <div />;
  const genPath = path.join(modulesDir, moduleType, moduleName, "generator.json");
  const gen = readJsonSafe(genPath) || { operations: [] };

  const providers = new Set<string>();
  for (const op of gen.operations || []) {
    if (op.condition && typeof op.condition === "object") {
      for (const k of Object.keys(op.condition)) {
        if (k.toLowerCase().includes("provider") || k.toLowerCase().includes("prismaprovider")) {
          const v = op.condition[k];
          if (typeof v === "string") providers.add(String(v));
          if (Array.isArray(v)) v.forEach((x: any) => providers.add(String(x)));
        }
      }
    }
  }

  const list = Array.from(providers);
  if (list.length === 0) return null;

  return (
    <div>
      {list.map((p) => (
        <pre key={p} className="mt-2">{`${cliPrefix} --database prisma-${p}`}</pre>
      ))}
    </div>
  );
}

export function ModuleRequirements({
  moduleType,
  moduleName,
}: {
  moduleType: string;
  moduleName: string;
}) {
  const modulesDir = findModulesDir();
  if (!modulesDir) return <div />;
  const modPath = path.join(modulesDir, moduleType, moduleName, "module.json");
  const genPath = path.join(modulesDir, moduleType, moduleName, "generator.json");

  const mod = readJsonSafe(modPath) || {};
  const gen = readJsonSafe(genPath) || { operations: [] };

  const frameworks: string[] =
    mod.supportedFrameworks || (mod.compatibility && mod.compatibility.frameworks) || [];

  const envVars = new Set<string>();
  for (const op of gen.operations || []) {
    if (op.type === "add-env" && op.envVars && typeof op.envVars === "object") {
      Object.keys(op.envVars).forEach((k) => envVars.add(k));
    }
  }

  return (
    <div>
      {frameworks.length > 0 && (
        <div>
          <strong>Compatible frameworks:</strong>
          <ul>
            {frameworks.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      {envVars.size > 0 && (
        <div>
          <strong>Environment variables:</strong>
          <ul>
            {Array.from(envVars).map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function DocsMeta() {
  return <div />;
}
