
let cellWidth, cellHeight;
let S = 20;
let worm = [], foods = [];
let key = "";
let point = 0;
let timer = null;
let timeInterval = null;
let ctx;
let wormFace = "🙂";
let isStarted = false;
let startTime = null;
let foodAmount = 10;
let growth = 0;
let interval = 200;
let isGameOver = false;
let tickCount = 0;

function Point(x, y) {
  this.x = x;
  this.y = y;
}

function randomFloor(n) {
  return Math.floor(Math.random() * n);
}

function init() {
  const canvas = document.getElementById('board');
  cellWidth = canvas.width / S;
  cellHeight = canvas.height / S;
  ctx = canvas.getContext('2d');
  ctx.textBaseline = "bottom";
  ctx.font = "16px Arial";
  worm.push(new Point(Math.floor(cellWidth / 2), Math.floor(cellHeight / 2)));

  for (let i = 0; i < foodAmount; i++) {
    addFood();
  }

  paint();
  window.onkeydown = keydown;
}

function keydown(event) {
  const k = event.key;
  if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(k)) return;

  if (!isStarted) {
    isStarted = true;
    startTime = Date.now();
    timer = setInterval(tick, interval);
    timeInterval = setInterval(updateTimeDisplay, 1000);
    wormFace = "😀";
  }

  key = k;

}

function updateTimeDisplay() {
  if (isStarted && startTime !== null) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("time").textContent = elapsed;
  }
}

function addFood() {
  while (true) {
    const x = randomFloor(cellWidth);
    const y = randomFloor(cellHeight);
    if (isHit(foods, x, y) || isHit(worm, x, y)) continue;

    let type = "n"; // 🧡
    const r = Math.random();
    if (r < 0.05) type = "s"; // 💛
    else if (r < 0.10) type = "f"; // 💚
    else if (r < 0.15) type = "t"; // 💙
    else if (r < 0.20) type = "b"; // 💞

    foods.push({ x, y, type });
    break;
  }
}

function isHit(data, x, y) {
  return data.some(p => p.x === x && p.y === y);
}

function moveFood(x, y) {
  foods = foods.filter(p => !(p.x === x && p.y === y));
  addFood();
}

function tick() {
  let x = worm[0].x;
  let y = worm[0].y;

  switch (key) {
    case 'ArrowLeft': x--; break;
    case 'ArrowUp': y--; break;
    case 'ArrowRight': x++; break;
    case 'ArrowDown': y++; break;
    default: paint(); return;
  }

  if (isHit(worm, x, y) || x < 0 || y < 0 || x >= cellWidth || y >= cellHeight) {
    clearInterval(timer);
    isGameOver = true;
    wormFace = "😵";
    paint();
    return;
  }

  worm.unshift(new Point(x, y)); // add new head on front
  wormFace = (tickCount % 2) === 0 ? "😀" : "🙂";

  let eaten = false;
  for (let i = 0; i < foods.length; i++) {
    const f = foods[i];
    if (f.x === x && f.y === y) {
      eaten = true;

      switch (f.type) {
        case "n": // 🧡 normal food
          point += 10;
          growth += 1;
          break;
        case "s": // 💛 speed
          point += 15;
          growth += 1;
          interval = Math.max(50, interval - 5); // speed UP（50ms minimum）
          clearInterval(timer);
          timer = setInterval(tick, interval);
          break;
        case "f": // 💚 more food
          point += 15;
          growth += 1;
          foodAmount += 1;
          addFood(); // food on the field +1
          break;
        case "t": // 💙 +5sec
          point += 15;
          startTime += 5000;
          growth += 1;
          break;
        case "b": // 💞 big body
          point += 15;
          growth += 2;
          break;
      }
      worm.pop();
      moveFood(x, y);
      break;
    }
  }

  if (!eaten) {
    if (growth > 0) {
      growth--;
    } else {
      worm.pop();
    }
  }

  if (Date.now() - startTime >= 60000) {
    showEnding();
    return;
  }

  paint();
  tickCount++;
}

function paint() {
  ctx.clearRect(0, 0, cellWidth * S, cellHeight * S);
  document.getElementById("point").textContent = point;

  let elapsedSec = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  document.getElementById("time").textContent = elapsedSec;

  foods.forEach(f => {
    let emoji = "🧡";
    if (f.type === "s") emoji = "💛";
    else if (f.type === "f") emoji = "💚";
    else if (f.type === "t") emoji = "💙";
    else if (f.type === "b") emoji = "💞";
    ctx.fillText(emoji, f.x * S, (f.y + 1) * S);
  });

  worm.forEach((p, index) => {
    ctx.fillText(index === 0 ? wormFace : "🟢", p.x * S, (p.y + 1) * S);
  });

  if (isGameOver) {
    ctx.textAlign = "center";
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", 200, 200);
    clearInterval(timeInterval);
    ctx.textAlign = "start";
  }
}


function resetGame() {
  clearInterval(timer);
  clearInterval(timeInterval);
  worm = [];
  foods = [];
  key = "";
  point = 0;
  wormFace = "🙂";
  timer = 0;
  timeInterval = null;
  isStarted = false;
  startTime = null;
  foodAmount = 10;
  growth = 0;
  interval = 200; // ← 初期tick速度に戻す
  isGameOver = false;
  ctx.font = "16px Arial";

  document.getElementById("point").textContent = 0;
  document.getElementById("time").textContent = 0;

  init();
}

function showEnding() {
  clearInterval(timer);
  clearInterval(timeInterval);
  timer = null;
  timeInterval = null;
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.roundRect(30, 30, 340, 340, 30);
  ctx.fill();
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";

  let butterflyLines;
  if (point >= 1000) {
    butterflyLines = ["🦋✨Giant mythical butterfly", "(TRUE END)"];
  } else if (point >= 600) {
    butterflyLines = ["🦋 Big beautiful butterfly"];
  } else if (point >= 300) {
    butterflyLines = ["🦋 Normal butterfly"];
  } else if (point > 0) {
    butterflyLines = ["🦋 Weak butterfly"];
  } else {
    butterflyLines = ["\\💩/🎉 Yay!", "(SECRET END)"];
  }

  ctx.fillText("Finally, the caterpillar turned into a chrysalis.", 200, 200 - 80);
  ctx.fillText("A few days later,", 200, 200 - 40);
  ctx.fillText("what emerged from the chrysalis was...", 200, 200);

  ctx.font = "20px Arial";
  const baseY = 200 + 60;
  const lineHeight = 28;
  const offset = (butterflyLines.length === 2) ? -lineHeight / 2 : 0;

  butterflyLines.forEach((line, i) => {
    ctx.fillText(line, 200, baseY + offset + i * lineHeight);
  });

  ctx.font = "16px Arial";
  ctx.fillText("---- Thank you for playing!", 250, 200 + 150);
  ctx.textAlign = "start";
}
