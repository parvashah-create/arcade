# Contributing to Monochrome Arcade

Thanks for helping improve Monochrome Arcade.

## Before you start

- Search existing GitHub issues before opening a new one.
- Use a dedicated test vault. Never develop plugins against an important vault.
- Do not add ROMs, copied sprites, copied audio, commercial game binaries, telemetry, ads, or runtime network dependencies.
- Keep the interface monochrome and derived from Obsidian theme variables.
- Preserve keyboard accessibility and visible focus on every interactive screen.

## Development setup

```bash
npm ci
npm run dev
```

Link the repository into a test vault at `.obsidian/plugins/arcade`, enable Monochrome Arcade, and use a hot-reload helper if desired.

## Verification

Run the full check before submitting a pull request:

```bash
npm run check
```

Add focused tests for changed mechanics or UI behavior. Keep game rules independent from Canvas rendering so they remain deterministic and testable.

## Pull requests

- Keep each pull request focused on one change.
- Explain the player-facing behavior and any compatibility impact.
- Update the README, changelog, or product specification when behavior changes.
- Do not commit `main.js`, `data.json`, development-vault files, or dependencies.

By contributing, you agree that your contribution is licensed under the repository's MIT License.
