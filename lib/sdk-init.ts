import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// On serverless platforms (Vercel, AWS Lambda) the home directory is read-only.
// The Cursor SDK defaults to writing its agent-store under ~/.cursor/projects,
// which causes `ENOENT: mkdir '/home/sbx_userXXXX/.cursor/projects/...'`.
//
// Redirect the SDK's data dir to /tmp BEFORE any Agent.create / Agent.prompt
// call. The SDK reads `process.env.CURSOR_DATA_DIR` per-call, so setting it
// once at module load is enough as long as this file is imported before
// any code that touches the SDK.
if (!process.env.CURSOR_DATA_DIR || process.env.CURSOR_DATA_DIR.trim() === "") {
  const cursorDataDir = join(tmpdir(), ".cursor");
  try {
    mkdirSync(join(cursorDataDir, "projects"), { recursive: true });
  } catch {
    // The SDK will mkdir on demand too; this is best-effort.
  }
  process.env.CURSOR_DATA_DIR = cursorDataDir;
}

export {}; // makes this a module for tree-shaking purposes
