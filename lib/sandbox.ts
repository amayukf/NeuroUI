import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { randomUUID } from "node:crypto";

export interface SandboxFile {
  path: string;
  contents: string;
}

export interface Sandbox {
  id: string;
  cwd: string;
  cleanup: () => Promise<void>;
}

const SANDBOX_ROOT = join(tmpdir(), "neuroui");

/**
 * Create a fresh sandbox directory for one pipeline run.
 * All six agents share this cwd and collaborate via files on disk.
 */
export async function createSandbox(): Promise<Sandbox> {
  const id = randomUUID();
  const cwd = join(SANDBOX_ROOT, id);
  await mkdir(cwd, { recursive: true });
  await mkdir(join(cwd, "src"), { recursive: true });

  await writeFile(
    join(cwd, "README.md"),
    [
      "# NeuroUI sandbox",
      "",
      "This is a scratch directory for one NeuroUI generation request.",
      "Six agents collaborate here in sequence:",
      "",
      "1. interpret  -> writes spec.json",
      "2. design     -> writes design.json",
      "3. generate   -> writes src/App.tsx + helper components",
      "4. connect    -> updates src/App.tsx with mock data",
      "5. validate   -> writes report.md",
      "6. optimize   -> rewrites src/App.tsx with fixes applied",
      "",
      "The final src/App.tsx is rendered live in the NeuroUI UI.",
      "",
    ].join("\n")
  );

  return {
    id,
    cwd,
    cleanup: () => rm(cwd, { recursive: true, force: true }),
  };
}

/**
 * Recursively read all files in the sandbox. Returns POSIX-style relative paths
 * so they're stable across platforms (Sandpack expects forward slashes).
 */
export async function readSandboxFiles(
  cwd: string,
  options: { include?: RegExp; exclude?: RegExp } = {}
): Promise<SandboxFile[]> {
  const {
    include,
    exclude = /node_modules|\.git|\.next/,
  } = options;

  const files: SandboxFile[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      const rel = relative(cwd, full).split(sep).join("/");
      if (exclude.test(rel)) continue;
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile()) {
        if (include && !include.test(rel)) continue;
        try {
          const contents = await readFile(full, "utf-8");
          files.push({ path: "/" + rel, contents });
        } catch {
          // Ignore binary/unreadable files; they aren't useful for preview.
        }
      }
    }
  }

  if (existsSync(cwd)) {
    await walk(cwd);
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Read a single file from the sandbox by relative path. Returns undefined if missing.
 */
export async function readSandboxFile(
  cwd: string,
  relPath: string
): Promise<string | undefined> {
  const full = join(cwd, relPath);
  try {
    const s = await stat(full);
    if (!s.isFile()) return undefined;
    return await readFile(full, "utf-8");
  } catch {
    return undefined;
  }
}

/**
 * Best-effort cleanup of the entire sandbox root. Safe to call at boot.
 */
export async function purgeSandboxRoot(): Promise<void> {
  try {
    await rm(SANDBOX_ROOT, { recursive: true, force: true });
  } catch {
    // ignore
  }
}
