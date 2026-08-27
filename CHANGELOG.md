# Changelog

All notable changes to Arcade are documented in this file.

The project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.2] - 2026-08-27

### Fixed

- Restored `Left` and `Right` arrow movement during gameplay.
- Automatically pauses without stealing focus when the game loses keyboard ownership.
- Releases arrow keys to other Obsidian panes in split view and resumes when the game regains focus.
- Made side-by-side setup actions navigable with `Left` and `Right`.

## [0.1.1] - 2026-08-27

### Changed

- Renamed the public plugin from Monochrome Arcade to Arcade.
- Expanded the README to celebrate the project's Atari 2600-era design inspiration.

## [0.1.0] - 2026-08-27

### Added

- Arcade library integrated with the active Obsidian theme.
- Original Invaders game with sixteen one-player variations and two difficulty settings.
- Keyboard navigation for the library, setup screen, gameplay, and pause menu.
- Generated sound effects, persistent sound preference, and local high-score storage.
- Responsive desktop layout, lifecycle-safe pausing, and focus restoration between Obsidian tabs.
- Pop-out-window-aware input, animation scheduling, palette lookup, and resize handling.
- Automated tests, linting, production builds, and GitHub release artifacts.

[Unreleased]: https://github.com/parvashah-create/arcade/compare/0.1.2...HEAD
[0.1.2]: https://github.com/parvashah-create/arcade/compare/0.1.1...0.1.2
[0.1.1]: https://github.com/parvashah-create/arcade/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/parvashah-create/arcade/releases/tag/0.1.0
