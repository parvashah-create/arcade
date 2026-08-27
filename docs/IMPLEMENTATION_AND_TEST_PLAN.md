# Arcade for Obsidian — Implementation and Test Plan

## Purpose

This document is the authoritative execution plan for version 1. It is written so an implementation agent can work through it mechanically without redesigning the product.

Read [PRODUCT_SPEC.md](PRODUCT_SPEC.md) completely before starting. When this document and the product specification differ, this implementation plan controls technical structure and the product specification controls user-visible behavior.

## Handoff instruction

Give the implementation agent this instruction:

> Implement `docs/IMPLEMENTATION_AND_TEST_PLAN.md` in order. Complete one phase at a time, run its exit-gate commands, and fix failures before continuing. Do not add features, dependencies, copied assets, ROMs, React, Rust, WebAssembly, or network access. Mark each task complete in the plan as it is verified. Stop and report evidence if a product decision is genuinely missing.

## Non-negotiable constraints

- The plugin ID is `arcade`.
- The plugin entry language is strict TypeScript.
- Use the official Obsidian sample plugin build structure and `esbuild` configuration.
- Use native DOM for library, setup, HUD, pause, and game-over interfaces.
- Use Canvas 2D only for the moving playfield.
- Use Web Audio oscillators and noise generated at runtime; do not ship audio samples.
- Use no runtime dependencies other than Obsidian.
- Use Vitest only as a development dependency for automated tests.
- Keep all simulation rules independent of Obsidian, DOM, Canvas, AudioContext, and wall-clock time.
- Support desktop for the initial keyboard-first release, but do not import Node or Electron APIs. Keep `isDesktopOnly` true until mobile controls are designed and tested.
- Use only foreground and background colors derived from Obsidian CSS variables.
- Do not download, bundle, parse, or execute ROM files.
- Do not copy the original title, sprites, artwork, source code, or audio samples.
- Match the documented Atari 2600 mechanics and timing relationships using original presentation.
- Defer multiplayer games `17–112`.

## Primary references

- Product behavior: `docs/PRODUCT_SPEC.md`
- Atari mechanics and game matrix: <https://atarionline.org/wp-content/uploads/2021/11/space-invaders-1978-atari-2600-game-instructions-manual.pdf>
- Obsidian starter: <https://github.com/obsidianmd/obsidian-sample-plugin>
- Obsidian developer documentation: <https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin>
- Obsidian lifecycle guidance: <https://docs.obsidian.md/plugins/guides/lifecycle-management>

Do not commit downloaded reference material. The manual is a behavioral reference, not a distributable project asset.

## Definition of done

Version 1 is done only when all of the following are true:

- Every phase in this document is complete.
- `npm run check` passes from a clean install.
- Every automated test listed here exists and passes.
- Every manual test listed here has a recorded pass in `docs/TEST_REPORT.md`.
- The plugin loads in a dedicated Obsidian test vault without console errors.
- Ribbon, command palette, and `Mod+Shift+A` reveal one shared Arcade view.
- All sixteen single-player game variations work.
- Difficulty `A` and `B` work.
- The default game matches the documented counts, scoring, waves, shields, command ship, and three-hit rule.
- Hiding, pausing, closing, disabling, or unloading the plugin stops input, animation, and sound.
- The release contains only the expected plugin artifacts.

## Technical decisions

### Toolchain

- Node.js: current active LTS supported by the official sample plugin.
- Package manager: npm with a committed `package-lock.json`.
- Bundler: esbuild using the official sample configuration.
- Type checking: TypeScript strict mode.
- Linting: ESLint plus `eslint-plugin-obsidianmd` from the official starter.
- Unit tests: Vitest with Node by default and jsdom for focused UI interaction tests.
- Formatting: follow existing ESLint rules; do not add Prettier.

### Plugin manifest

Use these fixed publication values:

```json
{
  "id": "arcade",
  "name": "Arcade",
  "version": "0.1.0",
  "minAppVersion": "1.9.12",
  "description": "Play original monochrome arcade games inspired by early home consoles.",
  "author": "parvashah-create",
  "authorUrl": "https://github.com/parvashah-create",
  "isDesktopOnly": true
}
```

`1.9.12` is the oldest desktop build used for the full sandbox test pass.

### Suggested hotkey

Register `Arcade: Open game library` without a default hotkey to comply with current community-plugin guidance. Recommend `Mod+Shift+A` in the README and let users assign it in Obsidian's Hotkeys settings.

### Logical display

- Canvas backing size: exactly `160 × 192` logical pixels.
- CSS size: responsive, preserving `5:6` aspect ratio.
- Context setting: `imageSmoothingEnabled = false` after every canvas resize or context acquisition.
- Simulation rate: fixed `60 Hz` with `STEP_SECONDS = 1 / 60`.
- Maximum frame delta: `250 ms`.
- Maximum updates per animation frame: `5`.
- Render positions by rounding simulation coordinates to whole logical pixels.

### Coordinate convention

- Origin `(0, 0)` is the top-left of the logical canvas.
- Positive `x` points right.
- Positive `y` points down.
- Rectangles use `{ x, y, width, height }`.
- Rectangle right and bottom edges are exclusive.
- Gameplay constants live in one file and are not duplicated as unexplained literals.

## Target file tree

The implementation must converge on this structure. Do not create index-barrel files unless an import cycle forces a narrowly scoped one.

```text
.
├── .github/
│   └── workflows/
│       └── release.yml
├── docs/
│   ├── IMPLEMENTATION_AND_TEST_PLAN.md
│   ├── PRODUCT_SPEC.md
│   └── TEST_REPORT.md
├── src/
│   ├── main.ts
│   ├── arcade-view.ts
│   ├── arcade-controller.ts
│   ├── data.ts
│   ├── core/
│   │   ├── game.ts
│   │   ├── game-host.ts
│   │   ├── game-loop.ts
│   │   ├── input-manager.ts
│   │   ├── audio-engine.ts
│   │   ├── geometry.ts
│   │   ├── palette.ts
│   │   └── random.ts
│   ├── games/
│   │   └── invaders/
│   │       ├── constants.ts
│   │       ├── types.ts
│   │       ├── mode.ts
│   │       ├── formation.ts
│   │       ├── shields.ts
│   │       ├── collisions.ts
│   │       ├── invaders-game.ts
│   │       └── invaders-renderer.ts
│   └── ui/
│       ├── library-screen.ts
│       ├── setup-screen.ts
│       └── game-screen.ts
├── tests/
│   ├── data.test.ts
│   ├── arcade-controller.test.ts
│   ├── core/
│   │   ├── game-loop.test.ts
│   │   ├── geometry.test.ts
│   │   └── random.test.ts
│   └── invaders/
│       ├── mode.test.ts
│       ├── formation.test.ts
│       ├── shields.test.ts
│       ├── collisions.test.ts
│       └── invaders-game.test.ts
├── esbuild.config.mjs
├── eslint.config.mts
├── manifest.json
├── package-lock.json
├── package.json
├── styles.css
├── tsconfig.json
├── version-bump.mjs
├── versions.json
└── vitest.config.ts
```

## Required contracts

Define these contracts before implementing behavior. Exact file placement is specified above.

### Persisted data

`src/data.ts`:

```ts
export type InvadersDifficulty = 'A' | 'B';

export interface ArcadeDataV1 {
  version: 1;
  muted: boolean;
  highScores: {
    invaders: number;
  };
  invaders: {
    gameNumber: number;
    difficulty: InvadersDifficulty;
  };
}
```

Also export:

- `DEFAULT_ARCADE_DATA`
- `parseArcadeData(value: unknown): ArcadeDataV1`

`parseArcadeData` must validate and repair data. It must never trust `loadData()` output, never throw for malformed user data, clamp the game number to `1–16`, reject negative or non-finite scores, and default unknown versions safely.

### Arcade navigation

`src/arcade-controller.ts` owns this pure state:

```ts
export type ArcadeScreen =
  | { kind: 'library'; selectedGameId: 'invaders' }
  | { kind: 'setup'; gameId: 'invaders' }
  | { kind: 'game'; gameId: 'invaders' };
```

Required actions:

- `OPEN_GAME_SETUP`
- `START_GAME`
- `RETURN_TO_LIBRARY`
- `RETURN_TO_SETUP`

Do not store DOM nodes or Obsidian objects in the controller.

### Input snapshot

`src/core/game.ts`:

```ts
export interface InputSnapshot {
  leftHeld: boolean;
  rightHeld: boolean;
  firePressed: boolean;
  pausePressed: boolean;
  backPressed: boolean;
}
```

`firePressed`, `pausePressed`, and `backPressed` are edge-triggered: true for one simulation update after a new press. Left and right are held state. When both left and right are held, horizontal intent is zero.

### Game events

The simulation emits events; it does not play sound or update HTML directly:

```ts
export type GameEvent =
  | { type: 'SHOT_FIRED' }
  | { type: 'INVADER_DESTROYED'; row: number; points: number }
  | { type: 'COMMAND_SHIP_ENTERED' }
  | { type: 'COMMAND_SHIP_DESTROYED'; points: 200 }
  | { type: 'PLAYER_HIT'; livesRemaining: number }
  | { type: 'FORMATION_PULSE'; pulseIndex: 0 | 1 | 2 | 3 }
  | { type: 'WAVE_CLEARED'; wave: number }
  | { type: 'GAME_OVER'; reason: 'NO_LIVES' | 'INVASION' };
```

The audio engine consumes relevant events. The game screen consumes score, lives, wave, and phase from a snapshot.

### Game interface

`src/core/game.ts`:

```ts
export interface ArcadeGame<TSnapshot> {
  start(): void;
  update(stepSeconds: number, input: InputSnapshot): readonly GameEvent[];
  getSnapshot(): Readonly<TSnapshot>;
  stop(): void;
}
```

Rendering is intentionally separate. `InvadersRenderer` receives a read-only snapshot and draws it. This prevents Canvas concerns from contaminating game-rule tests.

### Randomness

`src/core/random.ts` defines:

```ts
export interface RandomSource {
  next(): number; // [0, 1)
}
```

Provide:

- A small seeded implementation for tests and reproducible games.
- A production factory seeded once when a run starts.

Never call `Math.random()` inside game modules.

### Pause ownership

`GameHost` tracks pause reasons as a set:

```ts
type PauseReason = 'user' | 'hidden-view' | 'window-blur';
```

The game runs only when the set is empty. Removing one reason must not clear the others. This prevents focus restoration from accidentally overriding a user pause.

## Atari fidelity rules

Implement these as explicit state and constants, not incidental renderer behavior.

### Formation

- Create six rows of six invaders: thirty-six total.
- Preserve each invader's original row for scoring after it descends.
- Move the formation in discrete horizontal steps.
- Determine horizontal bounds from living invaders only.
- When the next horizontal step would cross a bound, reverse direction and descend instead of taking that horizontal step.
- Shorten the movement interval monotonically as the living count decreases.
- Toggle between two animation poses on formation movement pulses.
- Trigger invasion when the lowest living invader reaches the defense line.

Put the movement interval lookup or formula in `games/invaders/constants.ts`. Do not scatter timing numbers across update code.

### Player and firing

- Clamp the cannon between visible left and right boundary markers.
- Difficulty `B` uses the base cannon width.
- Difficulty `A` uses exactly twice that collision width.
- Fire only on a press edge.
- Allow at most one player projectile.
- Do not allow another shot until the projectile hits something or leaves the top.
- Use the same projectile restriction in all sixteen single-player games.

### Scoring

- Bottom row: `5` points per invader.
- Next rows upward: `10`, `15`, `20`, `25`, and `30`.
- Total formation value: `630`.
- Command ship: `200`.
- Internal score may exceed four digits.
- HUD display uses `Math.min(score, 9999)` padded to four digits.
- Hide the score while the command ship occupies the score area; reveal it again when the ship leaves or is destroyed.

### Lives and death

- Begin with three hits remaining.
- Show remaining hits at the bottom of the playfield.
- On a player hit, decrement once, remove dangerous projectiles, and enter a short non-interactive hit pause.
- Resume the same formation and damaged shields after the hit pause.
- End the run at zero remaining hits.
- End the run immediately on invasion regardless of remaining hits.

### Waves

- Clearing all thirty-six invaders emits `WAVE_CLEARED`.
- The next formation begins closer to the defense line.
- Increase starting height by a constant wave step until a maximum start height is reached.
- Continue generating formations indefinitely at that maximum height.
- Preserve score and remaining hits across waves.
- Restore shields for each new formation unless reference calibration proves otherwise; record the final decision in `docs/TEST_REPORT.md`.

### Shields

- Create exactly three shields.
- Represent each shield as a small boolean cell grid, not as a single health number.
- Player shots and enemy bombs remove cells in the collision area.
- Projectiles may pass through holes.
- Remove every shield when the descending formation reaches the documented proximity threshold.
- Moving-shield mode moves the grids horizontally without changing their damage.
- Reverse shield movement at playfield limits.

### Command ship

- Spawn periodically after play begins.
- Alternate or deterministically choose entry side through `RandomSource`.
- Move across the top without firing.
- Award `200` on hit.
- Despawn after leaving the opposite side.
- Ensure its lifecycle is deterministic under a seeded random source.

### Enemy bombs

- Spawn bombs from a living invader that has no living invader beneath it in the same column.
- Keep bomb cadence in constants and calibrate it against reference play.
- Normal bombs descend vertically.
- Fast-bomb mode uses exactly twice the normal vertical speed.
- Zigzag mode alternates horizontal direction while descending and remains within the playfield.
- A bomb damages the first shield cell or player rectangle it intersects.
- Use swept vertical collision or equivalent sub-stepping so fast bombs cannot tunnel through shields or the cannon.

### Sixteen one-player games

Implement mode decoding with bit flags from `gameNumber - 1`:

```text
bit 0: moving shields
bit 1: zigzag bombs
bit 2: fast bombs
bit 3: invisible invaders
```

Therefore:

- Even games enable moving shields.
- Games `03–04`, `07–08`, `11–12`, and `15–16` enable zigzag bombs.
- Games `05–08` and `13–16` enable fast bombs.
- Games `09–16` enable invisible invaders.
- Game `01` enables none.
- Game `16` enables all four.

Invisible mode rules:

- Invaders are visible during initial ready presentation.
- Invaders become hidden when active play begins.
- Hitting one reveals all remaining invaders for a short constant duration.
- The renderer alone applies visibility; collisions and simulation continue normally while hidden.

## Implementation phases

Do not reorder phases. Each phase ends with a gate. Fix the gate before starting the next phase.

### Phase 0 — Repository safety and baseline

Tasks:

- [ ] Read `README.md`, `docs/PRODUCT_SPEC.md`, and this document completely.
- [ ] Run `git status --short` and preserve all existing user changes.
- [ ] Confirm Node and npm versions.
- [ ] Confirm the workspace is not the user's primary Obsidian vault.
- [ ] Record the starting git status in the implementation log or final handoff.
- [ ] Do not commit or create a branch unless explicitly requested.

Exit gate:

```bash
git status --short
node --version
npm --version
```

Expected: commands succeed and no unexpected files are modified.

### Phase 1 — Official plugin scaffold

Tasks:

- [ ] Copy the current official sample plugin configuration files into the repository without overwriting `README.md` or `docs/`.
- [ ] Set package name and manifest ID to `arcade`.
- [ ] Set version to `0.1.0` in `package.json`, `manifest.json`, and `versions.json`.
- [ ] Set `main` to `main.js` and package type to `module`, matching the official starter.
- [ ] Set manifest values from this plan.
- [ ] Remove every sample command, setting, notice, interval, and comment from `src/main.ts`.
- [ ] Add Vitest and scripts:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "check": "npm run lint && npm run test && npm run build"
}
```

- [ ] Configure Vitest for the Node environment and test files under `tests/**/*.test.ts`.
- [ ] Ensure production build still produces one `main.js` bundle.

Exit gate:

```bash
npm install
npm run lint
npm run test
npm run build
```

Expected: lint and build pass; Vitest reports no failing tests. A temporary placeholder test is allowed only in this phase and must be removed in Phase 2.

### Phase 2 — Pure contracts, data validation, and test foundation

Tasks:

- [ ] Create `src/data.ts`, `src/core/game.ts`, `src/core/geometry.ts`, and `src/core/random.ts`.
- [ ] Implement the required contracts exactly.
- [ ] Implement AABB overlap using exclusive right and bottom edges.
- [ ] Implement a vertical swept collision helper for projectile travel between previous and next positions.
- [ ] Implement deterministic seeded randomness.
- [ ] Implement `parseArcadeData` with repair behavior.
- [ ] Remove any placeholder test.

Automated tests:

- [ ] Default data is returned for `null`, arrays, strings, and unknown versions.
- [ ] Valid settings survive parsing.
- [ ] Game numbers below `1` become `1`; above `16` become `16`.
- [ ] Invalid difficulty becomes `B`.
- [ ] Negative, `NaN`, and infinite scores become `0`.
- [ ] AABB touching edges do not overlap.
- [ ] AABB overlapping by one logical unit does overlap.
- [ ] Swept collision detects a fast projectile crossing a thin target.
- [ ] Equal seeds produce equal random sequences.
- [ ] Different seeds produce different sequences in a reasonable sample.

Exit gate:

```bash
npm run check
```

### Phase 3 — Obsidian shell and single-view lifecycle

Tasks:

- [ ] Define `ARCADE_VIEW_TYPE = 'arcade-view'` in `arcade-view.ts` and export it.
- [ ] Implement `ArcadeView extends ItemView`.
- [ ] Return `Arcade` from `getDisplayText()`.
- [ ] Return `gamepad-2` from `getIcon()` and use the same icon for the ribbon.
- [ ] Set `navigation = false` because the view is a fixed application surface.
- [ ] Register the view in `main.ts`.
- [ ] Add ribbon tooltip `Open game library`.
- [ ] Add command ID `open` and name `Open game library` without a default hotkey.
- [ ] Implement one shared `activateView()` method used by ribbon and command.
- [ ] In `activateView()`, reveal an existing leaf of `ARCADE_VIEW_TYPE`; otherwise use `workspace.getLeaf('tab')`, set its view state, and reveal it.
- [ ] Do not read `leaf.view` until after `await workspace.revealLeaf(leaf)`.
- [ ] Never create a second Arcade leaf when one already exists.
- [ ] Let Obsidian own registered-view teardown during plugin unload.
- [ ] Render a temporary semantic heading in `onOpen()`.
- [ ] Empty the container and release owned components in `onClose()`.

Manual tests:

- [ ] Ribbon opens Arcade.
- [ ] Command palette opens Arcade.
- [ ] Assign `Cmd+Shift+A` on macOS or `Ctrl+Shift+A` elsewhere and verify it opens Arcade.
- [ ] Repeated activation reveals the same tab.
- [ ] Closing and reopening works.
- [ ] Disabling and enabling the plugin works without restarting Obsidian.
- [ ] No console error references deferred views or stale leaves.

Exit gate:

```bash
npm run check
```

Do not continue until the shell is manually proven inside Obsidian.

### Phase 4 — Navigation, library, and setup UI

Tasks:

- [ ] Implement the pure `ArcadeController` state machine.
- [ ] Implement `LibraryScreen` with a real heading and real button.
- [ ] Display `ARCADE`, `01 INVADERS`, `1 GAME`, and control hints.
- [ ] Focus the selected game when the library renders.
- [ ] Support pointer activation and `Enter`.
- [ ] Implement `SetupScreen` with game number `01–16`, difficulty `A/B`, and four decoded modifier labels.
- [ ] Use native buttons for stepper, play, and back actions.
- [ ] Support up/down selection, left/right changes, `Enter` to play, and `Escape` to return.
- [ ] Never insert user-controlled strings through `innerHTML`.
- [ ] Add only plugin-prefixed CSS classes beginning with `arcade-`.
- [ ] Use `--background-primary` and `--text-normal` as the two palette sources.
- [ ] Use inverse foreground/background for focus and selection.
- [ ] Make focus visible without introducing a third color.

Automated tests:

- [ ] Controller starts on library.
- [ ] Library-to-setup transition works.
- [ ] Setup-to-game transition works.
- [ ] Game-to-setup and setup-to-library transitions work.
- [ ] Invalid actions do not produce invalid screen state.
- [ ] Mode decoder returns the expected flags for all numbers `1–16`.

Manual tests:

- [ ] Complete flow using keyboard only.
- [ ] Complete flow using pointer only.
- [ ] Confirm focus is always visible.
- [ ] Confirm default light and dark themes use only two visual roles.
- [ ] Resize the pane narrow, wide, and short; no control becomes unreachable.

Exit gate:

```bash
npm run check
```

### Phase 5 — Fixed-step loop, input, and host cleanup

Tasks:

- [ ] Implement `GameLoop` with injected `requestFrame`, `cancelFrame`, and clock functions so it is testable.
- [ ] Use the fixed-step, accumulator, delta cap, and update cap defined above.
- [ ] Render once per animation callback after updates.
- [ ] Implement `InputManager` as an Obsidian `Component` or child component owned by `GameHost`.
- [ ] Listen only while the game screen owns focus.
- [ ] Map arrows/A/D, Space, P, and Escape.
- [ ] Prevent default only for consumed keys while gameplay is active.
- [ ] Ignore repeated `keydown` events for edge-triggered actions.
- [ ] Clear state on window blur.
- [ ] Implement pause-reason set semantics.
- [ ] Ensure `stop()` is idempotent.
- [ ] Cancel the animation frame, unload input, and suspend audio on stop.

Automated tests:

- [ ] Sixty `1/60` seconds of supplied time produces sixty updates.
- [ ] A simulated 120 Hz display does not double simulation speed.
- [ ] A `500 ms` frame is capped and does not exceed five updates.
- [ ] Paused loop performs no updates but may render the pause state once.
- [ ] Starting twice does not create two animation chains.
- [ ] Stopping twice does not throw.
- [ ] Removing `window-blur` does not resume while `user` remains.
- [ ] Fire is true for one snapshot after a non-repeat press.
- [ ] Left and right together produce neutral movement.
- [ ] Blur clears held movement.

Exit gate:

```bash
npm run check
```

### Phase 6 — Default Invaders simulation

Tasks:

- [ ] Define all game constants in `games/invaders/constants.ts`.
- [ ] Define complete mutable internal state and read-only public snapshot types.
- [ ] Create thirty-six invaders in six rows of six.
- [ ] Implement player movement and difficulty-dependent width.
- [ ] Implement the single player projectile restriction.
- [ ] Implement formation step, reverse, descent, animation pose, and speed progression.
- [ ] Implement bottommost-in-column enemy bomb selection with injected randomness.
- [ ] Implement collision ordering and swept projectile checks.
- [ ] Implement three lives, player-hit pause, invasion, and game-over phases.
- [ ] Emit events rather than calling UI or audio.
- [ ] Keep `update()` deterministic for the same initial state, inputs, and random seed.

Automated tests:

- [ ] Initial snapshot has 36 invaders, 3 lives, score 0, wave 1.
- [ ] Difficulty A cannon width is exactly twice B.
- [ ] Player cannot leave horizontal bounds.
- [ ] Holding fire does not fire repeatedly without new press edges.
- [ ] A second player projectile cannot exist.
- [ ] Projectile is rearmed after hit or leaving the screen.
- [ ] Formation moves horizontally on a pulse.
- [ ] Formation reverses and descends at a live-invader boundary.
- [ ] Dead outside invaders no longer determine the formation edge.
- [ ] Formation interval never increases as living count falls.
- [ ] Enemy bombs originate from bottommost living invaders.
- [ ] One hit removes one life and enters hit pause.
- [ ] Hit pause prevents movement and firing.
- [ ] Third hit produces `NO_LIVES` game over.
- [ ] Crossing the defense line produces `INVASION` game over immediately.

Exit gate:

```bash
npm run check
```

### Phase 7 — Scoring, shields, command ship, and waves

Tasks:

- [ ] Implement row score lookup and events.
- [ ] Implement actual score separately from four-digit display score.
- [ ] Implement three cell-grid shields and bidirectional erosion.
- [ ] Implement projectile passage through existing holes.
- [ ] Remove shields at formation proximity threshold.
- [ ] Implement command ship timing, movement, hit, score hiding, and `200` points.
- [ ] Implement wave clear, next-wave height progression, and height cap.
- [ ] Preserve score and lives across waves.
- [ ] Restore shields according to the documented decision.

Automated tests:

- [ ] Six invaders from each row sum to `630`.
- [ ] Each row awards its exact value.
- [ ] Command ship awards exactly `200`.
- [ ] Display score pads to four digits and caps at `9999`.
- [ ] Actual score can exceed `9999`.
- [ ] Score visibility is false only while command ship occupies the score area.
- [ ] Player projectile damages a shield from below.
- [ ] Enemy bomb damages a shield from above.
- [ ] A projectile passes through an existing shield hole.
- [ ] Fast projectile sweep cannot tunnel through a shield.
- [ ] Shields disappear at proximity threshold.
- [ ] Final invader destruction starts a new wave after transition.
- [ ] New wave starts lower than the previous wave.
- [ ] Wave start height stops increasing at its cap.
- [ ] Score and lives survive wave transition.

Exit gate:

```bash
npm run check
```

### Phase 8 — Sixteen variation matrix

Tasks:

- [ ] Implement bit-flag decoder in `mode.ts`.
- [ ] Implement moving shields without losing damage state.
- [ ] Implement zigzag bomb horizontal movement.
- [ ] Implement exactly `2×` fast bomb speed.
- [ ] Implement invisible formation rendering state and timed reveal after a hit.
- [ ] Keep modifiers composable; do not create sixteen branches or subclasses.

Automated tests:

- [ ] Table-test all sixteen exact flag combinations.
- [ ] Moving shields remain fixed in odd modes and move in even modes.
- [ ] Moving shields reverse at both bounds.
- [ ] Damaged shield cells remain damaged while moving.
- [ ] Zigzag bombs change horizontal direction in enabled modes only.
- [ ] Fast bombs travel exactly twice the normal distance for equal simulated time.
- [ ] Invisible invaders are hidden after ready state.
- [ ] Hitting an invisible invader reveals remaining invaders temporarily.
- [ ] Reveal expires after the configured duration.
- [ ] Game 1 enables no modifiers.
- [ ] Game 16 enables all modifiers simultaneously.

Exit gate:

```bash
npm run check
```

### Phase 9 — Renderer and responsive game screen

Tasks:

- [ ] Implement `InvadersRenderer` with no game mutation.
- [ ] Clear the complete logical canvas every render.
- [ ] Draw only current foreground and background palette values.
- [ ] Draw original two-pose invaders, original cannon, projectiles, shields, command ship, boundary marks, and remaining-hit marks.
- [ ] Respect invisible-mode render state.
- [ ] Build HUD and controls as HTML outside the canvas.
- [ ] Add semantic pause and game-over overlays with buttons.
- [ ] Keep the canvas at `160 × 192` backing pixels while resizing its CSS box.
- [ ] Reapply pixelated scaling and `imageSmoothingEnabled = false`.
- [ ] Use `ResizeObserver` owned and disconnected by `GameHost`.
- [ ] Update palette after Obsidian theme changes without restarting the game.

Automated tests:

- [ ] Renderer does not mutate a deeply frozen snapshot.
- [ ] Invisible snapshot omits invader draw operations.
- [ ] Revealed invisible snapshot includes invader draw operations.
- [ ] Score formatter returns `0000`, padded intermediate scores, and `9999` cap.

Do not use full-canvas pixel snapshot tests. They are brittle and provide poor diagnostic value. Test renderer decisions with a minimal recording context, then visually inspect the final canvas.

Manual tests:

- [ ] Canvas remains sharp at several pane sizes.
- [ ] Aspect ratio never stretches.
- [ ] HUD is legible without adding a third color.
- [ ] Game-over actions work with keyboard and pointer.
- [ ] Theme changes recolor the running game.

Exit gate:

```bash
npm run check
```

### Phase 10 — Generated audio

Tasks:

- [ ] Create AudioContext only after a user gesture.
- [ ] Implement short procedural cues for shot, invader hit, player hit, and command ship.
- [ ] Implement a four-step mechanical formation pulse driven by `FORMATION_PULSE` events.
- [ ] Make pulse cadence follow simulation formation cadence, not an independent interval.
- [ ] Keep oscillator gain conservative.
- [ ] Add mute control and persist it.
- [ ] Suspend or silence immediately for every pause reason.
- [ ] Close or release audio resources on game stop and plugin unload.
- [ ] Never fetch remote audio or embed copied recordings.

Automated tests:

- [ ] Pure event-to-cue mapping selects the correct cue.
- [ ] Muted state produces no cue commands.
- [ ] Pulse indices cycle `0, 1, 2, 3, 0`.
- [ ] Pause prevents scheduled cues until all pause reasons clear.

Manual tests:

- [ ] Browser autoplay policy produces no console error before first gesture.
- [ ] Every cue is audible but not startling at normal system volume.
- [ ] Muting is immediate.
- [ ] No sound continues in another Obsidian tab, after view close, or after plugin disable.

Exit gate:

```bash
npm run check
```

### Phase 11 — Persistence and lifecycle integration

Tasks:

- [ ] Load and parse data before registering UI behavior that depends on it.
- [ ] Save game number and difficulty after setup changes.
- [ ] Save mute state after changes.
- [ ] Save a high score only when it increases.
- [ ] Debounce or coalesce saves; do not save every simulation update.
- [ ] Pause for inactive Arcade leaf and window blur.
- [ ] Resume only after the corresponding automatic pause reason clears.
- [ ] Preserve user pause independently.
- [ ] Stop the old game before starting a new one.
- [ ] Stop the game on return to setup or library.
- [ ] Stop and unload everything in `ArcadeView.onClose()`.
- [ ] Detach leaves and release plugin-owned state in `onunload()`.

Automated tests:

- [ ] Lower score never replaces persisted high score.
- [ ] Higher score replaces persisted high score once.
- [ ] Setup selection round-trips through parsed data.
- [ ] User pause survives blur and focus restoration.
- [ ] Hidden-view pause survives window focus restoration.
- [ ] Starting a replacement game stops the previous game exactly once.

Manual tests:

- [ ] High score survives view close.
- [ ] High score survives plugin disable/enable.
- [ ] Setup and mute settings survive Obsidian restart.
- [ ] No keyboard input affects a hidden Arcade view.
- [ ] No animation or sound continues after close or disable.
- [ ] Repeated open/play/back cycles do not multiply event handling.

Exit gate:

```bash
npm run check
```

### Phase 12 — Reference calibration

Purpose: tune constants without changing architecture or rules.

Tasks:

- [ ] Compare the default mode against legally accessed Atari 2600 reference play and the original manual.
- [ ] Do not add the ROM, screenshots, recordings, or copied assets to the repository.
- [ ] Calibrate formation step size and interval curve.
- [ ] Calibrate descent step, defense line, and shield-removal threshold.
- [ ] Calibrate player speed, projectile speed, normal bomb speed, and spawn cadence.
- [ ] Confirm fast bombs remain exactly twice normal speed.
- [ ] Calibrate hit pause, wave transition, invisible reveal, and command ship timing.
- [ ] Verify the increasing-pressure rhythm as invaders disappear.
- [ ] Record final constants and reference observations in `docs/TEST_REPORT.md`.
- [ ] Change only named constants during calibration. If architecture must change, document why before editing.

Manual comparison checklist:

- [ ] Opening seconds have comparable breathing room.
- [ ] A nearly cleared formation feels materially faster than a full formation.
- [ ] One-shot restriction creates comparable firing rhythm.
- [ ] Shield erosion meaningfully changes safe positions.
- [ ] Later formations create pressure by starting lower.
- [ ] Command ship distracts without attacking.
- [ ] Death pause and restart rhythm feel deliberate rather than modern and instant.

Exit gate:

```bash
npm run check
```

### Phase 13 — Full manual matrix and regression pass

Create `docs/TEST_REPORT.md` from this template:

```text
# Version 1 Test Report

Date:
Obsidian version:
Operating system:
Node version:
Commit/worktree description:

## Automated checks
- npm run lint:
- npm run test:
- npm run build:

## Manual checks
...

## Reference calibration
...

## Known deviations
...
```

Run and record:

- [ ] Game `01`: no modifiers.
- [ ] Game `02`: moving shields.
- [ ] Game `03`: zigzag bombs.
- [ ] Game `04`: moving shields + zigzag bombs.
- [ ] Game `05`: fast bombs.
- [ ] Game `06`: moving shields + fast bombs.
- [ ] Game `07`: zigzag + fast bombs.
- [ ] Game `08`: moving shields + zigzag + fast bombs.
- [ ] Game `09`: invisible invaders.
- [ ] Game `10`: invisible invaders + moving shields.
- [ ] Game `11`: invisible invaders + zigzag bombs.
- [ ] Game `12`: invisible + moving shields + zigzag bombs.
- [ ] Game `13`: invisible invaders + fast bombs.
- [ ] Game `14`: invisible + moving shields + fast bombs.
- [ ] Game `15`: invisible + zigzag + fast bombs.
- [ ] Game `16`: all four modifiers.
- [ ] Repeat default game once with difficulty `A` and once with `B`.
- [ ] Test default light theme.
- [ ] Test default dark theme.
- [ ] Test at minimum usable pane width.
- [ ] Test a tall narrow pane and a wide short pane.
- [ ] Test command, ribbon, and hotkey entry.
- [ ] Test keyboard-only navigation.
- [ ] Test pointer navigation.
- [ ] Test pause, blur, hidden tab, close, disable, and re-enable.
- [ ] Inspect the developer console for errors after every lifecycle test.

Exit gate:

```bash
npm run check
git diff --check
git status --short
```

### Phase 14 — Documentation and release readiness

Tasks:

- [x] Set the manifest author and author URL to the repository owner.
- [ ] Expand README with installation, controls, mode matrix, hotkey reassignment, fidelity boundary, privacy, and development commands.
- [ ] State clearly that no ROMs or copied game assets are included.
- [x] Include the MIT license selected for the public community release.
- [ ] Verify `versions.json` maps `0.1.0` to the chosen minimum Obsidian version.
- [ ] Verify release workflow uploads `main.js`, `manifest.json`, and `styles.css` individually.
- [ ] Verify the production bundle performs no network requests.
- [ ] Verify no temporary reference material, test vault, ROM, generated recording, or local path is tracked.
- [ ] Run the complete clean-install check.

Clean-install check:

```bash
npm ci
npm run check
```

Release artifact check:

```text
Required:
- main.js
- manifest.json
- styles.css

Forbidden:
- ROM files
- source maps in production
- remote-loaded code
- copied screenshots or audio
- node_modules
```

## Automated test quality rules

- Test observable behavior, not private method names.
- Use table tests for mode combinations and scoring rows.
- Use seeded randomness in every game test.
- Advance simulation with explicit fixed steps; never use real timers or sleeps.
- Never rely on test execution order.
- Reset all fakes between tests.
- Keep Canvas and AudioContext adapters thin; test their decisions, not browser internals.
- Avoid snapshots for large state objects and rendered canvases.
- A bug fix must add a failing regression test before or with the fix.
- No test may require network access, an Obsidian vault, or a ROM.

## Manual test quality rules

- Use a dedicated disposable vault.
- Record the exact Obsidian version and operating system.
- Keep developer tools open during lifecycle tests.
- Test at least one 60 Hz and one higher-refresh display when available.
- If only one display is available, use automated clock tests as the second timing check.
- Verify behavior, sound, and cleanup; visual resemblance alone is insufficient.
- Record failures and fixes in `docs/TEST_REPORT.md` rather than silently checking boxes.

## Scope protection

The implementation agent must not add any of the following to version 1:

- Multiplayer
- ROM loading or emulation
- React or another UI framework
- Rust or WebAssembly
- Mobile touch controls
- Gamepad support
- Online leaderboards
- Achievements
- CRT filters, scanlines, glow, particles, or screen curvature
- More cartridges
- Settings unrelated to mute, selected variation, or difficulty
- Telemetry, analytics, update checks, or any other network call

If one of these appears necessary, stop and explain the concrete blocker. Do not implement it preemptively.

## Final handoff checklist

The implementation agent's final response must report:

- Files added and materially changed.
- `npm run lint`, `npm run test`, and `npm run build` results.
- Automated test count.
- Manual Obsidian tests completed and any not completed.
- Exact known deviations from the Atari 2600 reference.
- Any remaining publication placeholders.
- Confirmation that no ROM, copied asset, network call, React, Rust, or WebAssembly was added.
