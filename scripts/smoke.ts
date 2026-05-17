/**
 * Smoke test for the Cursor SDK setup.
 * Run with: npm run smoke
 *
 * Requires CURSOR_API_KEY in env (export it or put it in .env.local
 * and load via `node --env-file=.env.local node_modules/.bin/tsx scripts/smoke.ts`).
 */
import { Agent, CursorAgentError } from "@cursor/sdk";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function main() {
  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) {
    console.error("Missing CURSOR_API_KEY. Add it to .env.local first.");
    process.exit(1);
  }

  const cwd = mkdtempSync(join(tmpdir(), "neuroui-smoke-"));
  console.log(`[smoke] sandbox: ${cwd}`);

  try {
    const result = await Agent.prompt(
      "Reply with the single word 'pong' and nothing else.",
      {
        apiKey,
        model: { id: "composer-2" },
        local: { cwd },
      }
    );
    console.log(`[smoke] status=${result.status}`);
    console.log(`[smoke] result=${result.result ?? "(empty)"}`);
    if (result.status !== "finished") {
      process.exit(2);
    }
  } catch (err) {
    if (err instanceof CursorAgentError) {
      console.error(
        `[smoke] startup failed: ${err.message} retryable=${err.isRetryable}`
      );
      process.exit(1);
    }
    throw err;
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

main();
