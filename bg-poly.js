export function initLowPolyBackground() {
    const canvas = document.getElementById('bg-poly-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let points = [];
    let triangles = [];

    // Configuration
    const CELL_SIZE = 120;
    const VARIANCE = 120; // Massive variance for crystallize mesh distortion

    // Dynamic Theme Colors
    let baseHex = '#111111';
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
        let bgHex = style.getPropertyValue('--bg-primary').trim() || '#121212';
        let accHex = style.getPropertyValue('--accent').trim() || '#ffffff';

        baseHex = bgHex;
        accentRgb = hexToRgb(accHex);

        // Slightly modify base colors if needed, but we rely on lightness variations
    }

    // Monitor theme changes on <html>
    const observer = new MutationObserver(updateThemeColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    setTimeout(updateThemeColors, 50);

    // Mouse interaction
    let mouse = {
        x: -1000,
        y: -1000,
        radius: 400
    };

    window.addEventListener('mousemove', function (event) {
        mouse.x = event.pageX;
        mouse.y = event.pageY;
    });

    // Reset mouse when leaving page
    document.addEventListener('mouseleave', function () {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    function generateMesh() {
        points = [];
        triangles = [];
        const cols = Math.ceil(width / CELL_SIZE) + 2;
        const rows = Math.ceil(height / CELL_SIZE) + 2;

        // Generate pseudo-random grid points
        for (let i = -1; i <= cols; i++) {
            let col = [];
            for (let j = -1; j <= rows; j++) {
                // Fixed outer boundary points so edges don't bounce
                let rx = 0;
                let ry = 0;
                if (i > 0 && i < cols - 1 && j > 0 && j < rows - 1) {
                    rx = (Math.random() - 0.5) * VARIANCE;
                    ry = (Math.random() - 0.5) * VARIANCE;
                }
                col.push({
                    x: i * CELL_SIZE + rx,
                    y: j * CELL_SIZE + ry
                });
            }
            points.push(col);
        }

        // Generate triangles from the grid
        for (let i = 0; i < points.length - 1; i++) {
            for (let j = 0; j < points[i].length - 1; j++) {
                let p1 = points[i][j];
                let p2 = points[i + 1][j];
                let p3 = points[i][j + 1];
                let p4 = points[i + 1][j + 1];

                // Static intrinsic lighting value so it looks highly faceted
                let staticLight1 = (Math.random() * 0.015) + 0.005;
                let staticLight2 = (Math.random() * 0.015) + 0.005;

                // Triangle 1 (p1, p2, p3)
                triangles.push({
                    p1: p1, p2: p2, p3: p3,
                    cx: (p1.x + p2.x + p3.x) / 3,
                    cy: (p1.y + p2.y + p3.y) / 3,
                    baseAlpha: staticLight1
                });

                // Triangle 2 (p2, p4, p3)
                triangles.push({
                    p1: p2, p2: p4, p3: p3,
                    cx: (p2.x + p4.x + p3.x) / 3,
                    cy: (p2.y + p4.y + p3.y) / 3,
                    baseAlpha: staticLight2
                });
            }
        }
    }

    function resize() {
        // Essential: Set the inline CSS width/height to match exactly the physical pixels
        canvas.style.width = '100%';
        canvas.style.height = document.documentElement.scrollHeight + 'px';

        // Set the logical drawing buffer exactly to the physical layout pixels
        width = canvas.width = window.innerWidth;
        height = canvas.height = document.documentElement.scrollHeight;

        generateMesh();
    }

    const docObserver = new ResizeObserver(() => {
        if (Math.abs(canvas.height - document.documentElement.scrollHeight) > 5) {
            resize();
        }
    });
    docObserver.observe(document.documentElement);
    window.addEventListener('resize', resize);

    function animate() {
        // Only render if visible to save battery
        if (!canvas.classList.contains('hidden-bg')) {
            ctx.clearRect(0, 0, width, height);

            ctx.fillStyle = baseHex;
            ctx.fillRect(0, 0, width, height);

            for (let i = 0; i < triangles.length; i++) {
                let t = triangles[i];

                // Calculate distance from mouse to triangle centroid
                let dx = mouse.x - t.cx;
                let dy = mouse.y - t.cy;
                let distSq = (dx * dx) + (dy * dy);
                let radiusSq = mouse.radius * mouse.radius;

                let dynamicAlpha = 0;
                if (distSq < radiusSq) {
                    // Cosine falloff for smooth lighting
                    let factor = Math.cos((Math.sqrt(distSq) / mouse.radius) * (Math.PI / 2));
                    dynamicAlpha = factor * 0.18; // Peak brightness added
                }

                let totalAlpha = t.baseAlpha + dynamicAlpha;

                // We simulate lighting by layering white/accent alpha over the dark base
                ctx.fillStyle = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${totalAlpha})`;

                // Optionally give it a tiny border to define faces better
                ctx.strokeStyle = `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, ${totalAlpha + 0.02})`;
                ctx.lineWidth = 1;

                // Eliminate anti-aliasing gaps between triangles
                ctx.beginPath();
                ctx.moveTo(t.p1.x, t.p1.y);
                ctx.lineTo(t.p2.x, t.p2.y);
                ctx.lineTo(t.p3.x, t.p3.y);
                ctx.closePath();

                ctx.fill();
                ctx.stroke();
            }
        }
        requestAnimationFrame(animate);
    }

    resize();
    animate();
}
