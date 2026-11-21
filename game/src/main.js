// Twin Tales — Spot the Difference: the entry point.
// One job: size the canvas to its logical resolution, scale it to the window,
// wire the mouse and keyboard to the game, and run the frame loop. A `?shot=`
// query stages a screenshot scene instead of the title screen.

import { CANVAS_WIDTH, CANVAS_HEIGHT } from './config.js';
import { Game } from './game.js';
import { render } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const game = new Game();
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) stageShot(shot, game);

/** Fit the fixed-size canvas into the window without stretching it. */
function fitCanvas() {
  const scale = Math.min(window.innerWidth / CANVAS_WIDTH, window.innerHeight / CANVAS_HEIGHT);
  canvas.style.width = `${Math.floor(CANVAS_WIDTH * scale)}px`;
  canvas.style.height = `${Math.floor(CANVAS_HEIGHT * scale)}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

/** Translate a pointer event into the canvas's own coordinates. */
function toCanvas(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
  };
}

canvas.addEventListener('pointerdown', (event) => {
  const point = toCanvas(event);
  game.click(point.x, point.y);
});
canvas.addEventListener('pointermove', (event) => {
  const point = toCanvas(event);
  game.hover(point.x, point.y);
});
window.addEventListener('keydown', (event) => {
  if ([' ', 'ArrowUp', 'ArrowDown'].includes(event.key)) event.preventDefault();
  game.key(event.key);
});

let last = performance.now();
function frame(now) {
  const delta = Math.min(0.1, (now - last) / 1000);
  last = now;
  game.update(delta);
  render(ctx, game);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
