import fs from "fs";
import path from "path";
import PlayerState from "./core/PlayerState";
import BaseScript from "./core/BaseScript";

export type ScriptConstructor = new (
) => BaseScript;

const scripts = new Map<string, ScriptConstructor>();

async function loadScripts() {
  const scriptsDir = path.resolve(process.cwd(), "dist/scripts");

  async function walk(dir: string) {
    const entries = await fs.promises.readdir(dir, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      if (!entry.name.endsWith(".js")) continue;

      const mod = await import(fullPath);

      const ScriptClass = mod.default as ScriptConstructor;

      if (!ScriptClass) {
        console.warn(`Missing default export: ${fullPath}`);
        continue;
      }

      const key = path
        .relative(scriptsDir, fullPath)
        .replace(/\.js$/, "")
        .replace(/\\/g, "/");

      scripts.set(key, ScriptClass);
    }
  }

  await walk(scriptsDir);
}

export async function initializeScripts() {
  await loadScripts();
}

export function initScript(
    // TODO socket crate here so script instance only exists when account is logged in?
//   socket: any,
//   playerState: PlayerState,
  script: string
) {
  const ScriptClass = scripts.get(script);

  if (!ScriptClass) {
    console.log(`No script found for: ${script}`);
    return;
  }

  return new ScriptClass();
}