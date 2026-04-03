# corsa-bind

Rust core, Node bindings, and TypeScript runtime layers for `typescript-go`
over stdio.

`corsa-bind` gives this repository a small, focused goal:

- talk to upstream `typescript-go` through supported API/LSP entry points
- keep the upstream checkout pinned by exact commit for reproducibility
- expose the hot path in Rust, with Node bindings on top
- build type-aware tooling such as `corsa-oxlint` without forking upstream

## Naming

`Corsa` is the codename for TypeScript's official native implementation, and
it is used in contrast with `Strada`, the existing JS-based implementation.

This repository standardizes on `Corsa` for its own APIs, docs, tasks, and
examples. Names like `tsgo` and `TypeScript 7` are likely to become ambiguous
later, once `tsc` defaults to the native implementation or the same codebase
continues under version numbers beyond 7. Using `Corsa` keeps the naming stable
even as upstream packaging and versioning evolve.

When this repo refers to literal upstream artifacts, it still uses their real
names where needed, such as `origin/typescript-go`.

> [!WARNING]
> The project is still `0.x`.
> Core Rust and Node bindings are usable, but some upstream-facing surfaces are
> still experimental and distributed orchestration remains feature-gated.

> [!IMPORTANT]
> This repository does not maintain a fork of `typescript-go`.
> `origin/typescript-go` is treated as a managed upstream checkout and verified
> against [`corsa_origin.lock.toml`](./corsa_origin.lock.toml).

## What You Get

- `corsa_bind_client`: typed Rust client for the Corsa stdio API
- `corsa_bind_lsp`: Rust LSP client with virtual-document support
- `corsa_bind_orchestrator`: local worker pooling and cache reuse
- `@corsa-bind/node`: native Node bindings built with `napi-rs`
- `src/bindings/typescript/typescript`: shared TypeScript transport and response layer
- `src/bindings/typescript/nodejs`, `src/bindings/typescript/bun`, `src/bindings/typescript/deno`, `src/bindings/typescript/browser`: runtime-specific TypeScript entrypoints
- `corsa-oxlint`: type-aware Oxlint helpers powered by Corsa
- `corsa_bind_ref`: tooling for syncing and verifying the pinned upstream repo

## Quick Start

Repository tasks are run through `vp` (Vite+).

Requirements:

- Rust toolchain
- Node `24`
- Go version compatible with [`origin/typescript-go/go.mod`](./origin/typescript-go/go.mod)

Sync the pinned upstream checkout:

```bash
vp run -w sync_origin
vp run -w verify_origin
```

Install dependencies, build, and run tests:

```bash
vp install
vp run -w build
vp test
```

Build the real pinned Corsa binary when you want real-upstream tests or examples:

```bash
vp run -w build_corsa
```

## Common Tasks

```bash
vp run -w build
vp test
vp run -w examples_smoke
vp run -w examples_real
vp run -w bench_native
vp run -w bench_ts
```

## Publishing

First manual Rust publish:

```bash
cargo login
vp check
vp run -w release_preflight
vp run -w publish_rust
```

First manual npm publish for `@corsa-bind/node`, the TypeScript packages, and
`corsa-oxlint`:

```bash
npm login
vp install
vp check
vp run -w release_preflight
NAPI_ARTIFACTS_DIR=./artifacts vp run -w publish_npm
```

`src/bindings/typescript/typescript`, `src/bindings/typescript/browser`,
`src/bindings/typescript/deno`, `src/bindings/typescript/nodejs`, and
`src/bindings/typescript/bun` all publish through that npm path.

`src/bindings/c`, `src/bindings/go`, `src/bindings/zig`, and
`src/bindings/moonbit` are still source-distributed today. Their release
vehicle is a tagged GitHub release built around the Rust C ABI rather than a
registry publish flow.

## Examples

Examples live in [`examples/`](./examples/README.md).

- smoke examples: `vp run -w examples_smoke`
- real pinned-Corsa examples: `vp run -w examples_real`
- experimental distributed Rust example: `vp run -w examples_rust_experimental`

## Upstream Tracking

`typescript-go` moves quickly, so this repo treats upstream tracking as a first-class part of development.

- exact pin metadata lives in [`corsa_origin.lock.toml`](./corsa_origin.lock.toml)
- managed checkout lives in `origin/typescript-go`
- dirty or branch-attached upstream state fails verification
- update workflow and policy are documented in [`docs/corsa_dependency.md`](./docs/corsa_dependency.md)

## Project Notes

- default API transport is msgpack over stdio
- unstable upstream endpoints such as `printNode` are opt-in
- published npm packages expect a caller-managed upstream Corsa executable
- the distributed layer is still behind the `experimental-distributed` cargo feature

## More Docs

- architecture and workspace tour: [`docs/project_guide.md`](./docs/project_guide.md)
- production and release posture: [`docs/production_readiness.md`](./docs/production_readiness.md)
- support and compatibility policy: [`docs/support_policy.md`](./docs/support_policy.md)
- CI and local reproduction notes: [`docs/ci_guide.md`](./docs/ci_guide.md)
- benchmarking notes: [`docs/benchmarking_guide.md`](./docs/benchmarking_guide.md)
- performance snapshots: [`docs/performance.md`](./docs/performance.md)
- release workflow: [`docs/release_guide.md`](./docs/release_guide.md)
- supply-chain policy: [`docs/supply_chain_policy.md`](./docs/supply_chain_policy.md)
- Node package details: [`src/bindings/nodejs/corsa_bind_node/README.md`](./src/bindings/nodejs/corsa_bind_node/README.md)
- TypeScript runtime layer: [`src/bindings/typescript/typescript/README.md`](./src/bindings/typescript/typescript/README.md)
- Browser runtime layer: [`src/bindings/typescript/browser/README.md`](./src/bindings/typescript/browser/README.md)
- `corsa-oxlint` details: [`src/bindings/nodejs/corsa_oxlint/README.md`](./src/bindings/nodejs/corsa_oxlint/README.md)
