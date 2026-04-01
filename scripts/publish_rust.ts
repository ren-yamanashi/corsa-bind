import { fail, rootDir, runCommand, sleep } from "./shared.ts";

const crates = [
  "tsgo_rs_core",
  "tsgo_rs_runtime",
  "tsgo_rs_jsonrpc",
  "tsgo_rs_client",
  "tsgo_rs_lsp",
  "tsgo_rs_orchestrator",
  "tsgo_rs",
] as const;

const delayMs = Number(process.env.CARGO_PUBLISH_DELAY_MS ?? "30000");

async function main(): Promise<void> {
  for (const [index, crateName] of crates.entries()) {
    runCommand("cargo", ["publish", "--locked", "-p", crateName], {
      cwd: rootDir,
    });
    if (index + 1 < crates.length && delayMs > 0) {
      await sleep(delayMs);
    }
  }
}

await main().catch(fail);
