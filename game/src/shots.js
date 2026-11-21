// Twin Tales — Spot the Difference: the screenshot scenes.
// One job: put the real game into the exact frame a screenshot should show,
// driven by `?shot=<name>`, so every screenshot is the game itself playing by
// its own rules — never a mock-up. The timer is frozen in a shot, so the frame
// is the same every time it is taken.

import { LEVELS } from './config.js';

/**
 * Stage `game` for the named shot and return true when one matched.
 * cover: level 1 mid-hunt, 2 of 7 found, markers on both panels, time left.
 * play2: level 2 deeper in, 4 of 7 found.
 * hint:  level 3 with one find and a hint ring pulsing on another difference.
 * win:   the final screen after all three scenes are cleared.
 */
export function stageShot(name, game) {
  if (name === 'cover') {
    game.startLevel(0);
    game.found = game.scene.differences.slice(0, 2);
    game.score = 250;
    game.timeLeft = 72;
    game.statusMessage = 'Found the sun\'s rays! 5 more to go.';
    game.frozen = true;
    return true;
  }
  if (name === 'play2') {
    game.startLevel(1);
    game.found = game.scene.differences.slice(0, 4);
    game.score = 640;
    game.timeLeft = 54;
    game.statusMessage = 'Found the boat\'s flag! 3 more to go.';
    game.frozen = true;
    return true;
  }
  if (name === 'hint') {
    game.startLevel(2);
    game.found = game.scene.differences.slice(0, 1);
    game.score = 830;
    game.timeLeft = 61;
    game.hintsLeft = LEVELS[2].hints - 1;
    game.hintTarget = game.scene.differences[3];
    game.hintTimer = 999;
    game.statusMessage = 'Hint: something hides near the gold ring (−50 points).';
    game.frozen = true;
    return true;
  }
  if (name === 'win') {
    game.startLevel(2);
    game.found = game.scene.differences.slice();
    game.score = 2140;
    game.timeLeft = 34;
    game.screen = 'win';
    game.bestScore = Math.max(game.bestScore, 2140);
    game.setWinButtons();
    game.frozen = true;
    return true;
  }
  return false;
}
