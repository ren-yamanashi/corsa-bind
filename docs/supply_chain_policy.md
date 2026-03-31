# Supply Chain Policy

This document defines the minimum dependency and release-hardening policy for
`tsgo-rs`.

## Rust Dependency Gates

- `cargo deny check advisories bans licenses sources` is the required CI gate for Rust dependencies.
- Pull requests should not merge while `cargo-deny` is failing.
- Releases should not proceed unless the same `cargo-deny` gate is green.

## Advisory Handling

When a Rust advisory or policy violation appears:

- prefer upgrading or replacing the dependency first
- if a temporary exception is necessary, record it in [`deny.toml`](../deny.toml) with a short comment and an issue or upstream reference
- remove temporary exceptions as soon as the dependency graph allows it

Releases should be blocked for unresolved critical advisories unless there is a
documented and reviewed exception.

## npm Dependencies

The repository currently keeps its npm packages private and validates them with
build and `npm pack --dry-run` checks rather than a public npm publish gate.

For now, npm dependency hygiene is handled through:

- lockfile review in pull requests
- Dependabot updates
- private-package dry-run validation during release checks

If the npm packages become public artifacts later, this policy should be
revisited and expanded with a stronger npm-specific advisory gate.

## Release Hardening

Before publishing public Rust crates, the manual publish workflow is expected to
pass:

- workspace checks and linting
- cross-surface test coverage
- pinned upstream verification
- benchmark guards
- `cargo-deny`
- release dry-run validation

SBOM generation and provenance attestation are future hardening targets for the
first public binary/artifact distribution flow.
