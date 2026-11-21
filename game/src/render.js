// Twin Tales — Spot the Difference: the renderer.
// One job: draw everything the player sees on the one canvas — header, the two
// panels with their frames and labels, the found-difference markers, the chips
// of differences already found, the status line, the buttons, and the title,
// level-complete, game-over and win screens. It draws state; it keeps none.

import {
  CANVAS_WIDTH, CANVAS_HEIGHT, SCENE_WIDTH, SCENE_HEIGHT, PANEL_WIDTH, PANEL_HEIGHT,
  PANEL_Y, LEFT_PANEL_X, RIGHT_PANEL_X, HEADER_HEIGHT, CHIPS_Y, STATUS_Y,
  BUTTONS_Y, FOOTER_HINT_Y, BUTTON_HEIGHT, COLORS, LEVELS, HIT_RADIUS, formatTime, starsForTimeLeft,
} from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = '700', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// --- the two panels ----------------------------------------------------------

function drawPanel(ctx, scene, diffsOn, found, x, label, hint, time) {
  // Frame.
  ctx.fillStyle = COLORS.panelFrameDark;
  ctx.fillRect(x - 4, PANEL_Y - 4, PANEL_WIDTH + 8, PANEL_HEIGHT + 8);
  ctx.fillStyle = COLORS.panelFrame;
  ctx.fillRect(x, PANEL_Y, PANEL_WIDTH, PANEL_HEIGHT);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 8, PANEL_Y + 8, SCENE_WIDTH, SCENE_HEIGHT);
  ctx.clip();
  ctx.translate(x + 8, PANEL_Y + 8);
  scene.draw(ctx, diffsOn);
  ctx.restore();

  // Label below the frame, clear of its bottom edge.
  text(ctx, label, x + PANEL_WIDTH / 2, PANEL_Y + PANEL_HEIGHT + 14, 13, COLORS.muted, '600', 'center');

  // Markers for the differences already found: a ring on both panels.
  for (const diff of found) {
    const cx = x + 8 + diff.x;
    const cy = PANEL_Y + 8 + diff.y;
    ctx.beginPath();
    ctx.arc(cx, cy, HIT_RADIUS - 6, 0, Math.PI * 2);
    ctx.strokeStyle = COLORS.foundRing;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, HIT_RADIUS - 12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 71, 87, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // The hint: a pulsing gold ring around one difference not yet found.
  if (hint) {
    const pulse = 1 + 0.12 * Math.sin(time * 6);
    const cx = x + 8 + hint.x;
    const cy = PANEL_Y + 8 + hint.y;
    ctx.beginPath();
    ctx.arc(cx, cy, (HIT_RADIUS - 2) * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = COLORS.hintRing;
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// --- header, chips, status, buttons ------------------------------------------

function drawHeader(ctx, game) {
  text(ctx, 'TWIN TALES', 24, 30, 26, COLORS.headerText, '800');
  text(ctx, 'spot the difference', 24, 56, 13, COLORS.muted, '600');

  const level = LEVELS[game.levelIndex];
  text(ctx, `LEVEL ${game.levelIndex + 1} · ${level.name.toUpperCase()}`, 640, 30, 17, COLORS.accent, '800', 'center');
  text(ctx, `Best ${game.bestScore}`, 640, 56, 12, COLORS.muted, '600', 'center');

  const lowTime = game.timeLeft <= 20 && game.screen === 'play';
  text(ctx, formatTime(game.timeLeft), 840, 32, 30, lowTime ? COLORS.missMark : COLORS.headerText, '800', 'center');
  text(ctx, 'TIME LEFT', 840, 58, 11, COLORS.muted, '700', 'center');

  text(ctx, String(game.score), 960, 32, 30, COLORS.headerText, '800', 'center');
  text(ctx, 'SCORE', 960, 58, 11, COLORS.muted, '700', 'center');

  const found = game.found.length;
  const total = game.scene.differences.length;
  text(ctx, `${found} / ${total}`, 1080, 32, 30, found === total ? COLORS.foundCheck : COLORS.headerText, '800', 'center');
  text(ctx, 'FOUND', 1080, 58, 11, COLORS.muted, '700', 'center');

  // Hint button (top right) and mute toggle.
  drawButton(ctx, game.ui.hintButton, `HINT (${game.hintsLeft})`, game.hintsLeft > 0 && game.screen === 'play');
  drawButton(ctx, game.ui.muteButton, game.muted ? 'SOUND OFF' : 'SOUND ON', true);
}

function drawButton(ctx, button, label, enabled) {
  const hover = button.hover && enabled;
  ctx.fillStyle = !enabled ? '#57606f' : hover ? COLORS.buttonHover : COLORS.button;
  roundRect(ctx, button.x, button.y, button.w, button.h, 10);
  ctx.fill();
  text(ctx, label, button.x + button.w / 2, button.y + button.h / 2 + 1, 15, '#ffffff', '800', 'center');
}

function drawChips(ctx, game) {
  text(ctx, 'FOUND:', 24, CHIPS_Y + 12, 13, COLORS.muted, '700');
  let x = 96;
  for (const diff of game.found) {
    const label = `✓ ${diff.name}`;
    ctx.font = '600 13px system-ui, -apple-system, "Segoe UI", sans-serif';
    const w = ctx.measureText(label).width + 20;
    ctx.fillStyle = 'rgba(46, 213, 115, 0.18)';
    roundRect(ctx, x, CHIPS_Y, w, 26, 13);
    ctx.fill();
    ctx.strokeStyle = COLORS.foundCheck;
    ctx.lineWidth = 1.5;
    roundRect(ctx, x, CHIPS_Y, w, 26, 13);
    ctx.stroke();
    text(ctx, label, x + 10, CHIPS_Y + 14, 13, COLORS.foundCheck, '600');
    x += w + 8;
    if (x > CANVAS_WIDTH - 200) break;
  }
  if (game.found.length === 0) {
    text(ctx, 'nothing yet — click a difference in either picture', 96, CHIPS_Y + 13, 13, COLORS.muted, '600');
  }
}

function drawStatus(ctx, game) {
  text(ctx, game.statusMessage, 640, STATUS_Y + 14, 16, game.statusColor, '600', 'center');
}

function drawButtons(ctx, game) {
  for (const button of game.ui.actionButtons) {
    ctx.fillStyle = button.hover ? COLORS.buttonHover : button.color;
    roundRect(ctx, button.x, button.y, button.w, button.h, 12);
    ctx.fill();
    text(ctx, button.label, button.x + button.w / 2, button.y + button.h / 2 + 1, 17, '#ffffff', '800', 'center');
  }
}

// --- overlays -----------------------------------------------------------------

function dimScreen(ctx) {
  ctx.fillStyle = 'rgba(10, 14, 26, 0.72)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function card(ctx, w, h) {
  const x = (CANVAS_WIDTH - w) / 2;
  const y = (CANVAS_HEIGHT - h) / 2;
  ctx.fillStyle = '#232c47';
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = COLORS.panelFrameDark;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 18);
  ctx.stroke();
  return { x, y, w, h };
}

function drawStars(ctx, cx, y, stars) {
  for (let i = 0; i < 3; i += 1) {
    const sx = cx + (i - 1) * 56;
    ctx.font = '44px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(i < stars ? '★' : '☆', sx, y);
    ctx.fillStyle = i < stars ? '#ffd32a' : '#57606f';
    ctx.fillText(i < stars ? '★' : '☆', sx, y);
  }
}

function drawTitleScreen(ctx, game) {
  // The garden scene, dimmed, behind the title card.
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.translate(LEFT_PANEL_X + 8, PANEL_Y + 8);
  game.scene.draw(ctx, new Set());
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.translate(RIGHT_PANEL_X + 8, PANEL_Y + 8);
  game.scene.draw(ctx, new Set(game.scene.differences.map((d) => d.id)));
  ctx.restore();
  dimScreen(ctx);

  const box = card(ctx, 620, 420);
  text(ctx, 'TWIN TALES', 640, box.y + 62, 52, COLORS.headerText, '800', 'center');
  text(ctx, '— spot the difference —', 640, box.y + 108, 20, COLORS.accent, '700', 'center');
  text(ctx, 'Two pictures look the same. They are not.', 640, box.y + 168, 17, '#dfe4ea', '600', 'center');
  text(ctx, 'Find all 7 differences in each of 3 scenes before time runs out.', 640, box.y + 196, 17, '#dfe4ea', '600', 'center');
  text(ctx, 'Click a difference in either picture · H for a hint · wrong clicks cost time', 640, box.y + 224, 15, COLORS.muted, '600', 'center');
  text(ctx, `Best score: ${game.bestScore}`, 640, box.y + 258, 15, COLORS.muted, '700', 'center');
  drawButtons(ctx, game);
  text(ctx, 'An original game — every scene drawn in code, no photos, no downloads.', 640, box.y + 386, 12, COLORS.muted, '600', 'center');
}

function drawLevelComplete(ctx, game) {
  dimScreen(ctx);
  const box = card(ctx, 560, 380);
  const stars = starsForTimeLeft(game.timeLeft, LEVELS[game.levelIndex].time);
  text(ctx, 'LEVEL COMPLETE!', 640, box.y + 56, 38, COLORS.foundCheck, '800', 'center');
  drawStars(ctx, 640, box.y + 122, stars);
  text(ctx, `${game.scene.name} — all ${game.scene.differences.length} differences found`, 640, box.y + 172, 17, '#dfe4ea', '600', 'center');
  text(ctx, `Time bonus +${Math.round(game.timeLeft) * 10}  ·  Score ${game.score}`, 640, box.y + 206, 17, COLORS.headerText, '700', 'center');
  drawButtons(ctx, game);
}

function drawGameOver(ctx, game) {
  dimScreen(ctx);
  const box = card(ctx, 560, 380);
  const missed = game.scene.differences.length - game.found.length;
  text(ctx, "TIME'S UP!", 640, box.y + 56, 38, COLORS.missMark, '800', 'center');
  text(ctx, `${game.scene.name} — ${missed} difference${missed === 1 ? '' : 's'} still hiding`, 640, box.y + 116, 17, '#dfe4ea', '600', 'center');
  text(ctx, 'The unfound ones are circled in gold below.', 640, box.y + 146, 15, COLORS.hintRing, '600', 'center');
  text(ctx, `Score ${game.score}`, 640, box.y + 184, 17, COLORS.headerText, '700', 'center');
  drawButtons(ctx, game);
}

function drawWinScreen(ctx, game) {
  dimScreen(ctx);
  const box = card(ctx, 620, 400);
  text(ctx, 'YOU FOUND THEM ALL!', 640, box.y + 56, 38, COLORS.foundCheck, '800', 'center');
  drawStars(ctx, 640, box.y + 122, 3);
  text(ctx, 'Every difference in all three scenes — sharp eyes!', 640, box.y + 172, 17, '#dfe4ea', '600', 'center');
  text(ctx, `Final score ${game.score}`, 640, box.y + 214, 22, COLORS.headerText, '800', 'center');
  const best = Math.max(game.bestScore, game.score);
  text(ctx, best === game.score && game.score > 0 ? 'A new best score!' : `Best score ${best}`, 640, box.y + 248, 15, COLORS.accent, '700', 'center');
  drawButtons(ctx, game);
}

// --- the frame -----------------------------------------------------------------

export function render(ctx, game) {
  // Backdrop.
  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bg.addColorStop(0, COLORS.background);
  bg.addColorStop(1, COLORS.backgroundEdge);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  if (game.screen === 'title') {
    drawHeader(ctx, game);
    drawTitleScreen(ctx, game);
    return;
  }

  drawHeader(ctx, game);
  const allIds = new Set(game.scene.differences.map((d) => d.id));
  const hintDiff = game.hintTarget;
  drawPanel(ctx, game.scene, new Set(), game.found, LEFT_PANEL_X, 'ORIGINAL', hintDiff, game.elapsed);
  drawPanel(ctx, game.scene, allIds, game.found, RIGHT_PANEL_X, 'SPOT THE CHANGES', hintDiff, game.elapsed);

  // Missed differences, circled in gold after a time-out.
  if (game.screen === 'over') {
    for (const diff of game.scene.differences) {
      if (game.found.some((f) => f.id === diff.id)) continue;
      for (const px of [LEFT_PANEL_X, RIGHT_PANEL_X]) {
        ctx.beginPath();
        ctx.arc(px + 8 + diff.x, PANEL_Y + 8 + diff.y, HIT_RADIUS - 4, 0, Math.PI * 2);
        ctx.strokeStyle = COLORS.hintRing;
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }

  // Wrong-click crosses, fading.
  for (const mark of game.missMarks) {
    const alpha = Math.max(0, mark.life);
    ctx.strokeStyle = `rgba(255, 71, 87, ${alpha})`;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const s = 12;
    ctx.beginPath();
    ctx.moveTo(mark.x - s, mark.y - s);
    ctx.lineTo(mark.x + s, mark.y + s);
    ctx.moveTo(mark.x + s, mark.y - s);
    ctx.lineTo(mark.x - s, mark.y + s);
    ctx.stroke();
  }

  // Found burst: expanding ring where the last find landed.
  if (game.burst && game.burst.life > 0) {
    const b = game.burst;
    const progress = 1 - b.life;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 20 + progress * 46, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(46, 213, 115, ${b.life})`;
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  drawChips(ctx, game);
  drawStatus(ctx, game);
  if (game.screen === 'play') {
    text(ctx, 'Click a difference in either picture  ·  H hint  ·  R restart level  ·  M sound',
      CANVAS_WIDTH / 2, FOOTER_HINT_Y, 13, COLORS.muted, '600', 'center');
  }
  if (game.screen !== 'play') drawButtons(ctx, game);
  if (game.screen === 'levelComplete') drawLevelComplete(ctx, game);
  if (game.screen === 'over') drawGameOver(ctx, game);
  if (game.screen === 'win') drawWinScreen(ctx, game);

  // The timer bar under the header: time pressure you can feel.
  if (game.screen === 'play') {
    const total = LEVELS[game.levelIndex].time;
    const share = Math.max(0, game.timeLeft / total);
    ctx.fillStyle = '#2f3542';
    roundRect(ctx, 24, HEADER_HEIGHT - 6, CANVAS_WIDTH - 48, 8, 4);
    ctx.fill();
    ctx.fillStyle = share > 0.25 ? COLORS.foundCheck : COLORS.missMark;
    roundRect(ctx, 24, HEADER_HEIGHT - 6, (CANVAS_WIDTH - 48) * share, 8, 4);
    ctx.fill();
  }
}
