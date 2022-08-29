const canvas = document.querySelector('canvas');
const scoreElement = document.querySelector('#score');
const startGameBtn = document.querySelector('#start-game-btn');
const startGameModal = document.querySelector('#start-game-modal');
const bigScoreElement = startGameModal.querySelector('#big-score')

canvas.width = innerWidth;
canvas.height = innerHeight;

const c = canvas.getContext('2d')

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

const friction = 0.98;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }
    update() {
        this.draw();
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}

const xc = canvas.width / 2;
const yc = canvas.height / 2;

const player = new Player(xc, yc, 20, 'white');

let enemies = [];
let particles = [];
let projectiles = [];

const init = () => {
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreElement.innerText = score;
    bigScoreElement.innerText = score;
};

const spawnEnemy = () => {
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4;
        let x, y;
        if (Math.random() < .5) {
            x = Math.random() < .5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        } else {
            x = Math.random() * canvas.width;
            y = Math.random() < .5 ? 0 - radius : canvas.height + radius;
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
        const angle = Math.atan2(yc - y, xc - x);
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000)
};

let animationId;
let score = 0;
const animation = () => {
    animationId = requestAnimationFrame(animation);
    c.fillStyle = 'rgba(0, 0, 0, .3)'
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();
    particles.forEach((particle, particleIndex) => {
        if (particle.alpha <= 0) {
            particles.splice(particleIndex, 1);
        } else {
            particle.update();
        }
    })
    projectiles.forEach((projectile, projectileIndex) => {
        projectile.update();

        if (
            projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1)
            }, 0);
        }
    });
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - player.radius - enemy.radius < 0) {
            cancelAnimationFrame(animationId);
            bigScoreElement.innerText = score;
            startGameModal.style.display = 'flex'
        }
        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            if (dist - projectile.radius - enemy.radius < 0) {
                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                        x: (Math.random() - 0.5) * (Math.random() * 8),
                        y: (Math.random() - 0.5) * (Math.random() * 8),
                    }))
                }
                if (enemy.radius - 10 > 5) {
                    score += 100;
                    scoreElement.innerText = score;
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                } else {
                    score += 250;
                    scoreElement.innerText = score;
                    setTimeout(() => {
                        enemies.splice(enemyIndex, 1);
                        projectiles.splice(projectileIndex, 1);
                    }, 0);
                }
            }
        });
    });
};

addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - yc, event.clientX - xc);
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    const projectile = new Projectile(xc, yc, 6, 'white', velocity);
    projectiles.push(projectile);
});

startGameBtn.addEventListener('click', () => {
    init();
    animation();
    spawnEnemy();
    startGameModal.style.display = 'none';
});