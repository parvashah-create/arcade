# Version 1 Test Report

Date: 2026-08-27

Repository: project root

Sandbox vault: dedicated local development vault

## Automated checks

- `npm run lint`: pass
- `npm run test`: pass — 47 tests in 13 files
- `npm run build`: pass
- `npm run verify:metadata`: pass
- `git diff --check`: pass

The automated suite covers persisted-data repair, controller state transitions, deterministic randomness, rectangle and swept collisions, 60 Hz timing, sound-event mapping, all sixteen game-mode flags, formation movement, shield erosion, game initialization, player firing, scoring, invisible-mode visibility, score formatting, cannon symmetry, library selection, view-focus restoration, setup explanations and controls, pause-menu sound and navigation, pointer actions, broad tooltip-label regression, and publication-metadata consistency.

## Sandbox installation

- Plugin build output: `main.js` in the repository root
- Local plugin link: `.obsidian/plugins/arcade → <repository>`
- Community plugin enable list contains `arcade` and `hot-reload`
- Hot Reload version `0.3.1` is installed and the development watcher rebuilds successfully
- Installed desktop test version is Obsidian `1.9.12`, matching `minAppVersion`.

## Manual checks pending in Obsidian

These require observing the desktop app and must be completed in the sandbox vault before release:

- [ ] Enable Arcade in the sandbox vault without a console error.
- [ ] Open one Arcade tab from the ribbon and command palette.
- [ ] Assign `Cmd+Shift+A` or `Ctrl+Shift+A` and verify the command opens Arcade.
- [ ] Verify repeated opening reveals the same tab.
- [ ] Verify keyboard-only library, setup, play, pause, restart, and return flows.
- [ ] Verify pointer-only setup and result controls.
- [ ] Verify all game numbers `01–16` and difficulties `A` and `B`.
- [ ] Verify default light and dark Obsidian themes remain monochrome and legible.
- [ ] Verify responsive rendering in a narrow pane and a wide pane.
- [ ] Verify high score, mode, difficulty, and mute choice persist after plugin reload.
- [ ] Verify game motion and sound stop on pause, tab hide, view close, and plugin disable.
- [ ] Inspect Obsidian developer tools after lifecycle testing for console errors.

## Ongoing fidelity work

The current constants make the full gameplay loop functional. Future releases can continue comparing legal reference play against historical manuals and tune only the named constants in `src/games/invaders/constants.ts` for formation cadence, descent, projectile speed, enemy fire cadence, command-ship timing, and wave height. This research is not required for Community-directory compliance because Arcade is presented as an original early-console-inspired game rather than an emulator or exact commercial-game reproduction.

## Known intentional deviations

- Original title, artwork, sprites, and recorded sounds are not used.
- The game is rendered in two theme-derived monochrome roles rather than the source game's colors.
- Keyboard/pointer controls and an explanatory setup screen replace joystick and console switches.
- Pause, setup persistence, mute preference, and high-score storage are Obsidian conveniences.
- Multiplayer game numbers `17–112` are deferred.

## Release blockers

- Complete and record the remaining manual sandbox verification above, especially a clean-vault install from release artifacts.
- Commit and push the complete source tree to the default branch.
- Change the GitHub repository visibility from private to public before submission.
- Publish the public GitHub release tagged exactly `0.1.0`.
- Sign in, connect the repository owner's GitHub account, accept the developer policies, and submit through the Obsidian Community directory.

## Publication metadata completed

- Manifest author and author URL use the repository owner identity.
- The repository and package use the MIT License.
- The plugin ID `arcade` is not present in the current official community-plugin registry.
- The release workflow verifies the exact tag, runs the full check, attests the build artifacts, and uploads `main.js`, `manifest.json`, and `styles.css`.
- The release and versioning process is documented in `docs/RELEASING.md`.
