const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let climber = {
    x: canvas.width / 2 - 25,
    y: canvas.height - canvas.height / 4,
    width: 50,
    height: 50,
    speed: 3,
    lives: 3,
    position: 'center',
    invincible: false,
    hitEffect: false
};
let circles = [];
let rocks = [];
let backgroundY = 0;
let score = 0;
let meters = 0; // Counter for meters
let gamePaused = false; // Flag to check if the game is paused

const backgroundImg = new Image();
backgroundImg.src = 'https://image.thecrag.com/213x320/cb/ed/cbedef6d7a8f43a9e257755da80c24d5d44b74aa';

const climberImg = new Image();
climberImg.src = 'https://static.vecteezy.com/system/resources/thumbnails/026/990/676/small/one-single-line-drawing-of-young-active-man-climbing-on-cliff-mountain-holding-safety-rope-graphic-illustration-extreme-outdoor-sport-and-bouldering-concept-modern-continuous-line-draw-design-png.png';

const rockImg = new Image();
rockImg.src = 'https://pngimg.com/d/stone_PNG13588.png';

const retryButton = document.getElementById('retryButton');

// Function to adjust brightness and contrast of an image
function adjustImageBrightnessContrast(image, brightness = 1.5, contrast = 1.5) {
    const offScreenCanvas = document.createElement('canvas');
    const offScreenCtx = offScreenCanvas.getContext('2d');
    offScreenCanvas.width = image.width;
    offScreenCanvas.height = image.height;

    offScreenCtx.filter = `brightness(${brightness}) contrast(${contrast})`;
    offScreenCtx.drawImage(image, 0, 0, image.width, image.height);

    return offScreenCanvas;
}

// Function to draw the background
function drawBackground() {
    ctx.drawImage(backgroundImg, 0, backgroundY, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, 0, backgroundY - canvas.height, canvas.width, canvas.height);
    if (backgroundY >= canvas.height) {
        backgroundY = 0;
    }
}

// Function to draw the climber
function drawClimber() {
    const adjustedClimberImg = adjustImageBrightnessContrast(climberImg);
    if (climber.hitEffect) {
        ctx.globalAlpha = 0.5;
    }
    ctx.drawImage(adjustedClimberImg, climber.x, climber.y, climber.width, climber.height);
    ctx.globalAlpha = 1.0;
}

// Function to create a new circle
function createCircle() {
    let radius = 20;
    let x = Math.random() * (canvas.width - 2 * radius) + radius;
    let y = Math.random() * (climber.y - 2 * radius) + radius;
    circles.push({ x, y, radius, timestamp: Date.now() });
}

// Function to create a new rock
function createRock() {
    let width = 50;
    let height = 50;
    let positions = [
        canvas.width / 6 - width / 2,
        canvas.width / 2 - width / 2,
        5 * canvas.width / 6 - width / 2
    ];
    let x = positions[Math.floor(Math.random() * positions.length)];
    let y = 0;
    rocks.push({ x, y, width, height });
}

// Function to draw circles
function drawCircles() {
    circles.forEach(circle => {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.closePath();
    });
}

// Function to draw rocks
function drawRocks() {
    rocks.forEach(rock => {
        ctx.drawImage(rockImg, rock.x, rock.y, rock.width, rock.height);
        rock.y += 2; // Speed of falling rocks
    });
}

// Function to update the game state
function updateGame() {
    if (gamePaused) return;

    const now = Date.now();

    // Update circles
    circles = circles.filter(circle => {
        if (now - circle.timestamp > 3000) return false;  // Remove circles after 3 seconds

        // Check if the climber hits a circle
        if (circle.y + circle.radius >= climber.y && circle.y - circle.radius <= climber.y + climber.height &&
            circle.x + circle.radius >= climber.x && circle.x - circle.radius <= climber.x + climber.width) {
            score += 10;
            meters += 1;  // Increase the meters counter
            backgroundY += 10;  // Move the background down slower
            return false;
        }
        return true;
    });

    // Update rocks
    rocks = rocks.filter(rock => {
        if (rock.y > canvas.height) return false; // Remove rocks off the screen

        // Check if the climber hits a rock
        if (rock.y + rock.height >= climber.y && rock.y <= climber.y + climber.height &&
            rock.x + rock.width >= climber.x && rock.x <= climber.x + climber.width) {
            climber.lives -= 1;
            climber.invincible = true;
            climber.hitEffect = true;
            setTimeout(() => {
                climber.invincible = false;
                climber.hitEffect = false;
            }, 1000);  // 1 second of invincibility and hit effect
            if (climber.lives <= 0) {
                showRetryButton();  // Show retry button on game over
            }
            return false;
        }
        return true;
    });
}

// Function to draw the lives
function drawLives() {
    for (let i = 0; i < climber.lives; i++) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(20 + i * 30, 20, 10, 0, Math.PI * 2);  // Position lives on the left
        ctx.fill();
        ctx.closePath();
    }
}

// Function to draw the meters counter
function drawMeters() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Meters: ${meters}`, canvas.width - 125, 30);  // Position meters counter slightly more to the left
}

// Function to handle touch events for moving the climber
canvas.addEventListener('touchstart', function(event) {
    const touch = event.touches[0];

    if (touch.clientY >= climber.y) {
        if (touch.clientX < canvas.width / 3) {
            climber.position = 'left';
            climber.x = canvas.width / 6 - climber.width / 2;
        } else if (touch.clientX > 2 * canvas.width / 3) {
            climber.position = 'right';
            climber.x = 5 * canvas.width / 6 - climber.width / 2;
        } else {
            climber.position = 'center';
            climber.x = canvas.width / 2 - climber.width / 2;
        }
    }

    circles.forEach((circle, index) => {
        let touchYOffset = 10;  // Adjust this value as needed
        if (touch.clientX >= circle.x - circle.radius && touch.clientX <= circle.x + circle.radius &&
            touch.clientY - touchYOffset >= circle.y - circle.radius && touch.clientY - touchYOffset <= circle.y + circle.radius) {
            backgroundY += 10;  // Move the background down slower
            meters += 1; // Increment meters counter when clicking on a circle
            circles.splice(index, 1);  // Remove the circle
        }
    });
});

function showRetryButton() {
    retryButton.style.display = 'block';
    gamePaused = true; // Pause the game
}

retryButton.addEventListener('click', function() {
    document.location.reload();  // Reload the game on retry
});

function gameLoop() {
    if (!gamePaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        drawClimber();
        drawCircles();
        drawRocks();
        drawLives();
        drawMeters();  // Draw the meters counter
        updateGame();
    }
    requestAnimationFrame(gameLoop);
}

// Initialize game
createCircle();
createRock();
gameLoop();
setInterval(createCircle, 1000); // Create a new circle every second
setInterval(createRock, 3000); // Create a new rock every 3 seconds
