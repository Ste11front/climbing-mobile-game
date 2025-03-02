export class Hand {
    constructor(x, y, radius, flipped) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.timestamp = Date.now();
        this.hitEffect = false;
        this.flipped = flipped;
    }

    draw(ctx, handImg) {
        ctx.save();
        if (this.hitEffect) {
            ctx.globalAlpha = 0.5;
        }
        if (this.flipped) {
            ctx.scale(-1, 1);
            ctx.drawImage(handImg, -this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        } else {
            ctx.drawImage(handImg, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        }
        ctx.globalAlpha = 1.0;
        ctx.restore();
    }
}

export function createHand(hands, canvas, climberY) {
    let radius = 20;
    let x = Math.random() * (canvas.width - 2 * radius) + radius;
    let y = Math.random() * (climberY - 2 * radius) + radius;
    let flipped = hands.length > 0 ? !hands[hands.length - 1].flipped : false;
    hands.push(new Hand(x, y, radius, flipped));
}