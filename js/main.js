// === Sounds ===
const soundFeed = new Audio("sound/feed.wav");
const soundPlay = new Audio("sound/play.wav");
const soundSleep = new Audio("sound/sleep.wav");
const bgMusic = new Audio("sound/background.wav");
bgMusic.loop = true;
bgMusic.volume = 0.2;
const soundGameOver = new Audio("sound/gameover.wav");


// === Canvas & Bilder ===
const canvas = document.getElementById("avocadoCanvas");
const ctx = canvas.getContext("2d");

const startImage = new Image();
startImage.src = "img/happy.png";

const gameOverImage = new Image();
gameOverImage.src = "img/gameover.jpg";

// === Spielzustände ===
let showStartImage = true;
let showGameOverImage = false;
let isGameRunning = false;

let hunger = 20;
let mood = 80;
let energy = 80;
let lifetime = 15;

let gameInterval = null;
let timerInterval = null;

// === Hilfsfunktionen zum Zeichnen ===
function drawEyes() {
  ctx.fillStyle = "#000";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();

  if (!isGameRunning) {
    ctx.arc(135, 180, 5, 0, Math.PI * 2);
    ctx.arc(165, 180, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (energy < 30) {
    ctx.moveTo(130, 180);
    ctx.lineTo(140, 180);
    ctx.moveTo(160, 180);
    ctx.lineTo(170, 180);
    ctx.stroke();
  } else if (mood < 30) {
    ctx.arc(135, 182, 5, 0, Math.PI, true);
    ctx.arc(165, 182, 5, 0, Math.PI, true);
    ctx.fill();
  } else {
    ctx.arc(135, 180, 5, 0, Math.PI * 2);
    ctx.arc(165, 180, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMouth() {
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#000";

  if (!isGameRunning || (hunger <= 60 && mood >= 50 && energy >= 50)) {
    ctx.arc(150, 190, 10, 0, Math.PI, false);
  } else if (hunger > 80 || mood < 30 || energy < 30 || lifetime <= 0) {
    ctx.arc(150, 200, 10, 0, Math.PI);
  } else {
    ctx.moveTo(140, 200);
    ctx.lineTo(160, 200);
  }

  ctx.stroke();
}

function drawAvocado() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (showStartImage) {
    ctx.drawImage(startImage, 0, 0, canvas.width, canvas.height);
    return;
  }

  if (showGameOverImage) {
    ctx.drawImage(gameOverImage, 0, 0, canvas.width, canvas.height);
    return;
  }

  // Körper
  ctx.beginPath();
  ctx.ellipse(150, 200, 60, 90, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#a8d08d";
  ctx.fill();
  ctx.strokeStyle = "#4e944f";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Kern
  ctx.beginPath();
  ctx.arc(150, 230, 25, 0, Math.PI * 2);
  ctx.fillStyle = "#a0522d";
  ctx.fill();

  drawEyes();
  drawMouth();

  // Wangen
  ctx.beginPath();
  ctx.arc(125, 185, 5, 0, Math.PI * 2);
  ctx.arc(175, 185, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#ffb6b6";
  ctx.fill();
}

// === Anzeige aktualisieren ===
function updateDisplay() {
  document.getElementById("hunger").textContent = hunger;
  document.getElementById("mood").textContent = mood;
  document.getElementById("energy").textContent = energy;
  document.getElementById("lifetime").textContent = lifetime;
}

// === Spielmechanik ===
function decay() {
  hunger = Math.min(100, hunger + 1);
  mood = Math.max(0, mood - 1);
  energy = Math.max(0, energy - 1);
  drawAvocado();
  updateDisplay();
}

function startGame() {
  isGameRunning = true;
  showStartImage = false;
  showGameOverImage = false;
  hunger = 20;
  mood = 80;
  energy = 80;
  lifetime = 15;
  bgMusic.play();
  document.getElementById("startBtn").style.display = "none";
  document.getElementById("controls").style.display = "block";
  document.getElementById("restartBtn").style.display = "none";

  drawAvocado();
  updateDisplay();

  gameInterval = setInterval(decay, 1000);
  timerInterval = setInterval(() => {
    lifetime--;
    updateDisplay();
    if (lifetime <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  isGameRunning = false;
  showGameOverImage = true;
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  document.getElementById("controls").style.display = "none";
  document.getElementById("restartBtn").style.display = "inline-block";
  
  bgMusic.pause();
  bgMusic.currentTime = 0;

  soundGameOver.play();  

  drawAvocado();
  alert("Game over!🥑");
}


function restartGame() {
  startGame();
}

// === Benutzeraktionen (Buttons) ===
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("restartBtn").addEventListener("click", restartGame);

document.getElementById("feedBtn").addEventListener("click", () => {
  hunger = Math.max(0, hunger - 20);
  mood = Math.min(100, mood + 5);
  soundFeed.play();
  drawAvocado();
  updateDisplay();
});

document.getElementById("playBtn").addEventListener("click", () => {
  mood = Math.min(100, mood + 15);
  energy = Math.max(0, energy - 10);
  hunger = Math.min(100, hunger + 10);
  soundPlay.play();
  drawAvocado();
  updateDisplay();
});

document.getElementById("sleepBtn").addEventListener("click", () => {
  energy = Math.min(100, energy + 20);
  mood = Math.max(0, mood - 5);
  soundSleep.play();
  drawAvocado();
  updateDisplay();
});


// === Spielstand speichern ===
document.getElementById("saveBtn").addEventListener("click", () => {
  const spielstand = { hunger, mood, energy, lifetime };
  const spielstandJSON = JSON.stringify(spielstand, null, 2);
  const datei = new Blob([spielstandJSON], { type: "application/json" });
  const url = URL.createObjectURL(datei);

  const link = document.createElement("a");
  link.href = url;
  link.download = "avogotchi_spielstand.json";
  link.click();
  URL.revokeObjectURL(url);
});

// === Spielstand laden ===
document.getElementById("loadBtn").addEventListener("click", () => {
  const file = document.getElementById("loadFile").files[0];
  if (!file) {
    alert("Bitte wähle eine Datei aus.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const spielstand = JSON.parse(e.target.result);
      hunger = spielstand.hunger ?? hunger; //Nullish Coalescing Operator
      mood = spielstand.mood ?? mood;
      energy = spielstand.energy ?? energy;
      lifetime = spielstand.lifetime ?? lifetime;
      drawAvocado();
      updateDisplay();
      alert("Spielstand erfolgreich geladen!");
    } catch (err) {
      alert("Fehler beim Laden des Spielstands: " + err.message);
    }
  };
  reader.readAsText(file);
});

// === Initiales Zeichnen ===
document.addEventListener("DOMContentLoaded", function () {
  if (startImage.complete) {
    drawAvocado();
    updateDisplay();
  } else {
    startImage.onload = () => {
      drawAvocado();
      updateDisplay();
    };
  }
});

