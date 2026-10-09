/*
   SLIDESHOW CONFIGURATION
   =======================
   Edit the values below to customize the slideshow.
*/

const CONFIG = {
    speed: 8,        // Time each slide is shown (in seconds)
    fade: 1.5,       // Duration of the fade transition (in seconds)
    random: false,    // Set to true for randomized order
    autoplay: true,  // Set to false to pause the slideshow
    pan: true,       // Pan across images whose shape doesn't match the screen, so the whole image is shown
    maxPanRate: 0.25 // Max pan speed (screen-lengths per second); slides with long pans are shown longer
};

// --- CORE LOGIC (Developer use only) ---

const imageModules = import.meta.glob('/assets/slideshow/*.{png,jpg,jpeg,webp,svg}', { eager: true });
let images = Object.values(imageModules).map(mod => mod.default || mod);
if (images.length === 0) images = ['/assets/slideshow/bg.png'];

let currentIndex = 0;
let timerId = null;
let showToken = 0;

const container = document.getElementById('slideshow-container');
const slide1 = document.getElementById('slide-1');
const slide2 = document.getElementById('slide-2');
let currentSlideElement = slide1;
let nextSlideElement = slide2;

const sizeCache = new Map();   // src -> Promise<{ w, h }>
const slideState = new Map();  // element -> { size, duration, anim }

function loadImage(src) {
    if (!sizeCache.has(src)) {
        const img = new Image();
        img.src = src;
        sizeCache.set(src, img.decode().then(
            () => ({ w: img.naturalWidth, h: img.naturalHeight }),
            () => ({ w: 0, h: 0 })
        ));
    }
    return sizeCache.get(src);
}

// Image size scaled to cover the screen without distortion, and its overflow per axis
function coverGeometry(size) {
    const vw = container.clientWidth;
    const vh = container.clientHeight;
    const scale = size.w && size.h ? Math.max(vw / size.w, vh / size.h) : 0;
    const w = scale ? Math.ceil(size.w * scale) : vw;
    const h = scale ? Math.ceil(size.h * scale) : vh;
    return { vw, vh, w, h, dx: vw - w, dy: vh - h };
}

function slideDuration(size) {
    const base = CONFIG.speed * 1000;
    if (!CONFIG.pan) return base;
    const { vw, vh, dx, dy } = coverGeometry(size);
    const overflow = Math.max(-dx / vw, -dy / vh);
    return Math.max(base, (overflow / CONFIG.maxPanRate) * 1000);
}

// Size the slide to cover and pan edge to edge over `duration` ms, starting at `progress` (0..1)
function layoutSlide(el, size, duration, progress = 0) {
    const { w, h, dx, dy } = coverGeometry(size);
    const state = slideState.get(el);
    if (state && state.anim) state.anim.cancel();

    el.style.width = `${w}px`;
    el.style.height = `${h}px`;

    let anim = null;
    if (CONFIG.pan && (dx < -1 || dy < -1)) {
        anim = el.animate(
            [{ transform: 'translate(0px, 0px)' }, { transform: `translate(${dx}px, ${dy}px)` }],
            { duration, easing: 'ease-in-out', fill: 'forwards' }
        );
        anim.currentTime = progress * duration;
    } else {
        el.style.transform = `translate(${dx / 2}px, ${dy / 2}px)`;
    }
    slideState.set(el, { size, duration, anim });
}

async function show(index) {
    const token = ++showToken;
    clearTimeout(timerId);

    const src = images[index];
    const size = await loadImage(src);
    if (token !== showToken) return; // superseded by a newer show()

    const el = nextSlideElement;
    const duration = slideDuration(size);
    el.style.backgroundImage = `url("${src}")`;
    layoutSlide(el, size, duration);

    currentSlideElement.classList.remove('active');
    el.classList.add('active');
    [currentSlideElement, nextSlideElement] = [el, currentSlideElement];

    if (images.length > 1) loadImage(images[(index + 1) % images.length]);
    if (CONFIG.autoplay && images.length > 1) timerId = setTimeout(next, duration);
}

function next() {
    if (CONFIG.random && images.length > 1) {
        let n; do { n = Math.floor(Math.random() * images.length); } while (n === currentIndex);
        currentIndex = n;
    } else {
        currentIndex = (currentIndex + 1) % images.length;
    }
    show(currentIndex);
}

// Left click advances to the next slide (and restarts the timer)
document.addEventListener('click', (e) => {
    if (e.button === 0) next();
});

// Keep the current slide covering the screen, preserving pan progress
window.addEventListener('resize', () => {
    const state = slideState.get(currentSlideElement);
    if (!state) return;
    const progress = state.anim ? Math.min(1, state.anim.currentTime / state.duration) : 1;
    layoutSlide(currentSlideElement, state.size, state.duration, progress);
});

// Bootstrap
document.documentElement.style.setProperty('--fade-duration', `${CONFIG.fade}s`);
show(currentIndex);
