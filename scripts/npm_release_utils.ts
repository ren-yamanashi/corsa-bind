import {
  copyFileSync,
  cpSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, relative, resolve } from "node:path";

import { rootDir, runCommand, sleep } from "./shared.ts";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

export interface NodeBindingTarget {
  abi: string | null;
  arch: string;
  libc?: string;
  platform: string;
  platformArchABI: string;
  raw: string;
}

export interface PublishablePackage {
  access?: string;
  name: string;
  path: string;
}

export interface StageNodeBindingPackagesOptions {
  artifactsDir?: string;
  requireAllTargets?: boolean;
}

export interface StagedNodeBindingPackages {
  binaryPackages: PublishablePackage[];
  cleanup(): void;
  missingTargets: NodeBindingTarget[];
  rootPackage: PublishablePackage;
  stagedTargets: NodeBindingTarget[];
}

interface NapiTriplesConfig {
  additional?: string[];
  defaults?: boolean;
}

interface NodeBindingManifest extends Record<string, unknown> {
  author?: string;
  authors?: string | string[];
  bugs?: Record<string, unknown>;
  description?: string;
  engines?: Record<string, unknown>;
  files?: string[];
  homepage?: string;
  keywords?: string[];
  license?: string;
  main?: string;
  name: string;
  napi?: {
    name?: string;
    triples?: NapiTriplesConfig;
  };
  optionalDependencies?: Record<string, string>;
  os?: string[];
  cpu?: string[];
  libc?: string[];
  publishConfig?: Record<string, unknown>;
  repository?: Record<string, unknown>;
  version: string;
}

interface BindingArtifact {
  fileName: string;
  path: string;
  platformArchABI: string;
}

export const nodeBindingPackage: PublishablePackage = {
  name: "@tsgo-rs/node",
  path: resolve(rootDir, "npm/tsgo_rs_node"),
  access: "public",
};

export const typescriptOxlintPackage: PublishablePackage = {
  name: "typescript-oxlint",
  path: resolve(rootDir, "npm/typescript_oxlint"),
};

export const npmPackages = [nodeBindingPackage, typescriptOxlintPackage];

const defaultTargetTriples = [
  "x86_64-pc-windows-msvc",
  "x86_64-apple-darwin",
  "x86_64-unknown-linux-gnu",
] as const;

const sysToNodePlatform: Record<string, string> = {
  android: "android",
  darwin: "darwin",
  freebsd: "freebsd",
  linux: "linux",
  windows: "win32",
};

const cpuToNodeArch: Record<string, string> = {
  aarch64: "arm64",
  arm: "arm",
  armv7: "arm",
  i686: "ia32",
  riscv64: "riscv64",
  universal: "universal",
  x86_64: "x64",
};

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function pickDefined<T extends Record<string, unknown>, K extends keyof T>(
  input: T,
  keys: readonly K[],
): Partial<Pick<T, K>> {
  const output: Partial<Pick<T, K>> = {};
  for (const key of keys) {
    if (input[key] !== undefined) {
      output[key] = input[key];
    }
  }
  return output;
}

export function parseTargetTriple(rawTriple: string): NodeBindingTarget {
  const normalized = rawTriple.endsWith("eabi") ? `${rawTriple.slice(0, -4)}-eabi` : rawTriple;
  const parts = normalized.split("-");
  let cpu: string;
  let sys: string;
  let abi: string | null = null;

  if (parts.length === 4) {
    [cpu, , sys, abi = null] = parts;
  } else if (parts.length === 3) {
    [cpu, , sys] = parts;
  } else {
    [cpu, sys] = parts;
  }

  const platform = sysToNodePlatform[sys] ?? sys;
  const arch = cpuToNodeArch[cpu] ?? cpu;
  const target: NodeBindingTarget = {
    abi,
    arch,
    platform,
    platformArchABI: abi ? `${platform}-${arch}-${abi}` : `${platform}-${arch}`,
    raw: rawTriple,
  };

  if (abi === "gnu") {
    target.libc = "glibc";
  } else if (abi === "musl") {
    target.libc = "musl";
  }

  return target;
}

export function getNodeBindingTargets(
  packageJson = readJson<NodeBindingManifest>(resolve(nodeBindingPackage.path, "package.json")),
): NodeBindingTarget[] {
  const useDefaults = packageJson.napi?.triples?.defaults !== false;
  const additionalTargets = packageJson.napi?.triples?.additional ?? [];
  return [...(useDefaults ? defaultTargetTriples : []), ...additionalTargets].map(
    parseTargetTriple,
  );
}

export function createBinaryPackageManifest(
  rootManifest: NodeBindingManifest,
  version: string,
  target: NodeBindingTarget,
  binaryFileName: string,
): NodeBindingManifest {
  const manifest: NodeBindingManifest = {
    ...pickDefined(rootManifest, [
      "author",
      "authors",
      "bugs",
      "description",
      "engines",
      "homepage",
      "keywords",
      "license",
      "publishConfig",
      "repository",
    ]),
    files: [binaryFileName],
    main: binaryFileName,
    name: `${rootManifest.name}-${target.platformArchABI}`,
    os: [target.platform],
    version,
  };

  if (target.arch !== "universal") {
    manifest.cpu = [target.arch];
  }

  if (target.libc) {
    manifest.libc = [target.libc];
  }

  return manifest;
}

export function createRootBindingPublishManifest(
  rootManifest: NodeBindingManifest,
  version: string,
  stagedTargets: readonly NodeBindingTarget[],
): NodeBindingManifest {
  const manifest: NodeBindingManifest = {
    ...rootManifest,
    optionalDependencies: Object.fromEntries(
      stagedTargets.map((target) => [`${rootManifest.name}-${target.platformArchABI}`, version]),
    ),
    version,
  };

  if (Array.isArray(manifest.files)) {
    manifest.files = manifest.files.filter((entry) => entry !== "*.node");
  }

  return manifest;
}

function createBinaryPackageReadme(packageName: string, target: NodeBindingTarget): string {
  return `# \`${packageName}-${target.platformArchABI}\`\n\nThis is the **${target.raw}** binary for \`${packageName}\`\n`;
}

function findFilesRecursive(directory?: string): string[] {
  if (!directory) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      return findFilesRecursive(entryPath);
    }
    return [entryPath];
  });
}

function collectBindingArtifacts(options: {
  binaryName: string;
  searchRoots: readonly string[];
}): Map<string, BindingArtifact> {
  const artifacts = new Map<string, BindingArtifact>();

  for (const root of options.searchRoots) {
    for (const filePath of findFilesRecursive(root)) {
      const fileName = basename(filePath);
      if (!fileName.startsWith(`${options.binaryName}.`) || !fileName.endsWith(".node")) {
        continue;
      }

      const platformArchABI = fileName.slice(options.binaryName.length + 1, -".node".length);
      if (!artifacts.has(platformArchABI)) {
        artifacts.set(platformArchABI, {
          fileName,
          path: filePath,
          platformArchABI,
        });
      }
    }
  }

  return artifacts;
}

function copyRootBindingPackage(stagePath: string): void {
  cpSync(nodeBindingPackage.path, stagePath, {
    filter(sourcePath) {
      if (sourcePath === nodeBindingPackage.path) {
        return true;
      }

      const relativePath = relative(nodeBindingPackage.path, sourcePath).replaceAll("\\", "/");
      if (relativePath.startsWith("npm/")) {
        return false;
      }
      if (relativePath.endsWith(".node")) {
        return false;
      }
      return true;
    },
    recursive: true,
  });
}

export function stageNodeBindingPackages({
  artifactsDir,
  requireAllTargets = false,
}: StageNodeBindingPackagesOptions = {}): StagedNodeBindingPackages {
  const rootManifest = readJson<NodeBindingManifest>(
    resolve(nodeBindingPackage.path, "package.json"),
  );
  const version = rootManifest.version;
  const binaryName = rootManifest.napi?.name ?? "index";
  const configuredTargets = getNodeBindingTargets(rootManifest);
  const searchRoots = artifactsDir ? [resolve(rootDir, artifactsDir)] : [nodeBindingPackage.path];

  if (!artifactsDir || !requireAllTargets) {
    searchRoots.push(nodeBindingPackage.path);
  }

  const artifacts = collectBindingArtifacts({
    binaryName,
    searchRoots: [...new Set(searchRoots)],
  });
  const missingTargets = configuredTargets.filter(
    (target) => !artifacts.has(target.platformArchABI),
  );

  if (requireAllTargets && missingTargets.length > 0) {
    throw new Error(
      `Missing native binding artifacts for: ${missingTargets.map((target) => target.platformArchABI).join(", ")}`,
    );
  }

  const stagedTargets = configuredTargets.filter((target) => artifacts.has(target.platformArchABI));
  if (stagedTargets.length === 0) {
    throw new Error("No native binding artifacts were found for the Node release packages.");
  }

  const stageDir = mkdtempSync(resolve(tmpdir(), "tsgo-rs-npm-stage-"));
  const stageRootPackagePath = resolve(stageDir, "tsgo_rs_node");

  copyRootBindingPackage(stageRootPackagePath);

  const stagedRootManifest = createRootBindingPublishManifest(
    readJson<NodeBindingManifest>(resolve(stageRootPackagePath, "package.json")),
    version,
    stagedTargets,
  );
  writeJson(resolve(stageRootPackagePath, "package.json"), stagedRootManifest);

  const binaryPackages = stagedTargets.map((target) => {
    const artifact = artifacts.get(target.platformArchABI);
    if (!artifact) {
      throw new Error(`Missing artifact for ${target.platformArchABI}`);
    }

    const packagePath = resolve(stageDir, "npm", target.platformArchABI);
    mkdirSync(packagePath, { recursive: true });
    writeJson(
      resolve(packagePath, "package.json"),
      createBinaryPackageManifest(stagedRootManifest, version, target, artifact.fileName),
    );
    writeFileSync(
      resolve(packagePath, "README.md"),
      createBinaryPackageReadme(stagedRootManifest.name, target),
      "utf8",
    );
    copyFileSync(artifact.path, resolve(packagePath, artifact.fileName));
    return {
      access: nodeBindingPackage.access,
      name: `${stagedRootManifest.name}-${target.platformArchABI}`,
      path: packagePath,
    };
  });

  return {
    binaryPackages,
    cleanup() {
      rmSync(stageDir, { recursive: true, force: true });
    },
    missingTargets,
    rootPackage: {
      ...nodeBindingPackage,
      path: stageRootPackagePath,
    },
    stagedTargets,
  };
}

export async function withStagedNodeBindingPackages<T>(
  options: StageNodeBindingPackagesOptions,
  callback: (staged: StagedNodeBindingPackages) => Promise<T> | T,
): Promise<T> {
  const staged = stageNodeBindingPackages(options);
  try {
    return await callback(staged);
  } finally {
    staged.cleanup();
  }
}

export function withPackedTarball<T>(
  pkg: PublishablePackage,
  callback: (tarballPath: string) => T,
): T {
  const packDir = mkdtempSync(resolve(tmpdir(), "tsgo-rs-npm-pack-"));
  try {
    runCommand(pnpmCommand, ["pack", "--pack-destination", packDir], { cwd: pkg.path });
    const tarballName = readdirSync(packDir).find((entry) => entry.endsWith(".tgz"));
    if (!tarballName) {
      throw new Error(`Failed to pack npm tarball for ${pkg.name}`);
    }
    return callback(resolve(packDir, tarballName));
  } finally {
    rmSync(packDir, { recursive: true, force: true });
  }
}

export function publishPackedTarball(
  pkg: PublishablePackage,
  { dryRun = false, tag }: { dryRun?: boolean; tag?: string } = {},
): void {
  withPackedTarball(pkg, (tarballPath) => {
    const args = ["publish", tarballPath];
    if (pkg.access) {
      args.push("--access", pkg.access);
    }
    if (tag) {
      args.push("--tag", tag);
    }
    if (dryRun) {
      args.push("--dry-run");
    }
    runCommand(npmCommand, args, { cwd: rootDir });
  });
}

export { rootDir, sleep };
