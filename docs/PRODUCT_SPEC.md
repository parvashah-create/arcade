# Arcade for Obsidian — Version 1 Product Specification

## Product idea

Arcade is an Obsidian community plugin that places a small monochrome game console inside the workspace. Its interface should feel native to Obsidian, while its games should feel constrained, immediate, and nostalgic.

The visual principle is:

> Obsidian on the outside. 1977 on the inside.

## Version 1 goal

Version 1 proves the complete experience with one playable game:

1. Install and enable the plugin.
2. Open Arcade from the ribbon or command palette.
3. See a monochrome library headed by a large `ARCADE` title.
4. Select game `01 INVADERS` with the keyboard or pointer.
5. Choose one of sixteen single-player variations and difficulty `A` or `B`.
6. Play the same endless, score-driven invasion loop as the Atari 2600 reference.
7. Return to the library without leaving the Arcade view.
8. Close and reopen the view without leaving a game loop or sound running.

`Invaders` is a working title for an original game inspired by fixed-screen alien shooters. Its name, enemies, and presentation will be original rather than copied from a commercial game.

Its mechanical fidelity target is the 1980 Atari 2600 version of Space Invaders. Version 1 reproduces its default one-player experience and all sixteen one-player variation combinations while deliberately retaining Arcade's original monochrome presentation.

## Product principles

### Native shell

- Use Obsidian's workspace view, ribbon, command, typography, focus behavior, and CSS variables.
- Respect both light and dark themes.
- Keep navigation accessible with HTML buttons and visible keyboard focus.

### Monochrome console

- Use only two visual roles: background and foreground.
- Derive both roles from the active Obsidian theme.
- Do not add gradients, shadows, textured backgrounds, or decorative color.
- Render gameplay at a deliberately low logical resolution with hard pixel edges.

### Immediate play

- Require no account, network connection, setup wizard, or vault files.
- Make every screen operable by keyboard.
- Keep transitions quick and quiet.

### Original cartridges

- Recreate and study classic mechanics without bundling commercial ROMs, names, artwork, or audio.
- Give every included game its own original identity.
- Keep the game contract small enough that new cartridges can be added independently.

## User interface

### Entry points

Arcade opens from either:

- A gamepad-style icon in Obsidian's left ribbon.
- The command palette command `Monochrome Arcade: Open arcade`.

The command should have a suggested hotkey of `Cmd/Ctrl + Shift + A`. Obsidian owns final hotkey assignment so users can resolve conflicts with their existing commands.

### View behavior

- Arcade opens as a custom workspace tab, not a modal.
- Invoking the command again reveals the existing Arcade tab instead of opening duplicates.
- The tab title is `Arcade` and uses the same icon as the ribbon action.
- Closing or hiding the tab pauses the active game.
- Reopening the tab returns to the library in version 1.

### Library screen

The library is sparse and vertically centered when space allows:

```text
ARCADE

01  INVADERS

1 GAME
↑↓ SELECT   ENTER PLAY
```

- `ARCADE` is the largest text in the view.
- Games appear as a numbered list.
- The focused game uses inverse monochrome: foreground becomes background and background becomes foreground.
- Arrow keys move selection.
- `Enter` starts the selected game.
- Clicking or tapping a title selects and starts it.
- The count uses correct singular and plural forms.

### Game screen

```text
01 INVADERS                      000120

┌─────────────────────────────────────┐
│        ▄ ▄   ▄ ▄   ▄ ▄              │
│        █▄█   █▄█   █▄█              │
│                                     │
│          ▀            ·             │
│                                     │
│  ▄▄▄       ▄▄▄       ▄▄▄            │
│                  ▲                  │
└─────────────────────────────────────┘

P / ESC PAUSE MENU
```

- The game canvas preserves its aspect ratio and remains centered.
- The score and control hints are HTML outside the canvas.
- `P` or `Escape` opens a pause menu and pauses the simulation.
- The pause menu provides `RESUME`, `RESTART`, `SOUND ON/OFF`, `GAME SETUP`, and `ARCADE LIBRARY` actions.
- Arrow keys move the visible pause-menu selection and `Enter` activates it.
- Losing shows a monochrome result panel with restart, setup, and library actions.

### Cartridge setup screen

Selecting `INVADERS` first presents a compact setup screen:

```text
INVADERS

GAME       01
DIFFICULTY B

MOVING SHIELDS     OFF
ZIGZAG BOMBS       OFF
FAST BOMBS         OFF
INVISIBLE INVADERS OFF

ENTER PLAY   ESC LIBRARY
```

- Left and right change the game number from `01` through `16`.
- Up and down move a visible cursor between game, difficulty, play, and library rows.
- `Enter` starts play from either configuration row; `Escape` returns to the library.
- Pointer and touch users can change values with the visible stepper buttons.
- The four modifier labels explain the selected game number rather than requiring the player to decode it.
- Difficulty `B` uses the smaller reference cannon and is the default.
- Difficulty `A` uses a cannon twice as wide, matching the harder console switch setting.
- A plain-language description beneath `DIFFICULTY` explains both settings without requiring Atari knowledge.
- The setup remembers the most recently selected game and difficulty.

## First game: Invaders

### Concept

The player moves a defensive ship along the bottom of the screen, fires upward, and clears a descending formation before it reaches the ground.

This game teaches multiple entities, projectile lifetimes, formation movement, destructible cover, collision groups, lives, scoring, waves, audio timing, configurable rule combinations, and transitions between playing and losing.

### Controls

- `Arrow Left` or `A`: move ship left.
- `Arrow Right` or `D`: move ship right.
- `Space`: fire or restart after losing.
- `P`: pause or resume.
- `Escape`: leave the game.

### Rules

- The player begins with three lives.
- A formation of thirty-six invaders begins near the top of the screen in six rows of six.
- The formation moves horizontally in discrete steps.
- Reaching a horizontal boundary makes the formation reverse and descend.
- The player may have only one projectile on screen at a time.
- The player cannot fire again until the projectile hits a target or leaves the top of the screen.
- Invaders continually drop bombs toward the player.
- Three shields protect the player and lose cells when hit from either direction.
- Shields disappear when the invaders descend close enough to them.
- Rows award `5`, `10`, `15`, `20`, `25`, and `30` points from bottom to top.
- A complete formation is worth `630` points.
- Destroying invaders gradually increases the formation's movement speed.
- Clearing the formation creates a new formation closer to the defense line.
- Later formations continue starting at the closest supported position indefinitely.
- A harmless command ship periodically crosses the top and is worth `200` points.
- The four-digit score temporarily disappears while the command ship occupies its area.
- The displayed score is capped at `9999`, while saved high-score data may retain the full value.
- The player loses a life when hit by an enemy projectile.
- A hit briefly pauses the action before play resumes, matching the reference rhythm.
- The run ends when all lives are lost or the formation reaches the defense line.
- The highest local score is saved in plugin data.

### Single-player variations

Games `01` through `16` represent every combination of four reference modifiers:

| Modifier | Behavior |
| --- | --- |
| Moving shields | All three shields move horizontally instead of remaining fixed. |
| Zigzag bombs | Enemy bombs weave horizontally as they descend. |
| Fast bombs | Enemy bombs descend at the faster reference speed. |
| Invisible invaders | The formation is hidden during play and appears briefly whenever an invader is hit. |

The game number is a four-bit combination of those modifiers:

| Games | Added modifier |
| --- | --- |
| Even-numbered games | Moving shields |
| `03–04`, `07–08`, `11–12`, `15–16` | Zigzag bombs |
| `05–08`, `13–16` | Fast bombs |
| `09–16` | Invisible invaders |

Game `01` is the basic mode. Game `16` enables all four modifiers.

### Audio rules

- Generate sounds with the Web Audio API rather than copied samples.
- Play a repeating mechanical formation pulse whose cadence follows invasion speed.
- Give firing, invader destruction, player damage, and the command ship distinct primitive cues.
- Stop or suspend audio immediately when the game pauses, hides, or closes.
- Respect the saved mute setting.

### Visual rules

- Use a `160 × 192` logical canvas.
- Scale the canvas to fit using nearest-neighbor rendering.
- Draw the ship, invaders, shields, and projectiles as original block-pixel silhouettes.
- Animate invaders with two simple poses so formation movement feels mechanical.
- Do not add particles, glow, screen curvature, scanline overlays, or simulated CRT noise in version 1.

### Fidelity boundary

Version 1 aims to match the Atari 2600 reference's rules, timing relationships, difficulty, scoring, and single-player variations. It intentionally differs in these areas:

- The visual palette is monochrome and follows the active Obsidian theme.
- Sprites, title, and generated sound shapes are original.
- Keyboard and pointer controls replace the joystick and console switches.
- The setup screen explains variations that the original selected by game number.
- Pause, library navigation, and persisted high scores are plugin conveniences.

The primary gameplay reference is Atari's 1980 instruction manual: <https://atarionline.org/wp-content/uploads/2021/11/space-invaders-1978-atari-2600-game-instructions-manual.pdf>.

## Technical design

### Runtime layers

```text
ArcadePlugin
    owns commands, ribbon action, view registration, and saved data

ArcadeView
    owns the visible library/game screen and its lifecycle

ArcadeController
    owns navigation state and the currently selected cartridge

GameHost
    owns canvas, input, animation timing, audio, pause, and cleanup

ArcadeGame
    owns one game's state, rules, update, and rendering
```

Ownership matters because every animation frame and event listener must stop when its owner closes. This prevents a hidden game from continuing to consume power or respond to keystrokes.

### Game contract

Each cartridge implements a small shared interface:

```ts
interface ArcadeGame {
  readonly metadata: GameMetadata;
  start(): void;
  update(stepSeconds: number, input: InputSnapshot): void;
  render(context: CanvasRenderingContext2D): void;
  pause(): void;
  resume(): void;
  stop(): void;
}
```

The game does not know about Obsidian, workspace tabs, or saved files. That separation makes game logic testable outside the application.

### Timing

- Use `requestAnimationFrame` to schedule drawing.
- Advance physics with a fixed `1/60` second update step.
- Accumulate elapsed time when rendering is irregular.
- Cap accumulated time so returning from a suspended tab cannot trigger hundreds of catch-up updates.
- Pause when the view is not visible or Obsidian loses focus.

The fixed update step makes motion deterministic across 60 Hz, 120 Hz, and other displays. Rendering frequency and simulation speed are related, but they are not the same thing.

### Input

- Store key state rather than moving game objects directly inside `keydown` events.
- Prevent default browser behavior only for keys consumed while the game has focus.
- Clear held keys when the window loses focus to prevent stuck movement or firing.
- Keep command and menu navigation separate from gameplay input.

### Rendering

- Use semantic HTML for the library, score, controls, and results.
- Use Canvas 2D only for the moving playfield.
- Disable canvas interpolation when scaling.
- Read foreground and background colors from CSS custom properties.
- Re-read colors when the view renders so theme changes are reflected.

### Persistence

Use Obsidian's plugin data storage for:

```ts
interface ArcadeData {
  version: 1;
  highScores: Record<string, number>;
  muted: boolean;
}
```

Do not create notes or other files in the user's vault for version 1.

## Proposed source layout

```text
src/
├── main.ts
├── arcade-view.ts
├── arcade-controller.ts
├── core/
│   ├── game.ts
│   ├── game-host.ts
│   ├── game-loop.ts
│   ├── input-manager.ts
│   ├── audio-engine.ts
│   └── palette.ts
├── games/
│   └── invaders/
│       ├── invaders-game.ts
│       ├── formation.ts
│       └── collisions.ts
└── ui/
    ├── library-screen.ts
    └── game-screen.ts
```

## Version 1 acceptance criteria

Version 1 is complete when:

- The plugin builds with no TypeScript or lint errors.
- Ribbon and command entry points reveal a single Arcade view.
- Library navigation works with keyboard, mouse, and trackpad.
- Invaders can be started, played, cleared into another wave, lost, restarted, paused, and exited.
- The default mode contains thirty-six invaders, three shields, three lives, exact row values, and the command ship.
- All sixteen single-player variation combinations behave according to the game matrix.
- Difficulty `A` and `B` change the cannon hit area correctly.
- Formation entry height advances after each clear and stops at the closest supported position.
- The mechanical pulse and action cues track play and stop during pause or cleanup.
- Gameplay speed remains consistent on displays with different refresh rates.
- High score survives disabling and enabling the plugin.
- The interface remains legible in Obsidian's default light and dark themes.
- Library, setup, and game screens share one centered console shell and stable outer geometry.
- All keyboard-controlled screens show the selected row or action with inverse monochrome.
- No animation frame, timer, or keyboard listener survives closing the view.
- The plugin uses no network connection, remote code, ROM, or copied game asset.

## Explicitly deferred

- ROM loading and Atari hardware emulation
- Multiplayer games `17–112`
- Touch controls and mobile-specific layouts
- Gamepad support
- CRT filters and visual effects
- Save states, achievements, and leaderboards
- Additional cartridges

These are deferred to keep the first release small, complete, and educational. The architecture leaves room for them without requiring them now.

## Build sequence

1. Scaffold the official TypeScript plugin structure.
2. Register the ribbon action, command, and custom view.
3. Build the monochrome library screen.
4. Build the cartridge setup and variation matrix.
5. Implement the reusable game host and fixed-step loop.
6. Implement the default Invaders mechanics and rendering.
7. Match reference scoring, waves, shields, command ship, and difficulty.
8. Implement the four combinable single-player modifiers.
9. Add generated audio, persistence, pause behavior, and cleanup.
10. Test all modes, themes, resizing, and hot reloads.
