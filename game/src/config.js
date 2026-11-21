// Twin Tales — Spot the Difference: tuning and layout constants.
// One job: every number the game, the renderer and the scenes share lives here,
// so difficulty and layout can be tuned without touching the drawing code.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 760;

// The two scene panels. Each scene is drawn in a 560 x 400 space and framed.
export const SCENE_WIDTH = 560;
export const SCENE_HEIGHT = 400;
export const PANEL_WIDTH = 576;
export const PANEL_HEIGHT = 416;
export const PANEL_Y = 84;
export const LEFT_PANEL_X = 24;
export const RIGHT_PANEL_X = 664;
export const HEADER_HEIGHT = 76;

// Footer bands: found-difference chips, the status line, the buttons,
// and a keyboard-hint line at the very bottom.
export const CHIPS_Y = 540;
export const STATUS_Y = 590;
export const BUTTONS_Y = 624;
export const FOOTER_HINT_Y = 724;
export const BUTTON_HEIGHT = 52;

// How close a click must land to a difference to count, in scene pixels.
export const HIT_RADIUS = 34;
// A wrong click costs this many seconds and points.
export const WRONG_CLICK_TIME_PENALTY = 2;
export const WRONG_CLICK_SCORE_PENALTY = 10;
// Points for a find, plus this many points per second left when a level ends.
export const FIND_POINTS = 100;
export const TIME_BONUS_PER_SECOND = 10;
// A hint costs points and shows the target for this long.
export const HINT_COST = 50;
export const HINT_SECONDS = 2.5;

// Colours for the frame, the markers and the interface.
export const COLORS = {
  background: '#1c2438',
  backgroundEdge: '#121829',
  panelFrame: '#f5e6c8',
  panelFrameDark: '#c9a86a',
  foundRing: '#ff4757',
  foundCheck: '#2ed573',
  hintRing: '#ffa502',
  missMark: '#ff4757',
  headerText: '#f5e6c8',
  accent: '#ffa502',
  button: '#2e86de',
  buttonHover: '#54a0ff',
  buttonGreen: '#2ed573',
  buttonRed: '#ff4757',
  muted: '#a4b0be',
};

// The three levels, easiest first. `time` is the level timer in seconds.
export const LEVELS = [
  { name: 'Sunny Garden', time: 120, hints: 3 },
  { name: 'Harbour at Dusk', time: 100, hints: 3 },
  { name: 'Cozy Kitchen', time: 90, hints: 3 },
];

// Stars for a finished level by the share of time left.
export function starsForTimeLeft(timeLeft, timeTotal) {
  const share = timeLeft / timeTotal;
  if (share >= 0.5) return 3;
  if (share >= 0.25) return 2;
  return 1;
}

export function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}
