// --- BACKGROUND STARS GENERATOR ---
const starsContainer = document.getElementById('stars-container');
for (let i = 0; i < 60; i++) {
    let star = document.createElement('div');
    star.className = 'bg-star';
    star.style.width = Math.random() * 3 + 1 + 'px';
    star.style.height = star.style.width;
    star.style.left = Math.random() * 100 + 'vw';
    star.style.top = Math.random() * 65 + 'vh'; // More stars concentrated in the upper 65% of the sky
    star.style.animationDelay = Math.random() * 4 + 's';
    starsContainer.appendChild(star);
}

for (let i = 0; i < 20; i++) {
    let z = document.createElement('div');
    z.className = 'bg-z-letter';
    z.innerText = 'Z';
    z.style.left = Math.random() * 100 + 'vw';
    z.style.top = Math.random() * 100 + 'vh';
    z.style.fontSize = (Math.random() * 2 + 1.5) + 'rem';
    z.style.animationDelay = Math.random() * 8 + 's';
    starsContainer.appendChild(z);
}

// --- FIREWORKS SYSTEM ---
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');
let cw = canvas.width = window.innerWidth;
let ch = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    cw = canvas.width = window.innerWidth;
    ch = canvas.height = window.innerHeight;
    hwArea = window.innerWidth;
    hhArea = window.innerHeight;
    heartCanvas.width = hwArea;
    heartCanvas.height = hhArea;
    initHeartPoints();
});

const particles = [];
// White, Pink, Purple theme colors
const fwColors = ['#ff69b4', '#ffffff', '#dda0dd', '#ffb6c1', '#fce4ec', '#d500f9', '#ec407a'];

class Particle {
    constructor(x, y, isShell, type = 'circle') {
        this.x = x;
        this.y = y;
        this.isShell = isShell;
        this.type = type; // 'circle', 'star', 'heart'
        this.history = []; // For trails
        this.gravity = 0.08;
        this.opacity = 1;

        if (isShell) {
            this.color = fwColors[Math.floor(Math.random() * fwColors.length)];
            // Slightly angled shot
            this.vx = (Math.random() - 0.5) * 4;
            // Strong vertical velocity
            this.vy = -(Math.random() * 4 + 14);
            this.size = 4;
            this.friction = 0.985;
        } else {
            this.color = fwColors[Math.floor(Math.random() * fwColors.length)];
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 2;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.size = Math.random() * 4 + 1.5;
            this.friction = 0.94;
            this.decay = Math.random() * 0.015 + 0.01;
        }
    }

    update() {
        this.history.push({ x: this.x, y: this.y });
        if (this.history.length > (this.isShell ? 8 : 4)) {
            this.history.shift();
        }

        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        if (!this.isShell) {
            this.opacity -= this.decay;
        }
    }

    draw(ctx) {
        ctx.globalAlpha = this.opacity;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw Trail
        if (this.history.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.history[0].x, this.history[0].y);
            for (let i = 1; i < this.history.length; i++) {
                ctx.lineTo(this.history[i].x, this.history[i].y);
            }
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.isShell ? 3 : this.size;
            ctx.stroke();
        }

        // Draw main body
        ctx.fillStyle = this.color;

        if (this.type === 'circle' || this.isShell) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'star') {
            drawStar(ctx, this.x, this.y, this.size * 2);
        } else if (this.type === 'heart') {
            drawHeartParticle(ctx, this.x, this.y, this.size * 2);
        }
    }
}

function drawStar(ctx, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        ctx.lineTo(0, -r);
        ctx.translate(0, -r);
        ctx.rotate((Math.PI * 2) / 10);
        ctx.lineTo(0, r / 2.5);
        ctx.translate(0, r / 2.5);
        ctx.rotate((Math.PI * 2) / 10);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawHeartParticle(ctx, x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 15, size / 15);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-5, -5, -10, 5, 0, 10);
    ctx.bezierCurveTo(10, 5, 5, -5, 0, 0);
    ctx.fill();
    ctx.restore();
}

let isFiring = false;
let animationId;

function loop() {
    if (!isFiring && particles.length === 0) {
        ctx.clearRect(0, 0, cw, ch);
        return;
    }
    animationId = requestAnimationFrame(loop);

    // Clear the whole canvas frame for clean, vibrant rendering
    ctx.clearRect(0, 0, cw, ch);

    if (isFiring && Math.random() < 0.08) {
        // Random bottom shells springing up, restricted mostly to bottom area
        particles.push(new Particle(Math.random() * (cw - 100) + 50, ch, true));
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.update();
        p.draw(ctx);

        if (p.isShell && p.vy >= 0) {
            // Shell reached apex, explode!
            particles.splice(i, 1);
            let pCount = Math.floor(Math.random() * 30 + 40);
            for (let j = 0; j < pCount; j++) {
                let typeRand = Math.random();
                // 40% circles, 30% stars, 30% hearts
                let type = typeRand < 0.4 ? 'circle' : (typeRand < 0.7 ? 'star' : 'heart');
                particles.push(new Particle(p.x, p.y, false, type));
            }
        } else if (!p.isShell && p.opacity <= 0) {
            // Particle faded
            particles.splice(i, 1);
        }
    }
}


// --- HEART STRING ANIMATION ---
const heartCanvas = document.getElementById('heartCanvas');
const hCtx = heartCanvas.getContext('2d');
let hwArea = heartCanvas.width = window.innerWidth;
let hhArea = heartCanvas.height = window.innerHeight;

let heartPoints = [];
const POINT_COUNT = 150;

function initHeartPoints() {
    heartPoints = [];
    for (let i = 0; i < POINT_COUNT; i++) {
        let t = Math.PI * 2 * i / POINT_COUNT;
        let x = 16 * Math.pow(Math.sin(t), 3);
        let y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        heartPoints.push({ x, y });
    }
}
initHeartPoints();

let currentLine = 0;
let linesToDraw = 420; // Looks full, takes approx 3-4s
let heartAnimating = false;

function drawNextString() {
    if (!heartAnimating) return;

    // Draw 2 lines per frame for nice speed
    for (let k = 0; k < 2; k++) {
        if (currentLine >= linesToDraw) {
            heartAnimating = false;
            showFinalEnvelopes();
            return;
        }

        let p1Index = currentLine % POINT_COUNT;
        let p2Index = (currentLine * 67) % POINT_COUNT; // Magic prime offset for cool pattern

        let p1 = heartPoints[p1Index];
        let p2 = heartPoints[p2Index];

        // Scale proportionally to window size
        let scale = Math.min(hwArea, hhArea) / 45;

        // Center of canvas
        let cx = hwArea / 2;
        let cy = hhArea / 2 - 20; // slightly up

        hCtx.beginPath();
        hCtx.moveTo(cx + p1.x * scale, cy - p1.y * scale);
        hCtx.lineTo(cx + p2.x * scale, cy - p2.y * scale);

        hCtx.strokeStyle = 'rgba(255, 30, 80, 0.3)'; // Deep dynamic crimson red, semi-transparent
        hCtx.lineWidth = 1;
        hCtx.stroke();

        currentLine++;
    }
    requestAnimationFrame(drawNextString);
}


// --- SEQUENCE CONTROL ---

window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelector('.cannon').classList.add('shoot-anim');

        // Initial shot directly from the CSS cannon bounds roughly
        isFiring = true;
        loop();

        let barrel = document.querySelector('.barrel-container');
        let rect = barrel.getBoundingClientRect();
        particles.push(new Particle(rect.left + rect.width, rect.top, true));

        // Run fireworks show for 7 seconds
        setTimeout(() => {
            isFiring = false;
            // Fade out cannon
            document.getElementById('cannon-container').style.opacity = '0';

            // Let remaining particles settle, then show UI
            setTimeout(() => {
                document.getElementById('scene1').classList.remove('hidden');
                setTimeout(() => {
                    document.getElementById('scene1').style.opacity = '1';
                }, 50);
            }, 3000);
        }, 7000);
    }, 1000);
});

function openLetter(sceneNum) {
    const icon = document.querySelector(`#scene${sceneNum} .envelope-icon`);
    const letter = document.getElementById(`letter${sceneNum}`);

    // Hide smoothly or instantly
    icon.style.pointerEvents = 'none';
    icon.style.opacity = '0';
    setTimeout(() => { icon.style.display = 'none'; }, 300);

    // Show beautiful letter glass card
    letter.classList.add('open');
}

function nextScene(num) {
    // Hide current scene gracefully
    const currentScene = document.getElementById(`scene${num - 1}`);
    currentScene.classList.add('hidden');

    // Show next scene
    const nextScene = document.getElementById(`scene${num}`);
    nextScene.classList.remove('hidden');
}

function startHeartAnimation() {
    const currentScene = document.getElementById('scene2');
    currentScene.classList.add('hidden');

    heartAnimating = true;
    currentLine = 0;
    hCtx.clearRect(0, 0, hwArea, hhArea);
    drawNextString();
}

function showFinalEnvelopes() {
    const finalScene = document.getElementById('final-scene');
    finalScene.classList.remove('hidden');
    // small delay for UI thread + css bounce
    setTimeout(() => {
        finalScene.querySelector('.final-envelopes').classList.add('show');
    }, 100);
}

// Interactivity for final sequence to replay memories
function replayLetter(num) {
    const finalScene = document.getElementById('final-scene');
    finalScene.querySelector('.final-envelopes').classList.remove('show');

    setTimeout(() => {
        finalScene.classList.add('hidden');
        const targetScene = document.getElementById(`scene${num}`);
        targetScene.classList.remove('hidden');

        // Ensure icon is visible and letter is closed for real replay
        const icon = document.querySelector(`#scene${num} .envelope-icon`);
        const letter = document.getElementById(`letter${num}`);
        if (icon) {
            icon.style.display = 'block';
            icon.style.opacity = '1';
            icon.style.pointerEvents = 'auto';
        }
        if (letter) {
            letter.classList.remove('open');
        }

    }, 1000); // matching CSS transition
}
