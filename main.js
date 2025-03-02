import { climber, initializeClimber, drawClimber, updateClimberPosition, drawLives } from './climber.js';
import { Hand, createHand } from './hand.js';
import { Rock, createRock } from './rock.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let hands = [];
let rocks = [];
let backgroundY = 0;
let score = 0;
let meters = 0;
let gamePaused = false;

const backgroundImg = new Image();
backgroundImg.src = 'https://image.thecrag.com/213x320/cb/ed/cbedef6d7a8f43a9e257755da80c24d5d44b74aa';

const lifeImg = new Image();
lifeImg.src = 'https://i.pinimg.com/originals/d7/12/f5/d712f5d82e60ffaed78e8015dd75787c.png';

const handImg = new Image();
handImg.src = 'https://cdn-icons-png.flaticon.com/512/2717/2717414.png';

const rockImg = new Image();
rockImg.src = 'https://pngimg.com/d/stone_PNG13588.png';

const retryButton = document.getElementById('retryButton');

function drawBackground() {
    ctx.drawImage(backgroundImg, 0, backgroundY, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, 0, backgroundY - canvas.height, canvas.width, canvas.height);
    if (backgroundY >= canvas.height) {
        backgroundY = 0;
    }
}

function drawHands() {
    ctx.save();
    ctx.shadowColor = 'black';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 4;
    hands.forEach(hand => {
        hand.draw(ctx, handImg);
    });
    ctx.restore();
}

function drawRocks() {
    ctx.save();
    ctx.shadowColor = 'black';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 4;
    rocks.forEach(rock => {
        rock.draw(ctx, rockImg);
        rock.update();
    });
    ctx.restore();
}

function drawArrows() {
    ctx.save();
    const arrowSize = 50;
    ctx.font = `${arrowSize}px Arial`;
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'black';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 4;

    const arrowY = climber.y + climber.height + 75;

    if (climber.position !== 'left') {
        ctx.fillText('←', 40, arrowY);
    }
    if (climber.position !== 'right') {
        ctx.fillText('→', canvas.width - 90, arrowY);
    }
    if (climber.position !== 'center') {
        ctx.fillText('•', canvas.width / 2 - 20, arrowY);
    }
    ctx.restore();
}

function drawMeters() {
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.shadowColor = 'black';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 4;

    const text = `Metri: ${meters}`;
    const textWidth = ctx.measureText(text).width;
    let xPosition = canvas.width - textWidth - 20;

    ctx.fillText(text, xPosition, 30);
    ctx.restore();
}

function vibrate(duration) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

function updateGame() {
    if (gamePaused) return;

    const now = Date.now();

    hands = hands.filter(hand => {
        if (now - hand.timestamp > 3000) return false;

        if (hand.y + hand.radius >= climber.y && hand.y - hand.radius <= climber.y + climber.height &&
            hand.x + hand.radius >= climber.x && hand.x - hand.radius <= climber.x + climber.width) {
            score += 10;
            meters += 1;
            backgroundY += 10;
            return false;
        }
        return true;
    });

    rocks = rocks.filter(rock => {
        if (rock.y > canvas.height) return false;

        if (rock.y + rock.height >= climber.y && rock.y <= climber.y + climber.height &&
            rock.x + rock.width >= climber.x && rock.x <= climber.x + climber.width) {
            if (!climber.invincible) {
                climber.lives -= 1;
                climber.invincible = true;
                climber.hitEffect = true;

                vibrate(200);

                setTimeout(() => {
                    climber.invincible = false;
                    climber.hitEffect = false;
                }, 1000);

                if (climber.lives <= 0) {
                    setTimeout(() => {
                        showRetryButton();
                    }, 50);
                }
            }
            return false;
        }
        return true;
    });
}

function showRetryButton() {
    retryButton.style.display = 'block';
    gamePaused = true;
}

retryButton.addEventListener('click', function() {
    document.location.reload();
});

canvas.addEventListener('touchstart', function(event) {
    const touch = event.touches[0];

    if (touch.clientY >= climber.y) {
        if (touch.clientX < canvas.width / 3) {
            updateClimberPosition('left', canvas);
        } else if (touch.clientX > 2 * canvas.width / 3) {
            updateClimberPosition('right', canvas);
        } else {
            updateClimberPosition('center', canvas);
        }
    }

    hands.forEach((hand, index) => {
        let touchYOffset = 30;
        if (touch.clientX >= hand.x - hand.radius && touch.clientX <= hand.x + hand.radius &&
            touch.clientY - touchYOffset >= hand.y - hand.radius && touch.clientY - touchYOffset <= hand.y + hand.radius) {
            backgroundY += 10;
            meters += 1;
            hand.hitEffect = true;
            climber.flipped = !climber.flipped;
            setTimeout(() => {
                hands.splice(index, 1);
            }, 250);
        }
    });
});

function startGame() {
    initializeClimber(canvas);
    createHand(hands, canvas, climber.y);
    createRock(rocks, canvas);
    gameLoop();
    setInterval(() => createHand(hands, canvas, climber.y), 1000);
    setInterval(() => createRock(rocks, canvas), 3000);
}

function gameLoop() {
    if (!gamePaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        drawClimber(ctx);
        drawHands();
        drawRocks();
        drawLives(ctx, lifeImg);
        drawMeters();
        drawArrows();
        updateGame();
    }
    requestAnimationFrame(gameLoop);
}

startGame();