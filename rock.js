export class Rock {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx, rockImg) {
        ctx.save();
        ctx.drawImage(rockImg, this.x, this.y, this.width, this.height);
        ctx.restore();
    }

    update() {
        this.y += 2; // Velocità di caduta
    }
}

export function createRock(rocks, canvas) {
    let width = 50;
    let height = 50;
    let positions = [
        canvas.width / 6 - width / 2,
        canvas.width / 2 - width / 2,
        5 * canvas.width / 6 - width / 2,
    ];
    let x = positions[Math.floor(Math.random() * positions.length)];
    let y = 0;
    rocks.push(new Rock(x, y, width, height));
}