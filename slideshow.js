// Automatic image discovery using Vite's glob import
const imageModules = import.meta.glob('/assets/slideshow/*.{png,jpg,jpeg,webp,svg}', { eager: true });
let images = Object.values(imageModules).map(mod => mod.default || mod);

// If no images found, use the fallback
if (images.length === 0) {
    images = ['/assets/slideshow/bg.png'];
}

// Default Settings
let settings = {
    speed: 5,
    fade: 1,
    random: false,
    showControls: true
};

// State
let currentIndex = 0;
let isPlaying = true;
let intervalId = null;

// DOM Elements
const slide1 = document.getElementById('slide-1');
const slide2 = document.getElementById('slide-2');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const playPauseBtn = document.getElementById('play-pause-btn');
const controlsContainer = document.getElementById('controls');

// Settings Elements
const settingsOverlay = document.getElementById('settings-overlay');
const settingsToggleBtn = document.getElementById('settings-toggle-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const speedRange = document.getElementById('speed-range');
const speedValue = document.getElementById('speed-value');
const fadeRange = document.getElementById('fade-range');
const fadeValue = document.getElementById('fade-value');
const randomToggle = document.getElementById('random-toggle');
const controlsToggle = document.getElementById('controls-toggle');
const resetBtn = document.getElementById('reset-settings-btn');

let currentSlideElement = slide1;
let nextSlideElement = slide2;

// --- Logic ---

function loadSettings() {
    const saved = localStorage.getItem('qsite-slideshow-settings');
    if (saved) {
        settings = { ...settings, ...JSON.parse(saved) };
    }
    applySettings();
}

function saveSettings() {
    localStorage.setItem('qsite-slideshow-settings', JSON.stringify(settings));
}

function applySettings() {
    // Update UI
    speedRange.value = settings.speed;
    speedValue.textContent = `${settings.speed}s`;
    fadeRange.value = settings.fade;
    fadeValue.textContent = `${settings.fade}s`;
    randomToggle.checked = settings.random;
    controlsToggle.checked = settings.showControls;

    // Apply CSS variables
    document.documentElement.style.setProperty('--fade-duration', `${settings.fade}s`);
    
    // Controls visibility
    controlsContainer.classList.toggle('hidden', !settings.showControls);

    // Restart interval if playing
    if (isPlaying) startInterval();
}

function updateSlide() {
    const imageUrl = images[currentIndex];
    
    nextSlideElement.style.backgroundImage = `url(${imageUrl})`;
    
    currentSlideElement.classList.remove('active');
    nextSlideElement.classList.add('active');
    
    const temp = currentSlideElement;
    currentSlideElement = nextSlideElement;
    nextSlideElement = temp;
}

function next() {
    if (settings.random && images.length > 1) {
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * images.length);
        } while (nextIndex === currentIndex);
        currentIndex = nextIndex;
    } else {
        currentIndex = (currentIndex + 1) % images.length;
    }
    updateSlide();
}

function prev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateSlide();
}

function togglePlay() {
    isPlaying = !isPlaying;
    playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
    if (isPlaying) {
        startInterval();
    } else {
        stopInterval();
    }
}

function startInterval() {
    stopInterval();
    intervalId = setInterval(next, settings.speed * 1000);
}

function stopInterval() {
    if (intervalId) clearInterval(intervalId);
}

function initSlideshow() {
    if (images.length > 0) {
        currentSlideElement.style.backgroundImage = `url(${images[0]})`;
        currentSlideElement.classList.add('active');
        if (images.length > 1 && isPlaying) {
            startInterval();
        }
    }
}

// --- Event Listeners ---

settingsToggleBtn.addEventListener('click', () => settingsOverlay.classList.remove('hidden'));
closeSettingsBtn.addEventListener('click', () => settingsOverlay.classList.add('hidden'));
settingsOverlay.addEventListener('click', (e) => {
    if (e.target === settingsOverlay) settingsOverlay.classList.add('hidden');
});

speedRange.addEventListener('input', (e) => {
    settings.speed = parseFloat(e.target.value);
    speedValue.textContent = `${settings.speed}s`;
    saveSettings();
    if (isPlaying) startInterval();
});

fadeRange.addEventListener('input', (e) => {
    settings.fade = parseFloat(e.target.value);
    fadeValue.textContent = `${settings.fade}s`;
    document.documentElement.style.setProperty('--fade-duration', `${settings.fade}s`);
    saveSettings();
});

randomToggle.addEventListener('change', (e) => {
    settings.random = e.target.checked;
    saveSettings();
});

controlsToggle.addEventListener('change', (e) => {
    settings.showControls = e.target.checked;
    controlsContainer.classList.toggle('hidden', !settings.showControls);
    saveSettings();
});

resetBtn.addEventListener('click', () => {
    settings = { speed: 5, fade: 1, random: false, showControls: true };
    applySettings();
    saveSettings();
});

nextBtn.addEventListener('click', () => {
    next();
    if (isPlaying) startInterval();
});

prevBtn.addEventListener('click', () => {
    prev();
    if (isPlaying) startInterval();
});

playPauseBtn.addEventListener('click', togglePlay);

// --- Bootstrap ---
loadSettings();
initSlideshow();
