import './styles/variables.css'
import './styles/base.css'
import './styles/header.css'
import './styles/about.css'
import './styles/services.css'
import './styles/clients.css'
import './styles/media.css'
import './styles/suggestion-box.css'
import { initInteractiveBackground } from './bg.js'
import { initLowPolyBackground } from './bg-poly.js'
import { formConfigs } from './forms.config.js'
import { translations } from './translations.js'

// RTL/LTR Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the canvas background
  initInteractiveBackground();
  initLowPolyBackground();

  // Background Hot-Swap Engine
  const bgToggleFab = document.getElementById('bg-toggle-fab');
  const bgCanvas = document.getElementById('bg-canvas');
  const bgPolyCanvas = document.getElementById('bg-poly-canvas');

  if (bgToggleFab) {
    bgToggleFab.addEventListener('click', () => {
      bgCanvas.classList.toggle('active-bg');
      bgCanvas.classList.toggle('hidden-bg');
      bgPolyCanvas.classList.toggle('active-bg');
      bgPolyCanvas.classList.toggle('hidden-bg');
    });
  }

  const toggleBtn = document.getElementById('lang-toggle');

  function applyLanguage(dir) {
    const dict = translations[dir];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) el.textContent = dict[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) el.setAttribute('placeholder', dict[key]);
    });
  }

  if (toggleBtn) {
    // 1. Check for saved language, default to RTL (Arabic) if none exists
    const savedLang = localStorage.getItem('q7-lang') || 'rtl';

    // 2. Apply it immediately to the document root
    document.documentElement.setAttribute('dir', savedLang);

    // 3. Set the button's initial text correctly
    toggleBtn.textContent = savedLang === 'rtl' ? 'EN / LTR' : 'AR / RTL';

    // 4. Hydrate all strings
    applyLanguage(savedLang);

    // 5. Handle user clicks
    toggleBtn.addEventListener('click', () => {
      const currentDir = document.documentElement.getAttribute('dir');
      const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';

      // Update DOM
      document.documentElement.setAttribute('dir', newDir);

      // Save globally
      localStorage.setItem('q7-lang', newDir);

      // Update toggle text
      toggleBtn.textContent = newDir === 'rtl' ? 'EN / LTR' : 'AR / RTL';

      // Apply translated texts
      applyLanguage(newDir);
    });
  }

  // Theme Selector Logic
  const themeBtns = document.querySelectorAll('.theme-btn');
  const siteLogo = document.querySelector('.site-logo');
  const subtleLogo = document.querySelector('.subtle-hero-logo');

  const logoPaths = {
    'default': '/logo.png',
    'bw': '/BlackWhiteLogo.png',
    'kick': '/DoubleGreenKickLogo.png',
    'red': '/RedBlackLogo.png',
    'twitch': '/TwitchBlackLogo.png'
  };

  function applyTheme(themeName) {
    if (!themeName || !logoPaths[themeName]) return;

    // Set exact theme attribute on HTML (or remove if default)
    if (themeName === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeName);
    }

    // Update logo src (add fallback query param to force reload if needed, but simple src swap is fine)
    if (siteLogo) siteLogo.src = logoPaths[themeName];
    if (subtleLogo) subtleLogo.src = logoPaths[themeName];

    // Update active button state
    themeBtns.forEach(btn => {
      if (btn.getAttribute('data-set-theme') === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Save to localStorage
    localStorage.setItem('q7-theme', themeName);
  }

  // Init Theme
  const savedTheme = localStorage.getItem('q7-theme') || 'default';
  applyTheme(savedTheme);

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-set-theme');
      applyTheme(theme);
    });
  });

  // Service Card Expansion Logic
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't toggle if clicking on an action button inside the card
      if (e.target.closest('.btn-action')) return;

      // Close other cards to maintain a clean layout (optional based on preference)
      serviceCards.forEach(c => {
        if (c !== card) c.classList.remove('expanded');
      });

      card.classList.toggle('expanded');
    });
  });

  // Dynamic Form Wizard Logic
  const btnOpenForms = document.querySelectorAll('.btn-open-form');
  const suggestionModal = document.getElementById('suggestion-modal');
  const wizardForm = document.getElementById('wizard-form');
  const wizardTitle = document.getElementById('wizard-title');

  let currentStep = 1;
  let totalSteps = 1;

  function showStep(stepNumber) {
    if (!wizardForm) return;
    const steps = wizardForm.querySelectorAll('.wizard-step');
    steps.forEach(step => {
      if (parseInt(step.dataset.step) === stepNumber) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }

  function renderForm(formId) {
    if (!wizardForm || !wizardTitle) return;
    const config = formConfigs[formId];
    if (!config) return;

    const dir = document.documentElement.getAttribute('dir') || 'rtl';
    wizardTitle.textContent = config.title[dir] || config.title.ltr;

    let formHTML = '';
    const stepsCount = config.steps.length;
    totalSteps = stepsCount + 1; // +1 for success state

    const arrowNext = dir === 'rtl' ? 'left' : 'right';
    const arrowPrev = dir === 'rtl' ? 'right' : 'left';

    config.steps.forEach((stepConf, index) => {
      const stepIdx = index + 1;
      const label = stepConf.label[dir] || stepConf.label.ltr;
      const placeholder = stepConf.placeholder[dir] || stepConf.placeholder.ltr;
      const nextText = translations[dir].sugg_next;
      const prevText = translations[dir].sugg_prev;
      const submitText = translations[dir].sugg_submit;

      let inputHTML = '';
      if (stepConf.type === 'textarea') {
        inputHTML = `<textarea id="wiz-${stepConf.id}" name="${stepConf.id}" rows="4" placeholder="${placeholder}" ${stepConf.required ? 'required' : ''}></textarea>`;
      } else {
        inputHTML = `<input type="${stepConf.type}" id="wiz-${stepConf.id}" name="${stepConf.id}" placeholder="${placeholder}" ${stepConf.required ? 'required' : ''} />`;
      }

      let actionsHTML = '';
      if (stepIdx === 1) {
        actionsHTML = `
            <div class="step-actions flex-end">
              <button type="button" class="btn-next"><span>${nextText}</span> <i class="fa-solid fa-arrow-${arrowNext}"></i></button>
            </div>`;
      } else if (stepIdx < stepsCount) {
        actionsHTML = `
            <div class="step-actions flex-between">
              <button type="button" class="btn-prev"><i class="fa-solid fa-arrow-${arrowPrev}"></i> <span>${prevText}</span></button>
              <button type="button" class="btn-next"><span>${nextText}</span> <i class="fa-solid fa-arrow-${arrowNext}"></i></button>
            </div>`;
      } else {
        actionsHTML = `
            <div class="step-actions flex-between">
              <button type="button" class="btn-prev"><i class="fa-solid fa-arrow-${arrowPrev}"></i> <span>${prevText}</span></button>
              <button type="submit" class="btn-submit pulse-glow"><span>${submitText}</span> <i class="fa-solid fa-paper-plane"></i></button>
            </div>`;
      }

      formHTML += `
          <div class="wizard-step ${stepIdx === 1 ? 'active' : ''}" data-step="${stepIdx}">
            <h3 class="step-title">${label}</h3>
            <div class="form-group">
              ${inputHTML}
            </div>
            ${actionsHTML}
          </div>
      `;
    });

    // Generate Success State
    const successTitle = translations[dir].sugg_success;
    const successDesc = translations[dir].sugg_success_desc;
    const closeText = translations[dir].sugg_close;
    formHTML += `
          <div class="wizard-step success-state" data-step="${totalSteps}">
            <i class="fa-solid fa-circle-check success-icon"></i>
            <h3>${successTitle}</h3>
            <p>${successDesc}</p>
            <button type="button" class="btn-close-final">${closeText}</button>
          </div>
    `;

    wizardForm.innerHTML = formHTML;

    // Bind event listeners to new DOM
    bindWizardEvents(formId);
  }

  function bindWizardEvents(formId) {
    const nextBtns = wizardForm.querySelectorAll('.btn-next');
    const prevBtns = wizardForm.querySelectorAll('.btn-prev');
    const finalCloseBtn = wizardForm.querySelector('.btn-close-final');

    nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const currentStepEl = wizardForm.querySelector(`.wizard-step[data-step="${currentStep}"]`);
        const inputs = currentStepEl.querySelectorAll('input, textarea');
        let isValid = true;
        inputs.forEach(input => {
          if (!input.checkValidity()) {
            input.reportValidity();
            isValid = false;
          }
        });
        if (isValid && currentStep < totalSteps) {
          currentStep++;
          showStep(currentStep);
        }
      });
    });

    prevBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep > 1) {
          currentStep--;
          showStep(currentStep);
        }
      });
    });

    if (finalCloseBtn) {
      finalCloseBtn.addEventListener('click', () => {
        suggestionModal.classList.remove('active');
      });
    }

    wizardForm.onsubmit = async (e) => {
      e.preventDefault();

      const formData = new FormData(wizardForm);
      const payload = Object.fromEntries(formData.entries());
      payload['form_type'] = formId;

      // Simulated Discord Webhook Submittal
      console.log('Sending payload to Discord Webhook:', payload);
      // const webhookUrl = 'https://discord.com/api/webhooks/PLACEHOLDER/TOKEN';
      /*
      fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: "New Submission!", embeds: [ { description: JSON.stringify(payload) } ] })
      });
      */

      currentStep = totalSteps;
      showStep(currentStep);
    };
  }

  // Open Bound Modals
  btnOpenForms.forEach(btn => {
    btn.addEventListener('click', () => {
      const formId = btn.getAttribute('data-form');
      currentStep = 1;
      renderForm(formId);
      if (suggestionModal) suggestionModal.classList.add('active');
    });
  });

  // ==========================================
  // Dynamic Collabs Engine
  // ==========================================
  const collabsFiles = import.meta.glob('/public/collabs/*.{png,jpg,jpeg,svg,webp}', { eager: true, as: 'url' });
  const clientMarquee = document.querySelector('.client-marquee');

  if (clientMarquee && Object.keys(collabsFiles).length > 0) {
    clientMarquee.innerHTML = ''; // Start pristine

    // Create the animation track
    const track = document.createElement('div');
    track.className = 'marquee-track';

    // Create the first content wrapper
    const content = document.createElement('div');
    content.style.display = 'flex';
    content.style.gap = '2rem';

    for (const path in collabsFiles) {
      const imgUrl = collabsFiles[path];

      const filenameMatch = path.match(/\/([^\/]+)\.[a-z0-9]+$/i);
      if (!filenameMatch) continue;

      const rawName = filenameMatch[1];
      const i18nKey = `${rawName}_tt`;

      const box = document.createElement('div');
      box.className = 'client-logo-box';

      const img = document.createElement('img');
      img.src = imgUrl;
      img.alt = `${rawName} Collaboration`;

      const tooltip = document.createElement('div');
      tooltip.className = 'client-tooltip';
      tooltip.setAttribute('data-i18n', i18nKey);

      const currentDir = document.documentElement.getAttribute('dir') || 'rtl';
      const dict = translations[currentDir];
      tooltip.textContent = (dict && dict[i18nKey]) ? dict[i18nKey] : `Translation needed in translations.js for key: ${i18nKey}`;

      box.appendChild(img);
      box.appendChild(tooltip);
      content.appendChild(box);
    }

    // Append the primary set
    track.appendChild(content);

    // Duplicate the entire content wrapper to mathematically preserve the exact flex gap
    // This allows the -50% CSS transform to seamlessly hook the two blocks together visually
    const clone = content.cloneNode(true);
    // Add aria-hidden to the clone so screen readers don't read the logos twice
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);

    // Inject the fully built track
    clientMarquee.appendChild(track);
  }



  // Close Modal Overrides
  const modalCloseBtns = suggestionModal ? suggestionModal.querySelectorAll('.modal-close') : [];
  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      suggestionModal.classList.remove('active');
    });
  });

  // Scroll Header Visibility Logic
  const header = document.getElementById('main-header');
  const scrollThreshold = 100; // Pixels to scroll before showing

  window.addEventListener('scroll', () => {
    if (window.scrollY > scrollThreshold) {
      header.classList.remove('hidden');
    } else {
      header.classList.add('hidden');
    }
  });

  // Lightbox Logic
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.querySelector('.lightbox-close');

  const galleryItems = document.querySelectorAll('.gallery-item');

  galleryItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevents the servicecard from collapsing

      // Since they are placeholders right now, we grab the span text
      // If they were real images, we would grab the img src.
      let imgSrc = '';
      let textCaption = '';

      const imgTag = item.querySelector('img');
      const spanTag = item.querySelector('span');

      if (imgTag) {
        imgSrc = imgTag.src;
        textCaption = imgTag.alt || 'Gallery Image';
      } else if (spanTag) {
        // Fallback for current placeholder look
        textCaption = spanTag.innerText;
        // Mock a placeholder image for the lightbox
        lightboxImg.style.background = 'repeating-linear-gradient(45deg, rgba(200,200,200,0.1), rgba(200,200,200,0.1) 20px, rgba(100,100,100,0.1) 20px, rgba(100,100,100,0.1) 40px)';
        lightboxImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // transparent pixel
        lightboxImg.style.width = '800px';
        lightboxImg.style.height = '450px';
      }

      if (imgSrc) {
        lightboxImg.src = imgSrc;
        lightboxImg.style.background = 'none';
        lightboxImg.style.width = 'auto';
        lightboxImg.style.height = 'auto';
      }

      lightboxCaption.innerText = textCaption;
      lightbox.classList.add('active');
    });
  });

  // Close lightbox
  if (closeBtn && lightbox) {
    const closeLightbox = () => lightbox.classList.remove('active');

    closeBtn.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
      if (e.target !== lightboxImg) {
        closeLightbox();
      }
    });
  }

});
