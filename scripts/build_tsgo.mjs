import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const refDir = resolve(rootDir, "ref/typescript-go");
const goCacheDir = resolve(rootDir, ".cache/go-build");
const outputName = process.platform === "win32" ? "tsgo.exe" : "tsgo";
const outputPath = resolve(rootDir, ".cache", outputName);

mkdirSync(goCacheDir, { recursive: true });

const result = spawnSync("go", ["build", "-o", outputPath, "./cmd/tsgo"], {
  cwd: refDir,
  env: {
    ...process.env,
    GOCACHE: goCacheDir,
  },
  stdio: "inherit",
});

process.exit(result.status ?? 1);
