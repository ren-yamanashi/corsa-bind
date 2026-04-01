import { spawnSync, type SpawnSyncOptions } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

interface RunCommandOptions {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  stdio?: SpawnSyncOptions["stdio"];
}

export function runCommand(
  command: string,
  args: readonly string[],
  options: RunCommandOptions = {},
): void {
  const result = spawnSync(command, [...args], {
    cwd: options.cwd ?? rootDir,
    env: options.env ?? process.env,
    stdio: options.stdio ?? "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `Command failed: ${command} ${args.join(" ")} (${result.status ?? result.signal ?? "unknown"})`,
    );
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

export function fail(error: unknown): never {
  if (error instanceof Error) {
    console.error(error.stack ?? error.message);
  } else {
    console.error(String(error));
  }
  process.exit(1);
}
