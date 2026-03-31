# Release Guide

This document is the operational release guide for `tsgo-rs`.

## Distribution Decisions

Public Rust crates:

- `tsgo-rs-core`
- `tsgo-rs-runtime`
- `tsgo-rs-jsonrpc`
- `tsgo-rs-client`
- `tsgo-rs-lsp`
- `tsgo-rs-orchestrator`
- `tsgo-rs`

Internal Rust crates:

- `tsgo-rs-ref`
- `tsgo-rs-node`

Repository-local npm packages:

- `npm/tsgo_rs_node`
- `npm/typescript_oxlint`

The npm packages remain private for now.
They are validated through build and package dry-runs, but they are not yet part
of the public npm release contract until the native multi-platform distribution
story is finalized.

## Rust Publish Order

Publish crates in dependency order:

1. `tsgo-rs-core`
2. `tsgo-rs-runtime`
3. `tsgo-rs-jsonrpc`
4. `tsgo-rs-client`
5. `tsgo-rs-lsp`
6. `tsgo-rs-orchestrator`
7. `tsgo-rs`

## Dry Run

Local dry run:

```bash
vp run -w release_dry_run
```

This performs:

- `cargo package` for every public Rust crate
- a temporary workspace patch overlay so interdependent unpublished crates can be packaged before the first crates.io release
- `npm pack --dry-run` for the repository-local npm packages

CI also runs the same release dry-run workflow.

## Release Checks

Before publishing Rust crates:

- `vp check`
- `cargo clippy --workspace --all-targets -- -D warnings`
- `vp run -w test`
- `vp run -w verify_ref`
- `vp run -w bench_verify`
- `cargo deny check advisories bans licenses sources`
- `vp run -w release_dry_run`

## Changelog Expectations

Each public release should ship with GitHub release notes that call out:

- changed public crates
- any experimental-surface changes
- breaking changes or required upgrades
- benchmark or regression notes when performance-sensitive behavior changed

## Automation

Workflows:

- `CI`: quality, experimental-surface validation, real-`tsgo` smoke, and benchmark verification
- `Release Dry Run`: validates publishable artifacts without publishing them
- `Publish Rust`: manual crates.io publish path for the public Rust crates
- `Supply Chain`: runs dependency policy checks

The Rust publish workflow is intentionally separate from the dry run so that
artifact validation stays cheap and safe on pull requests.

For dependency-policy and advisory handling, see [./supply_chain_policy.md](./supply_chain_policy.md).
