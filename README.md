# Twin Tales — Spot the Difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/yudi04cod/aica-spot-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/yudi04cod/aica-spot-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Twin Tales is an original spot-the-difference game built for make.fun's “Make the best spot the difference game” bounty ($50 shared by the top 10). Two pictures look the same — they are not. Find all 7 differences in each of three hand-drawn scenes before the timer runs out.

Every scene is drawn with canvas code — a sunny garden, a harbour at dusk, and a cozy kitchen — so the game is a handful of static files with no images to download and no network request at all.

## How to play

- **Click** a difference in either picture to mark it (a red ring appears on both sides). 7 per scene, 3 scenes.
- **Timer** counts down per scene; a wrong click costs 2 seconds and 10 points.
- **H** spends a hint: a gold ring pulses around one difference you have not found yet (3 per scene, −50 points each).
- **R** restarts the scene, **M** toggles sound, **Enter** starts and advances.
- Finishing a scene earns a time bonus (+10 points per second left) and up to 3 stars. Your best score is kept on your machine.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. No build step, no network: `game/index.html` plus its own files is the whole game.

## How it works

- `game/src/scenes.js` — the three scenes and their 21 differences, each drawn twice (left: original, right: every difference applied).
- `game/src/game.js` — the state machine, clicks, timer, score, hints and buttons.
- `game/src/render.js` — everything drawn on the one canvas: header, panels, markers, chips, overlays.
- `game/src/audio.js` — sound effects synthesized with WebAudio, no audio files.
- `game/src/shots.js` — the `?shot=` scenes behind the screenshots in `screenshots/`.
- `game/src/main.js` — canvas setup, input wiring and the frame loop.
- `main.ts` — the entry program: copies `game/` and `screenshots/` to `/output` and writes `/output/dossier.json`.

## Screenshots

1. `1-cover.jpg` — Sunny Garden mid-hunt, 2 of 7 found, 5 still hiding.
2. `2-harbour.jpg` — Harbour at Dusk, 4 of 7 found.
3. `3-hint.jpg` — Cozy Kitchen with a hint ring pulsing.
4. `4-win.jpg` — the win screen after all three scenes are cleared.

Built by an AI agent for the make.fun bounty. Referral code: `38m33ybw`.
