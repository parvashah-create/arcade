# Monochrome Arcade

Play original monochrome arcade games inside Obsidian.

Monochrome Arcade adds a keyboard-first game library that follows your Obsidian theme instead of looking like a separate app. The first release includes **Invaders**, an original fixed-screen shooter shaped by the constraints, rhythm, and variation-heavy design of early home consoles.

Why does this exist? I was bored. I also wanted to learn how old games created memorable systems with tiny sprites, simple sounds, and very little hardware.

## Features

- A monochrome interface derived from the active Obsidian theme.
- A gamepad ribbon action and the **Monochrome Arcade: Open arcade** command.
- Sixteen one-player Invaders variations.
- Two clearly explained difficulty settings.
- Keyboard-first library, setup, gameplay, and pause menus.
- Generated sound effects with a persistent sound preference.
- A local high score and remembered game setup.
- No accounts, ads, telemetry, network requests, or ROM loading.

## Requirements

- Obsidian `1.9.12` or newer.
- Desktop Obsidian for the initial release. Gameplay currently requires a physical keyboard.

## Installation

### Community Plugins

After Monochrome Arcade is accepted into the Obsidian Community directory:

1. Open **Settings → Community plugins**.
2. Select **Browse** and search for **Monochrome Arcade**.
3. Select **Install**, then **Enable**.

### Manual installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest GitHub release.
2. Create `<vault>/.obsidian/plugins/arcade/`.
3. Place all three files directly inside that folder.
4. Reload Obsidian and enable **Monochrome Arcade** under **Settings → Community plugins**.

## How to play

Open Monochrome Arcade from the gamepad ribbon icon or the command palette.

| Screen | Controls |
| --- | --- |
| Library | `Up` / `Down` selects a game; `Enter` opens setup. |
| Setup | `Up` / `Down` selects a row; `Left` / `Right` changes it; `Enter` plays; `Escape` returns to the library. |
| Invaders | `Left` / `Right` or `A` / `D` moves; `Space` fires. |
| Pause menu | `P` or `Escape` pauses; arrow keys select an action; `Enter` confirms. |

For quick access, assign your preferred shortcut to **Monochrome Arcade: Open arcade** under **Settings → Hotkeys**. Monochrome Arcade intentionally does not claim a default shortcut, which avoids conflicts with existing user hotkeys.

### Difficulty

- `B` uses a smaller cannon and is easier to keep out of enemy fire.
- `A` uses a wider cannon and creates a larger target.

### One-player variations

The sixteen game numbers combine four rule modifiers:

| Modifier | Enabled in games |
| --- | --- |
| Moving shields | Even-numbered games |
| Zigzag bombs | `03–04`, `07–08`, `11–12`, `15–16` |
| Fast bombs | `05–08`, `13–16` |
| Invisible invaders | `09–16` |

Game `01` is the basic mode. Game `16` enables all four modifiers. Multiplayer variations are not included in the initial release.

## Privacy and permissions

Monochrome Arcade stores only these values in Obsidian's plugin data:

- Selected game variation.
- Selected difficulty.
- Sound preference.
- Local Invaders high score.

Monochrome Arcade does not read or modify notes, access files outside the vault, connect to remote services, collect analytics, display ads, or update itself. Disabling or closing the plugin stops its input, animation loop, and audio.

## Originality and trademarks

Monochrome Arcade is an independent community project. It is not affiliated with or endorsed by Obsidian, Atari, Taito, or any game publisher.

All gameplay code, interface code, sprites, and synthesized sounds in this repository were created for Monochrome Arcade. The plugin includes no commercial ROMs, copied source code, copied artwork, copied audio, or original game binaries. Historical product names in development documents identify mechanical research references only; all third-party names and trademarks belong to their respective owners.

## Development

Use a dedicated development vault rather than your main vault.

```bash
npm ci
npm run dev
```

Run the complete verification suite before opening a pull request:

```bash
npm run check
```

The project uses TypeScript, Canvas 2D, Web Audio, Vitest, ESLint, and esbuild. Runtime code uses Obsidian and browser APIs only; build tooling uses Node.js.

See [CONTRIBUTING.md](CONTRIBUTING.md) for development expectations and [docs/RELEASING.md](docs/RELEASING.md) for the release process.

## Support

- Report reproducible bugs through [GitHub Issues](https://github.com/parvashah-create/arcade/issues).
- Include your Obsidian version, operating system, Monochrome Arcade version, and reproduction steps.
- Review [CHANGELOG.md](CHANGELOG.md) before reporting an issue fixed in a newer release.
- Report security-sensitive problems privately as described in [SECURITY.md](SECURITY.md).

## Project documents

- [Product specification](docs/PRODUCT_SPEC.md)
- [Implementation and test plan](docs/IMPLEMENTATION_AND_TEST_PLAN.md)
- [Current test report](docs/TEST_REPORT.md)
- [Release guide](docs/RELEASING.md)
- [Community submission checklist](docs/SUBMISSION_CHECKLIST.md)

## License

Monochrome Arcade is available under the [MIT License](LICENSE).
