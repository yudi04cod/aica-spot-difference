// Twin Tales — Spot the Difference: the three scenes.
// One job: draw each scene twice — the left panel with no differences, the right
// panel with every difference applied — and list where each difference hides.
// Every picture is drawn with canvas code only: no images, no network, nothing
// to load. A scene's `draw(ctx, on)` takes the set of difference ids that are
// active for that panel; the left panel passes an empty set.

import { SCENE_WIDTH, SCENE_HEIGHT } from './config.js';

// --- tiny drawing helpers shared by the scenes ------------------------------

function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function cloud(ctx, x, y, scale) {
  ctx.fillStyle = '#ffffff';
  circle(ctx, x, y, 18 * scale, '#ffffff');
  circle(ctx, x + 18 * scale, y + 4 * scale, 14 * scale, '#ffffff');
  circle(ctx, x - 18 * scale, y + 5 * scale, 13 * scale, '#ffffff');
  ctx.fillRect(x - 30 * scale, y, 60 * scale, 12 * scale);
}

// --- Level 1: Sunny Garden --------------------------------------------------

const GARDEN_FLOWERS = [
  { x: 60, y: 362 },
  { x: 140, y: 368 },
  { x: 210, y: 358 },
  { x: 330, y: 364 },
  { x: 510, y: 360 },
];

const GARDEN_APPLES = [
  [458, 128], [478, 112], [498, 132], [466, 158], [492, 162],
];

function drawGardenFlower(ctx, x, y, petal) {
  ctx.fillStyle = petal;
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    circle(ctx, x + Math.cos(a) * 8, y + Math.sin(a) * 8, 6, petal);
  }
  circle(ctx, x, y, 5, '#ffa502');
  line(ctx, x, y + 6, x, y + 22, '#2f9e44', 3);
}

function drawGarden(ctx, on) {
  // Sky and sun.
  const sky = ctx.createLinearGradient(0, 0, 0, SCENE_HEIGHT);
  sky.addColorStop(0, '#7ec8f7');
  sky.addColorStop(0.65, '#cfeefb');
  sky.addColorStop(1, '#e8f9e0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

  circle(ctx, 70, 60, 34, '#ffd32a');
  if (!on.has('sun-rays')) {
    ctx.strokeStyle = '#ffd32a';
    ctx.lineWidth = 5;
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      line(ctx, 70 + Math.cos(a) * 42, 60 + Math.sin(a) * 42,
        70 + Math.cos(a) * 54, 60 + Math.sin(a) * 54, '#ffd32a', 5);
    }
  }

  cloud(ctx, 200, 48, 1);
  cloud(ctx, 380, 38, 0.8);
  cloud(ctx, 480, 82, 0.7);

  // Butterfly: present on the left, gone on the right.
  if (!on.has('butterfly')) {
    ctx.fillStyle = '#e056fd';
    ellipse(ctx, 410, 86, 10, 7, '#e056fd');
    ellipse(ctx, 430, 86, 10, 7, '#e056fd');
    ellipse(ctx, 412, 98, 8, 5, '#be2edd');
    ellipse(ctx, 428, 98, 8, 5, '#be2edd');
    line(ctx, 420, 84, 420, 100, '#2f3542', 2);
  }

  // Hills and lawn.
  ellipse(ctx, 120, 430, 220, 90, '#7ed957');
  ellipse(ctx, 460, 440, 240, 100, '#5ec24a');
  rect(ctx, 0, 340, SCENE_WIDTH, 60, '#69c24f');

  // The little house.
  rect(ctx, 230, 180, 140, 110, '#ffeaa7');
  poly(ctx, [[218, 182], [300, 128], [382, 182]], '#e17055');
  rect(ctx, 345, 138, 24, 46, '#b2bec3');
  if (!on.has('chimney-smoke')) {
    circle(ctx, 357, 122, 9, '#dfe6e9');
    circle(ctx, 364, 106, 12, '#dfe6e9');
    circle(ctx, 356, 88, 15, '#dfe6e9');
  }
  // Door and path.
  rect(ctx, 285, 232, 30, 58, '#6c5ce7');
  circle(ctx, 308, 262, 3, '#ffd32a');
  poly(ctx, [[282, 290], [318, 290], [336, 340], [264, 340]], '#dfe6e9');
  // Windows; the right one gains shutters on the left only.
  rect(ctx, 242, 200, 30, 30, '#74b9ff');
  line(ctx, 257, 200, 257, 230, '#ffffff', 3);
  line(ctx, 242, 215, 272, 215, '#ffffff', 3);
  rect(ctx, 328, 200, 30, 30, '#74b9ff');
  line(ctx, 343, 200, 343, 230, '#ffffff', 3);
  line(ctx, 328, 215, 358, 215, '#ffffff', 3);
  if (!on.has('window-shutters')) {
    rect(ctx, 318, 198, 8, 34, '#e17055');
    rect(ctx, 360, 198, 8, 34, '#e17055');
  }

  // The apple tree.
  rect(ctx, 468, 190, 22, 100, '#8d5a2b');
  circle(ctx, 452, 150, 34, '#2f9e44');
  circle(ctx, 508, 150, 34, '#2f9e44');
  circle(ctx, 480, 122, 38, '#38b24a');
  const apples = on.has('tree-apples') ? GARDEN_APPLES.slice(0, 3) : GARDEN_APPLES;
  for (const [ax, ay] of apples) circle(ctx, ax, ay, 6, '#eb3b5a');

  // The fence.
  rect(ctx, 0, 322, SCENE_WIDTH, 6, '#a9805a');
  rect(ctx, 0, 336, SCENE_WIDTH, 6, '#a9805a');
  for (let x = 14; x < SCENE_WIDTH; x += 34) {
    poly(ctx, [[x, 312], [x + 8, 304], [x + 16, 312], [x + 16, 344], [x, 344]], '#c89b6d');
  }

  // Flowers along the lawn; one changes colour.
  GARDEN_FLOWERS.forEach((flower, i) => {
    const petal = i === 2 && on.has('flower-color') ? '#0984e3' : '#e84393';
    drawGardenFlower(ctx, flower.x, flower.y, petal);
  });

  // The sitting cat, tail up on the left, tail down on the right.
  ellipse(ctx, 180, 330, 26, 18, '#f5f6fa');
  circle(ctx, 180, 304, 15, '#f5f6fa');
  poly(ctx, [[168, 294], [172, 280], [178, 292]], '#f5f6fa');
  poly(ctx, [[182, 292], [188, 280], [192, 294]], '#f5f6fa');
  circle(ctx, 174, 302, 2, '#2f3542');
  circle(ctx, 186, 302, 2, '#2f3542');
  if (on.has('cat-tail')) {
    line(ctx, 202, 336, 226, 336, '#f5f6fa', 6);
  } else {
    ctx.beginPath();
    ctx.moveTo(202, 330);
    ctx.quadraticCurveTo(222, 322, 216, 300);
    ctx.strokeStyle = '#f5f6fa';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

// --- Level 2: Harbour at Dusk -----------------------------------------------

function drawHarbour(ctx, on) {
  // Dusk sky, low sun and the moon.
  const sky = ctx.createLinearGradient(0, 0, 0, SCENE_HEIGHT);
  sky.addColorStop(0, '#6c5ce7');
  sky.addColorStop(0.55, '#e17055');
  sky.addColorStop(1, '#fdcb6e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

  circle(ctx, 90, 120, 30, '#fdcb6e');
  circle(ctx, 90, 120, 22, '#ffeaa7');

  if (on.has('moon-phase')) {
    circle(ctx, 480, 60, 22, '#f5f6fa');
  } else {
    circle(ctx, 480, 60, 22, '#f5f6fa');
    circle(ctx, 490, 54, 19, '#6c5ce7');
  }

  // Seagulls: three on the left, two on the right.
  const gulls = on.has('seagull-count')
    ? [[200, 70], [330, 80]]
    : [[200, 70], [260, 50], [330, 80]];
  ctx.strokeStyle = '#2f3542';
  ctx.lineWidth = 3;
  for (const [gx, gy] of gulls) {
    ctx.beginPath();
    ctx.moveTo(gx - 10, gy);
    ctx.quadraticCurveTo(gx - 4, gy - 8, gx, gy);
    ctx.quadraticCurveTo(gx + 4, gy - 8, gx + 10, gy);
    ctx.stroke();
  }

  // The sea.
  rect(ctx, 0, 220, SCENE_WIDTH, 180, '#0984e3');
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 3;
  for (const [wx, wy, wl] of [[60, 260, 70], [300, 250, 90], [470, 270, 60], [180, 300, 80], [400, 320, 90], [80, 350, 70], [300, 370, 80]]) {
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + wl / 2, wy - 7, wx + wl, wy);
    ctx.stroke();
  }

  // The pier.
  rect(ctx, 0, 296, 210, 10, '#8d5a2b');
  rect(ctx, 0, 310, 210, 6, '#a9805a');
  for (const px of [20, 70, 120, 170]) rect(ctx, px, 306, 8, 34, '#6b4423');

  // The jumping fish: there on the left, gone on the right.
  if (!on.has('jumping-fish')) {
    ctx.beginPath();
    ctx.ellipse(120, 296, 16, 8, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#dfe6e9';
    ctx.fill();
    poly(ctx, [[134, 288], [146, 282], [140, 296]], '#dfe6e9');
    circle(ctx, 110, 292, 2, '#2f3542');
  }

  // Boat one, with its flag.
  poly(ctx, [[120, 250], [185, 250], [172, 268], [132, 268]], '#6c5ce7');
  line(ctx, 152, 250, 152, 196, '#6b4423', 4);
  poly(ctx, [[152, 198], [182, 232], [152, 232]], '#ffffff');
  poly(ctx, [[152, 196], [172, 202], [152, 208]],
    on.has('boat-flag') ? '#fdcb6e' : '#eb3b5a');

  // Boat two.
  poly(ctx, [[290, 282], [340, 282], [330, 296], [300, 296]], '#e17055');
  line(ctx, 315, 282, 315, 244, '#6b4423', 4);
  poly(ctx, [[315, 246], [338, 274], [315, 274]], '#ffeaa7');

  // The buoy: striped on the left, plain on the right.
  if (on.has('buoy-stripes')) {
    ellipse(ctx, 380, 336, 16, 12, '#eb3b5a');
  } else {
    ellipse(ctx, 380, 336, 16, 12, '#eb3b5a');
    rect(ctx, 366, 328, 28, 5, '#ffffff');
    rect(ctx, 366, 340, 28, 5, '#ffffff');
  }
  line(ctx, 380, 322, 380, 312, '#2f3542', 3);

  // The lighthouse.
  poly(ctx, [[424, 300], [452, 300], [446, 150], [430, 150]], '#f5f6fa');
  rect(ctx, 426, 262, 24, 12, '#eb3b5a');
  rect(ctx, 429, 216, 18, 12, '#eb3b5a');
  rect(ctx, 431, 172, 14, 12, '#eb3b5a');
  rect(ctx, 424, 138, 28, 16, '#2f3542');
  // Its window: lit on the left, dark on the right.
  rect(ctx, 434, 200, 10, 12, on.has('lighthouse-window') ? '#2f3542' : '#fdcb6e');
  circle(ctx, 438, 146, 6, '#fdcb6e');
  // Its beam: shining on the left, off on the right.
  if (!on.has('lighthouse-beam')) {
    ctx.fillStyle = 'rgba(253, 203, 110, 0.35)';
    poly(ctx, [[424, 146], [250, 108], [250, 182]], 'rgba(253, 203, 110, 0.35)');
  }
}

// --- Level 3: Cozy Kitchen --------------------------------------------------

function drawKitchen(ctx, on) {
  // Warm wall, floor and rug.
  rect(ctx, 0, 0, SCENE_WIDTH, SCENE_HEIGHT, '#f7d794');
  rect(ctx, 0, 320, SCENE_WIDTH, 80, '#b07d4f');
  ellipse(ctx, 150, 356, 110, 26, '#e17055');
  ellipse(ctx, 150, 356, 78, 17, '#d63031');

  // The window with its curtains.
  rect(ctx, 56, 56, 128, 136, '#74b9ff');
  rect(ctx, 66, 66, 108, 116, '#aee2ff');
  circle(ctx, 92, 96, 20, '#ffd32a');
  cloud(ctx, 140, 150, 0.55);
  rect(ctx, 52, 52, 136, 8, '#8d5a2b');
  rect(ctx, 52, 192, 136, 8, '#8d5a2b');
  line(ctx, 120, 66, 120, 182, '#ffffff', 3);
  line(ctx, 66, 124, 174, 124, '#ffffff', 3);
  if (on.has('curtains')) {
    // Tied back: short, gathered at the sides.
    poly(ctx, [[52, 52], [76, 52], [70, 120], [52, 120]], '#e84393');
    poly(ctx, [[188, 52], [164, 52], [170, 120], [188, 120]], '#e84393');
  } else {
    // Untied: long panels hanging over the window.
    poly(ctx, [[52, 52], [84, 52], [78, 192], [52, 192]], '#e84393');
    poly(ctx, [[188, 52], [156, 52], [162, 192], [188, 192]], '#e84393');
  }

  // The shelf with its jars.
  rect(ctx, 280, 108, 150, 10, '#8d5a2b');
  const jars = on.has('jar-count')
    ? [[292, 66, '#fdcb6e'], [330, 66, '#74b9ff']]
    : [[292, 66, '#fdcb6e'], [330, 66, '#74b9ff'], [368, 66, '#55efc4']];
  for (const [jx, jy, jc] of jars) {
    rect(ctx, jx, jy, 26, 42, jc);
    rect(ctx, jx - 2, jy - 6, 30, 8, '#6b4423');
  }

  // The wall clock: 3 o'clock on the left, half past 4 on the right.
  circle(ctx, 470, 80, 30, '#ffffff');
  ctx.strokeStyle = '#2f3542';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(470, 80, 30, 0, Math.PI * 2);
  ctx.stroke();
  circle(ctx, 470, 80, 3, '#2f3542');
  if (on.has('clock-hands')) {
    line(ctx, 470, 80, 470, 58, '#2f3542', 3);
    line(ctx, 470, 80, 488, 88, '#2f3542', 3);
  } else {
    line(ctx, 470, 80, 470, 58, '#2f3542', 3);
    line(ctx, 470, 80, 490, 80, '#2f3542', 3);
  }

  // The hanging lamp: glowing on the left, off on the right.
  line(ctx, 280, 0, 280, 40, '#2f3542', 3);
  if (!on.has('lamp-glow')) {
    ctx.fillStyle = 'rgba(253, 203, 110, 0.25)';
    ctx.beginPath();
    ctx.arc(280, 96, 62, 0, Math.PI * 2);
    ctx.fill();
  }
  poly(ctx, [[258, 40], [302, 40], [292, 66], [268, 66]], '#e17055');
  circle(ctx, 280, 72, 8, on.has('lamp-glow') ? '#dfe6e9' : '#ffd32a');

  // The table.
  rect(ctx, 210, 250, 240, 16, '#8d5a2b');
  rect(ctx, 226, 266, 14, 54, '#6b4423');
  rect(ctx, 420, 266, 14, 54, '#6b4423');

  // The teapot, steaming on the left.
  ellipse(ctx, 280, 240, 34, 22, '#6c5ce7');
  circle(ctx, 280, 214, 12, '#6c5ce7');
  poly(ctx, [[310, 232], [332, 222], [326, 244]], '#6c5ce7');
  ctx.beginPath();
  ctx.arc(250, 232, 12, Math.PI * 0.5, Math.PI * 1.5);
  ctx.strokeStyle = '#6c5ce7';
  ctx.lineWidth = 5;
  ctx.stroke();
  if (!on.has('teapot-steam')) {
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(272, 202);
    ctx.quadraticCurveTo(266, 188, 274, 176);
    ctx.quadraticCurveTo(280, 166, 274, 154);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(288, 202);
    ctx.quadraticCurveTo(294, 190, 288, 178);
    ctx.stroke();
  }

  // The fruit bowl: an apple turns into an orange.
  ellipse(ctx, 400, 296, 34, 12, '#d63031');
  circle(ctx, 384, 286, 10, '#eb3b5a');
  circle(ctx, 402, 282, 10, on.has('bowl-fruit') ? '#e67e22' : '#eb3b5a');
  circle(ctx, 418, 288, 10, '#fdcb6e');
  line(ctx, 384, 276, 384, 270, '#2f9e44', 2);

  // The mug and cookies.
  rect(ctx, 340, 272, 22, 26, '#0984e3');
  ctx.beginPath();
  ctx.arc(364, 284, 8, -Math.PI / 2, Math.PI / 2);
  ctx.strokeStyle = '#0984e3';
  ctx.lineWidth = 4;
  ctx.stroke();
  ellipse(ctx, 332, 300, 22, 7, '#f5f6fa');
  circle(ctx, 324, 296, 5, '#8d5a2b');
  circle(ctx, 340, 296, 5, '#8d5a2b');

  // The cat asleep on the rug, eyes open on the left, shut on the right.
  ellipse(ctx, 150, 348, 34, 16, '#f5f6fa');
  circle(ctx, 122, 338, 13, '#f5f6fa');
  poly(ctx, [[112, 330], [115, 318], [121, 328]], '#f5f6fa');
  poly(ctx, [[124, 328], [129, 317], [132, 329]], '#f5f6fa');
  if (on.has('cat-eyes')) {
    ctx.strokeStyle = '#2f3542';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(117, 338, 3, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(128, 338, 3, Math.PI, 0);
    ctx.stroke();
  } else {
    circle(ctx, 117, 338, 2, '#2f3542');
    circle(ctx, 128, 338, 2, '#2f3542');
  }
  ctx.beginPath();
  ctx.moveTo(180, 352);
  ctx.quadraticCurveTo(196, 344, 188, 332);
  ctx.strokeStyle = '#f5f6fa';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.stroke();
}

// --- The catalogue ----------------------------------------------------------

export const SCENES = [
  {
    name: 'Sunny Garden',
    draw: drawGarden,
    differences: [
      { id: 'sun-rays', name: "the sun's rays", x: 70, y: 60 },
      { id: 'chimney-smoke', name: 'the chimney smoke', x: 357, y: 110 },
      { id: 'tree-apples', name: 'the apples on the tree', x: 480, y: 140 },
      { id: 'cat-tail', name: "the cat's tail", x: 205, y: 318 },
      { id: 'flower-color', name: 'the colour of a flower', x: 210, y: 358 },
      { id: 'window-shutters', name: 'the window shutters', x: 340, y: 215 },
      { id: 'butterfly', name: 'the butterfly', x: 420, y: 90 },
    ],
  },
  {
    name: 'Harbour at Dusk',
    draw: drawHarbour,
    differences: [
      { id: 'lighthouse-beam', name: 'the lighthouse beam', x: 340, y: 145 },
      { id: 'moon-phase', name: 'the shape of the moon', x: 480, y: 60 },
      { id: 'seagull-count', name: 'a seagull in the sky', x: 260, y: 50 },
      { id: 'boat-flag', name: "the boat's flag", x: 160, y: 202 },
      { id: 'buoy-stripes', name: 'the stripes on the buoy', x: 380, y: 336 },
      { id: 'jumping-fish', name: 'the jumping fish', x: 120, y: 296 },
      { id: 'lighthouse-window', name: 'the lighthouse window light', x: 439, y: 206 },
    ],
  },
  {
    name: 'Cozy Kitchen',
    draw: drawKitchen,
    differences: [
      { id: 'clock-hands', name: 'the time on the clock', x: 470, y: 80 },
      { id: 'teapot-steam', name: 'the steam from the teapot', x: 280, y: 180 },
      { id: 'jar-count', name: 'a jar on the shelf', x: 381, y: 82 },
      { id: 'cat-eyes', name: "the cat's eyes", x: 122, y: 338 },
      { id: 'bowl-fruit', name: 'a fruit in the bowl', x: 402, y: 282 },
      { id: 'curtains', name: 'the window curtains', x: 68, y: 120 },
      { id: 'lamp-glow', name: 'the hanging lamp', x: 280, y: 70 },
    ],
  },
];
