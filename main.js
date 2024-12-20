const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Eventuali aggiustamenti necessari al ridimensionamento degli elementi di gioco
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();  // Chiamata iniziale per impostare la dimensione

canvas.addEventListener('touchstart', function(event) {
    event.preventDefault(); // Aggiungi questa riga per prevenire il comportamento di default del tocco
    const touch = event.touches[0];
});

function vibrate(duration) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

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

// Assicurati che l'immagine del climber sia caricata prima di iniziare il gioco
climberImg.onload = function() {
    startGame();
};

function startGame() {
    createCircle();
    createRock();
    gameLoop();
    setInterval(createCircle, 1000); // Crea un nuovo cerchio ogni secondo
    setInterval(createRock, 3000); // Crea una nuova roccia ogni 3 secondi
}

const rockImg = new Image();
rockImg.src = 'https://pngimg.com/d/stone_PNG13588.png';

const lifeImg = new Image();
lifeImg.src = 'https://i.pinimg.com/originals/d7/12/f5/d712f5d82e60ffaed78e8015dd75787c.png';

const circleImg = new Image();
circleImg.src = 'https://cdn-icons-png.flaticon.com/512/2717/2717414.png';

const leftArrow = '←';
const rightArrow = '→';
const centerDot = '•';

const retryButton = document.getElementById('retryButton');

// Funzione per regolare la luminosità e il contrasto di un'immagine
function adjustImageBrightnessContrast(image, brightness = 1, contrast = 2) {
    const offScreenCanvas = document.createElement('canvas');
    const offScreenCtx = offScreenCanvas.getContext('2d');
    offScreenCanvas.width = image.width;
    offScreenCanvas.height = image.height;

    offScreenCtx.filter = `brightness(${brightness}) contrast(${contrast})`;
    offScreenCtx.drawImage(image, 0, 0, image.width, image.height);

    return offScreenCanvas;
}

function drawBackground() {
    ctx.drawImage(backgroundImg, 0, backgroundY, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, 0, backgroundY - canvas.height, canvas.width, canvas.height);
    if (backgroundY >= canvas.height) {
        backgroundY = 0;
    }
}

function drawClimber() {
    const adjustedClimberImg = adjustImageBrightnessContrast(climberImg);
    if (climber.hitEffect) {
        ctx.globalAlpha = 0.5;
    }
    ctx.drawImage(adjustedClimberImg, climber.x, climber.y, climber.width, climber.height);
    ctx.globalAlpha = 1.0;
}

function createCircle() {
    let radius = 20;
    let x = Math.random() * (canvas.width - 2 * radius) + radius;
    let y = Math.random() * (climber.y - 2 * radius) + radius;
    circles.push({ x, y, radius, timestamp: Date.now() });
}

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

function drawCircles() {
    circles.forEach(circle => {
        ctx.drawImage(circleImg, circle.x - circle.radius, circle.y - circle.radius, circle.radius * 2, circle.radius * 2);
    });
}

function drawRocks() {
    rocks.forEach(rock => {
        ctx.drawImage(rockImg, rock.x, rock.y, rock.width, rock.height);
        rock.y += 2; // Velocità di caduta delle rocce
    });
}

function drawArrows() {
    const arrowSize = 50;  // Dimensione maggiore degli indicatori
    ctx.font = `${arrowSize}px Arial`;
    ctx.fillStyle = 'gold';
    
    const arrowY = climber.y + climber.height + 50; // Posizione verticale dei simboli

    if (climber.position !== 'left') {
        ctx.fillText(leftArrow, 40, arrowY);
    }
    if (climber.position !== 'right') {
        ctx.fillText(rightArrow, canvas.width - 90, arrowY);
    }
    if (climber.position !== 'center') {
        ctx.fillText(centerDot, canvas.width / 2 - 20, arrowY);
    }
}

function updateGame() {
    if (gamePaused) return;

    const now = Date.now();

    circles = circles.filter(circle => {
        if (now - circle.timestamp > 3000) return false;

        if (circle.y + circle.radius >= climber.y && circle.y - circle.radius <= climber.y + climber.height &&
            circle.x + circle.radius >= climber.x && circle.x - circle.radius <= climber.x + climber.width) {
            score += 10;
            meters += 1;
            backgroundY += 10;
            return false;
        }
        return true;
    });

    let impactOccurred = false;

    rocks = rocks.filter(rock => {
        if (rock.y > canvas.height) return false;
    
        if (rock.y + rock.height >= climber.y && rock.y <= climber.y + climber.height &&
            rock.x + rock.width >= climber.x && rock.x <= climber.x + climber.width) {
            if (!climber.invincible) {
                climber.lives -= 1;
                climber.invincible = true;
                climber.hitEffect = true;
                impactOccurred = true;
    
                vibrate(200); // Attiva la vibrazione per 200ms
    
                setTimeout(() => {
                    climber.invincible = false;
                    climber.hitEffect = false;
                }, 1000);
    
                if (climber.lives <= 0) {
                    // Non fermiamo ancora il gioco qui per far vedere la perdita di vita
                    impactOccurred = true;
                }
            }
            return false;
        }
        return true;
    });    

    if (impactOccurred) {
        if (climber.lives <= 0) {
            // Imposta un breve timeout per permettere di vedere l'effetto colpo prima del game over
            setTimeout(() => {
                showRetryButton();
            }, 50); // Regola questo valore per migliorare la fluidità dell'effetto
        }
    }
}

function drawLives() {
    for (let i = 0; i < climber.lives; i++) {
        ctx.drawImage(lifeImg, 20 + i * 30, 10, 20, 20);
    }
}

function drawMeters() {
    ctx.fillStyle = 'gold';
    ctx.font = '20px Arial';
    ctx.fillText(`Metri: ${meters}`, canvas.width - 100, 30);
}

canvas.addEventListener('touchstart', function(event) {
    const touch = event.touches[0];

    if (touch.clientY >= climber.y) {
        if (climber.position === 'center') {
            if (touch.clientX < canvas.width / 3) {
                climber.position = 'left';
                climber.x = canvas.width / 6 - climber.width / 2;
            } else if (touch.clientX > 2 * canvas.width / 3) {
                climber.position = 'right';
                climber.x = 5 * canvas.width / 6 - climber.width / 2;
            }
        } else if (climber.position === 'left') {
            if (touch.clientX > 2 * canvas.width / 3) {
                climber.position = 'center';
                climber.x = canvas.width / 2 - climber.width / 2;
            } else if (touch.clientX >= canvas.width / 3 && touch.clientX <= 2 * canvas.width / 3) {
                climber.position = 'center';
                climber.x = canvas.width / 2 - climber.width / 2;
            }
        } else if (climber.position === 'right') {
            if (touch.clientX < canvas.width / 3) {
                climber.position = 'center';
                climber.x = canvas.width / 2 - climber.width / 2;
            } else if (touch.clientX >= canvas.width / 3 && touch.clientX <= 2 * canvas.width / 3) {
                climber.position = 'center';
                climber.x = canvas.width / 2 - climber.width / 2;
            }
        }
    }

    circles.forEach((circle, index) => {
        let touchYOffset = 30;
        if (touch.clientX >= circle.x - circle.radius && touch.clientX <= circle.x + circle.radius &&
            touch.clientY - touchYOffset >= circle.y - circle.radius && touch.clientY - touchYOffset <= circle.y + circle.radius) {
            backgroundY += 10;
            meters += 1;
            circles.splice(index, 1);
        }
    });
});

function showRetryButton() {
    retryButton.style.display = 'block';
    gamePaused = true;
}

retryButton.addEventListener('click', function() {
    document.location.reload();
});

function gameLoop() {
    if (!gamePaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        drawClimber();
        drawCircles();
        drawRocks();
        drawLives();
        drawMeters();
        drawArrows(); // Disegna le frecce
        updateGame();
    }
    requestAnimationFrame(gameLoop);
}