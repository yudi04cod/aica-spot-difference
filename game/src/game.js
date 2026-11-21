// Twin Tales — Spot the Difference: the game state and rules.
// One job: own the state machine (title, play, level complete, game over, win),
// the clicks and keys, the timer, the score, the hints, and the buttons the
// renderer draws. It knows nothing about pixels except through hit-testing.

import {
  CANVAS_WIDTH, CANVAS_HEIGHT, SCENE_WIDTH, SCENE_HEIGHT, PANEL_WIDTH, PANEL_HEIGHT,
  PANEL_Y, LEFT_PANEL_X, RIGHT_PANEL_X, BUTTONS_Y, BUTTON_HEIGHT, COLORS, LEVELS,
  HIT_RADIUS, WRONG_CLICK_TIME_PENALTY, WRONG_CLICK_SCORE_PENALTY, FIND_POINTS,
  TIME_BONUS_PER_SECOND, HINT_COST, HINT_SECONDS, starsForTimeLeft,
} from './config.js';
import { SCENES } from './scenes.js';
import { SoundFX } from './audio.js';

const BEST_KEY = 'twin-tales-best-score';

function makeButton(x, y, w, h, label, color, action) {
  return { x, y, w, h, label, color, action, hover: false };
}

export class Game {
  constructor() {
    this.sound = new SoundFX();
    this.muted = false;
    this.screen = 'title';
    this.levelIndex = 0;
    this.scene = SCENES[0];
    this.found = [];
    this.hintsLeft = LEVELS[0].hints;
    this.hintTarget = null;
    this.hintTimer = 0;
    this.timeLeft = LEVELS[0].time;
    this.score = 0;
    this.bestScore = Number(localStorage.getItem(BEST_KEY) ?? 0) || 0;
    this.elapsed = 0;
    this.missMarks = [];
    this.burst = null;
    this.statusMessage = 'Find 7 differences — click one in either picture to mark it.';
    this.statusColor = COLORS.headerText;
    this.lastTickSecond = -1;
    this.frozen = false;

    this.ui = {
      hintButton: { x: 1152, y: 12, w: 104, h: 30, hover: false },
      muteButton: { x: 1152, y: 46, w: 104, h: 30, hover: false },
      actionButtons: [],
    };
    this.setTitleButtons();
  }

  // --- screens ----------------------------------------------------------------

  setTitleButtons() {
    this.ui.actionButtons = [
      makeButton(CANVAS_WIDTH / 2 - 130, BUTTONS_Y + 8, 260, BUTTON_HEIGHT, '▶  START GAME', COLORS.buttonGreen, 'start'),
    ];
  }

  setLevelCompleteButtons() {
    const last = this.levelIndex === SCENES.length - 1;
    this.ui.actionButtons = [
      makeButton(CANVAS_WIDTH / 2 - 130, BUTTONS_Y + 8, 260, BUTTON_HEIGHT,
        last ? 'SEE RESULTS' : 'NEXT LEVEL  ▶', COLORS.buttonGreen, 'next'),
    ];
  }

  setGameOverButtons() {
    this.ui.actionButtons = [
      makeButton(CANVAS_WIDTH / 2 - 270, BUTTONS_Y + 8, 260, BUTTON_HEIGHT, '↻  RETRY LEVEL', COLORS.button, 'retry'),
      makeButton(CANVAS_WIDTH / 2 + 10, BUTTONS_Y + 8, 260, BUTTON_HEIGHT, 'MENU', COLORS.buttonRed, 'menu'),
    ];
  }

  setWinButtons() {
    this.ui.actionButtons = [
      makeButton(CANVAS_WIDTH / 2 - 270, BUTTONS_Y + 8, 260, BUTTON_HEIGHT, '↻  PLAY AGAIN', COLORS.buttonGreen, 'restart'),
      makeButton(CANVAS_WIDTH / 2 + 10, BUTTONS_Y + 8, 260, BUTTON_HEIGHT, 'MENU', COLORS.button, 'menu'),
    ];
  }

  startLevel(index) {
    this.levelIndex = index;
    this.scene = SCENES[index];
    this.found = [];
    this.hintsLeft = LEVELS[index].hints;
    this.hintTarget = null;
    this.hintTimer = 0;
    this.timeLeft = LEVELS[index].time;
    this.missMarks = [];
    this.burst = null;
    this.lastTickSecond = -1;
    this.screen = 'play';
    this.statusMessage = `Find ${this.scene.differences.length} differences in ${this.scene.name} — click one in either picture.`;
    this.statusColor = COLORS.headerText;
    this.ui.actionButtons = [];
  }

  startGame() {
    this.score = 0;
    this.startLevel(0);
  }

  toTitle() {
    this.screen = 'title';
    this.levelIndex = 0;
    this.scene = SCENES[0];
    this.found = [];
    this.setTitleButtons();
  }

  // --- the tick -----------------------------------------------------------------

  update(delta) {
    this.elapsed += delta;
    if (this.frozen) return;

    for (const mark of this.missMarks) mark.life -= delta * 1.6;
    this.missMarks = this.missMarks.filter((m) => m.life > 0);
    if (this.burst) {
      this.burst.life -= delta * 1.4;
      if (this.burst.life <= 0) this.burst = null;
    }
    if (this.hintTimer > 0) {
      this.hintTimer -= delta;
      if (this.hintTimer <= 0) this.hintTarget = null;
    }

    if (this.screen !== 'play') return;
    this.timeLeft -= delta;
    const whole = Math.ceil(this.timeLeft);
    if (whole <= 10 && whole !== this.lastTickSecond && whole > 0) {
      this.lastTickSecond = whole;
      this.sound.tick();
    }
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.gameOver();
    }
  }

  gameOver() {
    this.screen = 'over';
    this.statusMessage = "Time's up — the differences still hiding are circled in gold.";
    this.statusColor = COLORS.missMark;
    this.setGameOverButtons();
  }

  levelComplete() {
    const bonus = Math.round(this.timeLeft) * TIME_BONUS_PER_SECOND;
    this.score += bonus;
    const stars = starsForTimeLeft(this.timeLeft, LEVELS[this.levelIndex].time);
    this.statusMessage = `Level complete — ${stars} star${stars === 1 ? '' : 's'} and +${bonus} time bonus!`;
    this.statusColor = COLORS.foundCheck;
    this.sound.win();
    this.screen = 'levelComplete';
    this.setLevelCompleteButtons();
  }

  finishGame() {
    this.screen = 'win';
    this.statusMessage = 'All three scenes cleared — sharp eyes!';
    this.statusColor = COLORS.foundCheck;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem(BEST_KEY, String(this.bestScore));
    }
    this.setWinButtons();
  }

  // --- input ----------------------------------------------------------------------

  panelAt(x, y) {
    if (y < PANEL_Y || y > PANEL_Y + PANEL_HEIGHT) return null;
    if (x >= LEFT_PANEL_X && x <= LEFT_PANEL_X + PANEL_WIDTH) return { originX: LEFT_PANEL_X, side: 'left' };
    if (x >= RIGHT_PANEL_X && x <= RIGHT_PANEL_X + PANEL_WIDTH) return { originX: RIGHT_PANEL_X, side: 'right' };
    return null;
  }

  scenePoint(panel, x, y) {
    return { x: x - panel.originX - 8, y: y - PANEL_Y - 8 };
  }

  click(x, y) {
    this.sound.ensure();

    // The header buttons always work.
    if (this.inside(x, y, this.ui.hintButton)) return this.useHint();
    if (this.inside(x, y, this.ui.muteButton)) return this.toggleMute();

    if (this.screen !== 'play') {
      for (const button of this.ui.actionButtons) {
        if (this.inside(x, y, button)) return this.press(button.action);
      }
      return;
    }

    const panel = this.panelAt(x, y);
    if (!panel) return;
    const point = this.scenePoint(panel, x, y);
    if (point.x < 0 || point.x > SCENE_WIDTH || point.y < 0 || point.y > SCENE_HEIGHT) return;

    const hit = this.scene.differences.find((diff) => {
      if (this.found.some((f) => f.id === diff.id)) return false;
      const dx = point.x - diff.x;
      const dy = point.y - diff.y;
      return dx * dx + dy * dy <= HIT_RADIUS * HIT_RADIUS;
    });

    if (hit) {
      this.found.push(hit);
      this.score += FIND_POINTS;
      this.burst = { x, y, life: 1 };
      this.sound.found();
      const left = this.scene.differences.length - this.found.length;
      this.statusMessage = left === 0
        ? 'That was the last one!'
        : `Found ${hit.name}! ${left} more to go.`;
      this.statusColor = COLORS.foundCheck;
      if (left === 0) this.levelComplete();
    } else {
      this.missMarks.push({ x, y, life: 1 });
      this.timeLeft = Math.max(0, this.timeLeft - WRONG_CLICK_TIME_PENALTY);
      this.score = Math.max(0, this.score - WRONG_CLICK_SCORE_PENALTY);
      this.sound.wrong();
      this.statusMessage = `Not a difference — ${WRONG_CLICK_TIME_PENALTY}s and ${WRONG_CLICK_SCORE_PENALTY} points. Look closer!`;
      this.statusColor = COLORS.missMark;
    }
  }

  press(action) {
    if (action === 'start') this.startGame();
    if (action === 'next') {
      if (this.levelIndex === SCENES.length - 1) this.finishGame();
      else this.startLevel(this.levelIndex + 1);
    }
    if (action === 'retry') this.startLevel(this.levelIndex);
    if (action === 'restart') this.startGame();
    if (action === 'menu') this.toTitle();
  }

  key(name) {
    if (name === 'm' || name === 'M') return this.toggleMute();
    if (this.screen === 'title' && (name === 'Enter' || name === ' ')) return this.startGame();
    if (this.screen === 'levelComplete' && (name === 'Enter' || name === ' ')) return this.press('next');
    if (this.screen === 'over' && (name === 'r' || name === 'R')) return this.startLevel(this.levelIndex);
    if (this.screen === 'win' && (name === 'Enter' || name === ' ')) return this.startGame();
    if (this.screen !== 'play') return;
    if (name === 'h' || name === 'H') this.useHint();
    if (name === 'r' || name === 'R') this.startLevel(this.levelIndex);
  }

  useHint() {
    if (this.screen !== 'play') return;
    if (this.hintsLeft <= 0) {
      this.statusMessage = 'No hints left on this level — trust your eyes!';
      this.statusColor = COLORS.missMark;
      return;
    }
    const remaining = this.scene.differences.filter((d) => !this.found.some((f) => f.id === d.id));
    if (remaining.length === 0) return;
    this.hintsLeft -= 1;
    this.score = Math.max(0, this.score - HINT_COST);
    this.hintTarget = remaining[Math.floor(Math.random() * remaining.length)];
    this.hintTimer = HINT_SECONDS;
    this.sound.hint();
    this.statusMessage = `Hint: something hides near the gold ring (−${HINT_COST} points).`;
    this.statusColor = COLORS.accent;
  }

  toggleMute() {
    this.muted = !this.muted;
    this.sound.muted = this.muted;
    this.statusMessage = this.muted ? 'Sound off.' : 'Sound on.';
    this.statusColor = COLORS.headerText;
  }

  inside(x, y, box) {
    return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
  }

  hover(x, y) {
    this.ui.hintButton.hover = this.inside(x, y, this.ui.hintButton);
    this.ui.muteButton.hover = this.inside(x, y, this.ui.muteButton);
    for (const button of this.ui.actionButtons) button.hover = this.inside(x, y, button);
  }
}
