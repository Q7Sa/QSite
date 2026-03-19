/* 
   SLIDESHOW CONFIGURATION
   =======================
   Edit the values below to customize the slideshow.
*/

const CONFIG = {
    speed: 5,        // Time each slide is shown (in seconds)
    fade: 1.5,       // Duration of the fade transition (in seconds)
    random: false,    // Set to true for randomized order
    autoplay: true   // Set to false to pause the slideshow
};

// --- CORE LOGIC (Developer use only) ---

const imageModules = import.meta.glob('/assets/slideshow/*.{png,jpg,jpeg,webp,svg}', { eager: true });
let images = Object.values(imageModules).map(mod => mod.default || mod);
if (images.length === 0) images = ['/assets/slideshow/bg.png'];

let currentIndex = 0;
let intervalId = null;

const slide1 = document.getElementById('slide-1');
const slide2 = document.getElementById('slide-2');
let currentSlideElement = slide1;
let nextSlideElement = slide2;

function applyConfig() {
    document.documentElement.style.setProperty('--fade-duration', `${CONFIG.fade}s`);
    if (CONFIG.autoplay && images.length > 1) {
        startInterval();
    } else {
        stopInterval();
    }
}

function updateSlide() {
    nextSlideElement.style.backgroundImage = `url(${images[currentIndex]})`;
    currentSlideElement.classList.remove('active');
    nextSlideElement.classList.add('active');
    [currentSlideElement, nextSlideElement] = [nextSlideElement, currentSlideElement];
}

function next() {
    if (CONFIG.random && images.length > 1) {
        let n; do { n = Math.floor(Math.random() * images.length); } while (n === currentIndex);
        currentIndex = n;
    } else {
        currentIndex = (currentIndex + 1) % images.length;
    }
    updateSlide();
}

function startInterval() {
    stopInterval();
    intervalId = setInterval(next, CONFIG.speed * 1000);
}

function stopInterval() {
    if (intervalId) clearInterval(intervalId);
}

// Bootstrap
applyConfig();
if (images.length > 0) {
    currentSlideElement.style.backgroundImage = `url(${images[0]})`;
    currentSlideElement.classList.add('active');
}
