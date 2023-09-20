/* rockImage.src = "/assets/luffy.png";
paperImage.src = "/assets/mihawk.png";
scissorsImage.src = "/assets/buggy.png"; */

// Add this code to your /sim.js file
document.getElementById("restart-button").addEventListener("click", function () {
  resetGame();
});

const canvas = document.getElementById("simulation");
const ctx = canvas.getContext("2d");

const rockImage = new Image();
const paperImage = new Image();
const scissorsImage = new Image();

rockImage.src = "assets/luffy.png";
paperImage.src = "assets/mihawk.png";
scissorsImage.src = "assets/buggy.png";

const images = {
  rock: rockImage,
  paper: paperImage,
  scissors: scissorsImage,
};

class Shape {
  constructor(type) {
    this.type = type;
    this.image = images[type];
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.originalSpeedX = (Math.random() * 0.2 - 0.1) * 1;
    this.originalSpeedY = (Math.random() * 0.2 - 0.1) * 1;
    this.speedX = this.originalSpeedX;
    this.speedY = this.originalSpeedY;
    this.width = 28;
    this.height = 28;
    this.canMove = false;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0 || this.x + this.width > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y + this.height > canvas.height) this.speedY *= -1;

    this.moveTowardsOpponent();
  }
  

  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  checkCollision(other) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (this.width + other.width) / 2;

    if (distance < minDistance) {
      this.transformShape(other);
    }
  }

  transformShape(other) {
    if (
      (this.type === "rock" && other.type === "scissors") ||
      (this.type === "scissors" && other.type === "paper") ||
      (this.type === "paper" && other.type === "rock")
    ) {
      other.type = this.type;
      other.image = images[this.type];
    } else if (
      (other.type === "rock" && this.type === "scissors") ||
      (other.type === "scissors" && this.type === "paper") ||
      (other.type === "paper" && this.type === "rock")
    ) {
      this.type = other.type;
      this.image = images[other.type];
    }
  }
  moveTowardsOpponent() {
    if (!this.canMove) return;
    let closestOpponent = null;
    let closestDistance = Infinity;

    for (const other of shapesArray) {
      if (other === this) continue;

      const opponent = this.type === "rock" && other.type === "scissors"
        || this.type === "paper" && other.type === "rock"
        || this.type === "scissors" && other.type === "paper";

      if (opponent) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestOpponent = other;
        }
      }
    }

    if (closestOpponent) {
      const dx = closestOpponent.x - this.x;
      const dy = closestOpponent.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const speedMultiplier = parseFloat(speedSlider.value);
      this.speedX = (dx / distance) * 0.1 * speedMultiplier;
      this.speedY = (dy / distance) * 0.1 * speedMultiplier;
    }
  }
}

const speedSlider = document.getElementById("speed-slider");

speedSlider.addEventListener("input", function () {
  const speedMultiplier = parseFloat(this.value);
  updateSpeed(speedMultiplier);
});

function updateSpeed(speedMultiplier) {
  for (const shape of shapesArray) {
    shape.speedX = shape.originalSpeedX * speedMultiplier;
    shape.speedY = shape.originalSpeedY * speedMultiplier;
  }
}

const shapesArray = [];

function createShapes(type, count) {
  let delay = 0;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      let shape;
      let validPosition = false;

      while (!validPosition) {
        shape = new Shape(type);
        validPosition = true;

        for (const existingShape of shapesArray) {
          if (existingShape.type === type) {
            const dx = shape.x - existingShape.x;
            const dy = shape.y - existingShape.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 25) {
              validPosition = false;
              break;
            }
          }
        }
      }

      shapesArray.push(shape);
      if (i === count - 1) {
        setTimeout(() => {
          shapesArray.forEach((shape) => (shape.canMove = true));
        }, 100);
      }
    }, delay);
    delay += 100;
  }
}

const rockCount = 1 + Math.floor(Math.random() * 16);
const paperCount = 1 + Math.floor(Math.random() * 16);
const scissorsCount = 1 + Math.floor(Math.random() * 16);

createShapes("rock", rockCount);
createShapes("paper", paperCount);
createShapes("scissors", scissorsCount);

function resetGame() {
  shapesArray.length = 0;
  createShapes("rock", rockCount);
  createShapes("paper", paperCount);
  createShapes("scissors", scissorsCount);
  winnerCheckInterval = setInterval(checkWinner, 1000);
  const winnerMessageElement = document.getElementById("winner-message");
  winnerMessageElement.innerHTML = "";
  const winnerImageElement = document.getElementById("winner-image");
  winnerImageElement.style.display = "none";
}

function checkWinner() {
  const shapeTypes = new Set();
  shapesArray.forEach((shape) => shapeTypes.add(shape.type));

  if (shapeTypes.size === 1) {
    clearInterval(winnerCheckInterval);
    const winnerImageElement = document.getElementById("winner-image");
    const winnerType = Array.from(shapeTypes)[0];
    winnerImageElement.src = images[winnerType].src;
    winnerImageElement.style.display = "block";
    const winnerMessageElement = document.getElementById("winner-message");
    winnerMessageElement.innerHTML = `Game over! The winner is:`;
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const shape of shapesArray) {
    shape.update();
    shape.draw();
  }

  for (let i = 0; i < shapesArray.length; i++) {
    for (let j = i + 1; j < shapesArray.length; j++) {
      shapesArray[i].checkCollision(shapesArray[j]);
    }
  }

  requestAnimationFrame(animate);
}



rockImage.onload = paperImage.onload = scissorsImage.onload = animate;
