export function initInteractiveBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];

    // Dynamic Theme Colors
    let fadeColor = 'rgba(5, 5, 5, 0.2)';
    let accentRgb = { r: 255, g: 255, b: 255 };

    function hexToRgb(hex) {
        hex = hex.replace('#', '').trim();
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        if (hex.length !== 6) return { r: 255, g: 255, b: 255 };
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    }

    function updateThemeColors() {
        const style = getComputedStyle(document.documentElement);
        // Default to dark bg if variable not found immediately
        let bgHex = style.getPropertyValue('--bg-primary').trim() || '#050505';
        let accHex = style.getPropertyValue('--accent').trim() || '#ffffff';

        // Sometimes CSS vars resolve to rgb() if read late, normalize it:
        if (bgHex.startsWith('rgb')) {
            // Just use a tiny regex hack or assume Hex since we hardcoded Hex in variables.css
            // For safety, we keep standard Hex flow as variables.css uses raw Hex
        }

        const bgRgb = hexToRgb(bgHex);
        accentRgb = hexToRgb(accHex);

        fadeColor = `rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, 0.2)`;

        // Update all existing particles
        particles.forEach(p => p.pickColor());
    }

    // Monitor theme changes on <html>
    const observer = new MutationObserver(updateThemeColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    setTimeout(updateThemeColors, 50);

    // Mouse interaction
    let mouse = {
        x: null,
        y: null,
        radius: 150
    };

    window.addEventListener('mousemove', function (event) {
        mouse.x = event.pageX;
        mouse.y = event.pageY;
    });

    window.addEventListener('mouseout', function () {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    function resize() {
        // Essential: Set the inline CSS width/height to match exactly the physical pixels, preventing stretching
        canvas.style.width = '100%';
        canvas.style.height = document.documentElement.scrollHeight + 'px';

        // Critical: Set the logical drawing buffer exactly to the physical layout pixels to prevent internal scaling
        width = canvas.width = window.innerWidth;
        height = canvas.height = document.documentElement.scrollHeight;

        initParticles();
    }

    // React to DOM height changes (like the infinite scroll cloning)
    const docObserver = new ResizeObserver(() => {
        if (Math.abs(canvas.height - document.documentElement.scrollHeight) > 5) {
            resize();
        }
    });
    // Need to observe root element for absolute scale
    docObserver.observe(document.documentElement);

    // Fallback resize listener for standard width adjustments
    window.addEventListener('resize', resize);

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.baseX = this.x;
            this.baseY = this.y;

            this.size = (Math.random() * 3) + 1;
            this.pickColor();
        }

        pickColor() {
            const opacities = [0.1, 0.2, 0.3, 0.5];
            const op = opacities[Math.floor(Math.random() * opacities.length)];
            this.color = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${op})`;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.size * 2, this.size * 2);
        }

        update() {
            if (!this.angle) {
                this.angle = Math.random() * Math.PI * 2;
                this.speed = (Math.random() * 0.2) + 0.05;
            }
            this.angle += 0.01;
            this.x = this.baseX + Math.cos(this.angle) * 10;
            this.y = this.baseY + Math.sin(this.angle) * 10;

            this.draw();
        }
    }

    function initParticles() {
        particles = [];
        let numberOfParticles = (width * height) / 9000;
        for (let i = 0; i < numberOfParticles; i++) {
            let x = Math.random() * width;
            let y = Math.random() * height;
            particles.push(new Particle(x, y));
        }
    }

    function animate() {
        ctx.fillStyle = fadeColor;
        ctx.fillRect(0, 0, width, height);

        connect();

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
        }
        requestAnimationFrame(animate);
    }

    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = (dx * dx) + (dy * dy);

                if (distance < (width / 9) * (height / 9)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${opacityValue * 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }

            if (mouse.x != null) {
                let mouseDx = particles[a].x - mouse.x;
                let mouseDy = particles[a].y - mouse.y;
                let mouseDistance = (mouseDx * mouseDx) + (mouseDy * mouseDy);

                if (mouseDistance < 25000) {
                    let mouseOpacity = 1 - (mouseDistance / 25000);
                    ctx.strokeStyle = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${mouseOpacity * 0.6})`;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
    }

    // Initial generation and observer startup already occurred
    resize();
    animate();
}
