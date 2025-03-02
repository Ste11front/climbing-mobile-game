export const climber = {
    x: 0,
    y: 0,
    width: 60,
    height: 60,
    speed: 3,
    lives: 3,
    position: 'center',
    invincible: false,
    hitEffect: false,
    flipped: false,
};

climber.image = new Image();
climber.image.src = 'https://static.vecteezy.com/system/resources/thumbnails/026/990/676/small/one-single-line-drawing-of-young-active-man-climbing-on-cliff-mountain-holding-safety-rope-graphic-illustration-extreme-outdoor-sport-and-bouldering-concept-modern-continuous-line-draw-design-png.png';

export function initializeClimber(canvas) {
    climber.x = canvas.width / 2 - climber.width / 2;
    climber.y = canvas.height - canvas.height / 3;
}

export function drawClimber(ctx) {
    ctx.save();
    if (climber.hitEffect) {
        ctx.globalAlpha = 0.5;
    }
    if (climber.flipped) {
        ctx.scale(-1, 1);
        ctx.drawImage(climber.image, -climber.x - climber.width, climber.y, climber.width, climber.height);
    } else {
        ctx.drawImage(climber.image, climber.x, climber.y, climber.width, climber.height);
    }
    ctx.globalAlpha = 1.0;
    ctx.restore();
}

export function updateClimberPosition(position, canvas) {
    climber.position = position;
    switch (position) {
        case 'left':
            climber.x = canvas.width / 6 - climber.width / 2;
            climber.flipped = true;
            break;
        case 'center':
            climber.x = canvas.width / 2 - climber.width / 2;
            climber.flipped = false;
            break;
        case 'right':
            climber.x = 5 * canvas.width / 6 - climber.width / 2;
            climber.flipped = false;
            break;
    }
}

export function drawLives(ctx, lifeImg) {
    ctx.save();
    ctx.shadowColor = 'black';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 4;
    for (let i = 0; i < climber.lives; i++) {
        ctx.drawImage(lifeImg, 20 + i * 30, 10, 20, 20);
    }
    ctx.restore();
}