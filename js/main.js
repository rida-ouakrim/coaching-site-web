/**
 * Dr. Jamal Bouassiria - Coaching & Personal Branding
 * Interactive UI/UX Scripts & Funnel Management
 */

document.addEventListener('DOMContentLoaded', () => {
  initSiteOpening();
  initScrollProgressBar();
  initScrollReveal();
  initBackToTop();
  initNavbar();
  initLanguageSwitcher();
  initHeroBackgroundSlider();
  initCounters();
  initFAQ();
  initBookingFunnel();
  initLeadModal();
  initLegalModals();
  initVideoModals();
  initSmoothScroll();
});

/* ==========================================================================
   0. HERO BACKGROUND AUTOMATED SLIDER (CONTINUOUS CINEMATIC DISSOLVE)
   ========================================================================== */
function initHeroBackgroundSlider() {
  const slides = document.querySelectorAll('.hero-bg-slide');
  if (!slides || slides.length < 2) return;

  let currentIndex = 0;
  const slideDuration = 6500; // 6.5 seconds per slide for generous ambient viewing

  setInterval(() => {
    const prevSlide = slides[currentIndex];
    currentIndex = (currentIndex + 1) % slides.length;
    const nextSlide = slides[currentIndex];

    // Outgoing slide remains visible underneath at full opacity
    prevSlide.classList.add('leaving');
    prevSlide.classList.remove('active');

    // Incoming slide fades in smoothly on top
    nextSlide.classList.add('active');

    // After fade-in completes (2100ms), safely clean up leaving class
    setTimeout(() => {
      prevSlide.classList.remove('leaving');
    }, 2100);
  }, slideDuration);
}

/* ==========================================================================
   1. NAVBAR & MOBILE DRAWER
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.header-nav');
  const mobileToggle = document.querySelector('.mobile-menu-btn');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-links a');

  // Sticky header visibility transition
  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        document.body.style.overflow = '';
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ==========================================================================
   2. KPI ANIMATED COUNTERS
   ========================================================================== */
function initCounters() {
  const counterElements = document.querySelectorAll('.kpi-value[data-target]');
  if (!counterElements.length) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counterElements.forEach(counter => {
          const target = parseInt(counter.getAttribute('data-target'), 10);
          const prefix = counter.getAttribute('data-prefix') || '';
          const suffix = counter.getAttribute('data-suffix') || '';
          const duration = 2000;
          const stepTime = 25;
          const steps = duration / stepTime;
          const increment = target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              counter.textContent = prefix + target.toLocaleString('de-DE') + suffix;
              clearInterval(timer);
            } else {
              counter.textContent = prefix + Math.floor(current).toLocaleString('de-DE') + suffix;
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.3 });

  const kpiSection = document.querySelector('.kpi-section');
  if (kpiSection) {
    observer.observe(kpiSection);
  }
}

/* ==========================================================================
   3. FAQ ACCORDION
   ========================================================================== */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all other items for clean accordion behavior
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // If it wasn't open, open it
      if (!isOpen) {
        item.classList.add('active');
        questionBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ==========================================================================
   4. MULTI-STEP QUALIFICATION & BOOKING FUNNEL MODAL (BILINGUAL & SECURE)
   ========================================================================== */
let bookingData = {
  status: '',
  challenge: '',
  timeline: '',
  language: 'Deutsch',
  slot: '14:00 - 16:00 Uhr',
  name: '',
  phone: '',
  email: '',
  notes: ''
};

let isBookingSubmitting = false;

function validatePhone(phone) {
  if (!phone) return false;
  // Allow leading +, digits, spaces, parentheses, dashes; requires at least 6 digits
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 6 && digitsOnly.length <= 18 && /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/.test(phone.trim());
}

function initBookingFunnel() {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;

  const openBtns = document.querySelectorAll('.open-booking-modal');
  const closeBtns = modal.querySelectorAll('.close-modal-trigger');
  const nextBtn = document.getElementById('funnelNextBtn');
  const prevBtn = document.getElementById('funnelPrevBtn');
  const progressBar = document.getElementById('funnelProgressBar');
  const stepIndicator = document.getElementById('funnelStepText');

  let currentStep = 1;
  const totalSteps = 4;

  // Global callback so language switcher can re-render active step UI instantly
  window.refreshFunnelLanguage = () => {
    if (modal.classList.contains('active')) {
      goToStep(currentStep);
    }
  };

  // Open modal handlers
  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Reset view to step 1 and restore headers/footers
      const modalHeader = modal.querySelector('.modal-header');
      const modalFooter = modal.querySelector('.modal-footer');
      if (modalHeader) modalHeader.style.display = '';
      if (modalFooter) modalFooter.style.display = '';
      
      openModal(modal);
      goToStep(1);
    });
  });

  // Close modal handlers
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(modal);
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });

  // Slot chips selection
  const slotChips = modal.querySelectorAll('.slot-chip');
  slotChips.forEach(chip => {
    chip.addEventListener('click', () => {
      slotChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      bookingData.slot = chip.getAttribute('data-slot');
    });
  });

  // Navigation handlers
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (!validateStep(currentStep)) return;

      if (currentStep < totalSteps) {
        goToStep(currentStep + 1);
      } else {
        submitFunnel();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        goToStep(currentStep - 1);
      }
    });
  }

  function goToStep(step) {
    currentStep = step;

    // Hide all step panels
    modal.querySelectorAll('.step-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    // Show current step
    const targetPanel = modal.querySelector(`.step-panel[data-step="${step}"]`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }

    // Update progress bar & bilingual indicators
    const progressPercent = (step / totalSteps) * 100;
    if (progressBar) progressBar.style.width = `${progressPercent}%`;
    if (stepIndicator) {
      const stepTemplate = getTranslation('funnel_step_of') || `Schritt {step} von {total}`;
      stepIndicator.textContent = stepTemplate.replace('{step}', step).replace('{total}', totalSteps);
    }

    // Manage Buttons
    if (prevBtn) {
      prevBtn.style.display = step === 1 ? 'none' : 'inline-flex';
      const prevLabel = getTranslation('funnel_prev_btn') || '← Zurück';
      prevBtn.innerHTML = `<span>${prevLabel}</span>`;
    }

    if (nextBtn) {
      if (step === totalSteps) {
        const submitLabel = getTranslation('funnel_submit_btn') || 'Termin jetzt verbindlich anfragen';
        nextBtn.innerHTML = `<span>${submitLabel}</span> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
      } else {
        const nextLabel = getTranslation('funnel_next_btn') || 'Weiter';
        nextBtn.innerHTML = `<span>${nextLabel}</span> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
      }
    }
  }

  function validateStep(step) {
    if (step === 1) {
      const selected = modal.querySelector('input[name="funnel_status"]:checked');
      if (!selected) {
        showToast(getTranslation('funnel_toast_err_status') || 'Bitte wähle deine aktuelle Situation aus.', 'warning');
        return false;
      }
      bookingData.status = selected.value;
      return true;
    }

    if (step === 2) {
      const selected = modal.querySelector('input[name="funnel_challenge"]:checked');
      if (!selected) {
        showToast(getTranslation('funnel_toast_err_challenge') || 'Bitte wähle deine größte Herausforderung aus.', 'warning');
        return false;
      }
      bookingData.challenge = selected.value;
      return true;
    }

    if (step === 3) {
      const selectedTimeline = modal.querySelector('input[name="funnel_timeline"]:checked');
      const selectedLang = modal.querySelector('input[name="funnel_language"]:checked');
      if (!selectedTimeline) {
        showToast(getTranslation('funnel_toast_err_timeline') || 'Bitte gib an, wann du starten möchtest.', 'warning');
        return false;
      }
      bookingData.timeline = selectedTimeline.value;
      if (selectedLang) bookingData.language = selectedLang.value;
      return true;
    }

    if (step === 4) {
      const nameInput = document.getElementById('bookingName');
      const emailInput = document.getElementById('bookingEmail');
      const phoneInput = document.getElementById('bookingPhone');
      const notesInput = document.getElementById('bookingNotes');

      if (!nameInput || !nameInput.value.trim() || nameInput.value.trim().length < 2) {
        showToast(getTranslation('funnel_toast_err_name') || 'Bitte gib deinen vollen Namen ein.', 'warning');
        if (nameInput) nameInput.focus();
        return false;
      }

      if (!phoneInput || !phoneInput.value.trim() || !validatePhone(phoneInput.value.trim())) {
        showToast(getTranslation('funnel_toast_err_phone') || 'Bitte gib eine gültige Telefonnummer ein.', 'warning');
        if (phoneInput) phoneInput.focus();
        return false;
      }

      if (!emailInput || !emailInput.value.trim() || !validateEmail(emailInput.value.trim())) {
        showToast(getTranslation('funnel_toast_err_email') || 'Bitte gib eine gültige E-Mail-Adresse ein.', 'warning');
        if (emailInput) emailInput.focus();
        return false;
      }

      bookingData.name = nameInput.value.trim().slice(0, 80);
      bookingData.email = emailInput.value.trim().slice(0, 100);
      bookingData.phone = phoneInput.value.trim().slice(0, 30);
      if (notesInput) bookingData.notes = notesInput.value.trim().slice(0, 600);

      return true;
    }

    return true;
  }

  function submitFunnel() {
    if (isBookingSubmitting) return;

    // Security Check 1: Anti-Spam Honeypot Detection
    const botTrap = document.getElementById('bookingBotTrap');
    if (botTrap && botTrap.value.trim() !== '') {
      // Bot detected! Silently abort and simulate successful submission
      console.warn('Spam bot honeypot triggered on booking form.');
      modal.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
      const successPanel = modal.querySelector('.step-panel-success');
      if (successPanel) successPanel.classList.add('active');
      return;
    }

    isBookingSubmitting = true;

    // Show loading state with localized label
    nextBtn.disabled = true;
    nextBtn.innerHTML = `<span>${getTranslation('funnel_submitting') || 'Wird übertragen...'}</span>`;

    setTimeout(() => {
      isBookingSubmitting = false;
      nextBtn.disabled = false;

      // Hide header and footer
      const modalHeader = modal.querySelector('.modal-header');
      const modalFooter = modal.querySelector('.modal-footer');
      if (modalHeader) modalHeader.style.display = 'none';
      if (modalFooter) modalFooter.style.display = 'none';

      // Show success screen
      modal.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
      const successPanel = modal.querySelector('.step-panel-success');
      if (successPanel) {
        successPanel.classList.add('active');

        // Populate localized, sanitized summary
        const summaryBox = successPanel.querySelector('.booking-summary-box');
        if (summaryBox) {
          const lblName = getTranslation('funnel_summary_name') || 'Name';
          const lblPhone = getTranslation('funnel_summary_phone') || 'Telefon';
          const lblEmail = getTranslation('funnel_summary_email') || 'E-Mail';
          const lblSlot = getTranslation('funnel_summary_slot') || 'Wunschzeit';
          const lblLang = getTranslation('funnel_summary_lang') || 'Sprache';
          const lblStatus = getTranslation('funnel_summary_status') || 'Status';

          summaryBox.innerHTML = `
            <div style="font-size:0.92rem; color:#A1A1AA; line-height:1.75; text-align:start;">
              <p><strong>${escapeHtml(lblName)}:</strong> <span style="color:#FFFFFF;">${escapeHtml(bookingData.name)}</span></p>
              <p><strong>${escapeHtml(lblPhone)}:</strong> <span style="color:#e6be8a;">${escapeHtml(bookingData.phone)}</span></p>
              <p><strong>${escapeHtml(lblEmail)}:</strong> <span style="color:#FFFFFF;">${escapeHtml(bookingData.email)}</span></p>
              <p><strong>${escapeHtml(lblSlot)}:</strong> <span style="color:#FFFFFF;">${escapeHtml(bookingData.slot)}</span> (${escapeHtml(lblLang)}: <span style="color:#e6be8a;">${escapeHtml(bookingData.language)}</span>)</p>
              <p><strong>${escapeHtml(lblStatus)}:</strong> <span style="color:#D1D5DB;">${escapeHtml(bookingData.status)}</span></p>
            </div>
          `;
        }
      }

      const toastTpl = getTranslation('funnel_success_toast') || 'Vielen Dank, {name}! Deine Terminanfrage wurde erfolgreich vorgemerkt.';
      showToast(toastTpl.replace('{name}', escapeHtml(bookingData.name)), 'success');
    }, 850);
  }
}

/* ==========================================================================
   5. LEAD / E-BOOK & NEWSLETTER MODAL (BILINGUAL & SECURE)
   ========================================================================== */
function initLeadModal() {
  const modal = document.getElementById('leadModal');
  if (!modal) return;

  const openBtns = document.querySelectorAll('.open-lead-modal');
  const closeBtns = modal.querySelectorAll('.close-modal-trigger');
  const form = document.getElementById('leadCaptureForm');

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(modal);
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(modal);
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });

  if (form) {
    let isLeadSubmitting = false;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (isLeadSubmitting) return;

      // Anti-Spam Honeypot check
      const leadBotTrap = document.getElementById('leadBotTrap');
      if (leadBotTrap && leadBotTrap.value.trim() !== '') {
        console.warn('Spam bot honeypot triggered on lead capture form.');
        closeModal(modal);
        return;
      }

      const nameInput = form.querySelector('input[type="text"]#leadName') || form.querySelector('input[type="text"]');
      const emailInput = form.querySelector('input[type="email"]#leadEmail') || form.querySelector('input[type="email"]');
      
      const name = nameInput ? nameInput.value.trim().slice(0, 80) : '';
      const email = emailInput ? emailInput.value.trim().slice(0, 100) : '';

      if (!email || !validateEmail(email)) {
        showToast(getTranslation('funnel_toast_err_email') || 'Bitte gib eine gültige E-Mail-Adresse ein.', 'warning');
        return;
      }

      isLeadSubmitting = true;
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>${getTranslation('lead_submitting') || 'Wird gesendet...'}</span>`;
      }

      setTimeout(() => {
        isLeadSubmitting = false;
        closeModal(modal);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
        form.reset();

        const toastTpl = getTranslation('lead_success_toast') || 'Erfolg! Der Leitfaden wurde an {email} gesendet.';
        showToast(toastTpl.replace('{email}', escapeHtml(email)), 'success');
      }, 750);
    });
  }
}

/* ==========================================================================
   6. LEGAL MODALS (IMPRESSUM & DATENSCHUTZ)
   ========================================================================== */
function initLegalModals() {
  const impressumModal = document.getElementById('impressumModal');
  const datenschutzModal = document.getElementById('datenschutzModal');

  document.querySelectorAll('.open-impressum-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(impressumModal);
    });
  });

  document.querySelectorAll('.open-datenschutz-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(datenschutzModal);
    });
  });

  [impressumModal, datenschutzModal].forEach(modal => {
    if (!modal) return;
    modal.querySelectorAll('.close-modal-trigger').forEach(btn => {
      btn.addEventListener('click', () => closeModal(modal));
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });
}

/* ==========================================================================
   7. TESTIMONIAL VIDEO MODAL
   ========================================================================== */
function initVideoModals() {
  const videoModal = document.getElementById('videoModal');
  if (!videoModal) return;

  const playBtns = document.querySelectorAll('.trigger-video-preview');
  const closeBtns = videoModal.querySelectorAll('.close-modal-trigger');

  playBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const clientName = btn.getAttribute('data-client-name') || 'Erfolgsgeschichte';
      const quote = btn.getAttribute('data-quote') || '';
      
      const modalTitle = videoModal.querySelector('.video-modal-client-name');
      const modalQuote = videoModal.querySelector('.video-modal-quote');
      
      if (modalTitle) modalTitle.textContent = clientName;
      if (modalQuote) modalQuote.textContent = quote;

      openModal(videoModal);
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => closeModal(videoModal));
  });

  videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) closeModal(videoModal);
  });
}

/* ==========================================================================
   8. HELPERS & GENERAL
   ========================================================================== */
function openModal(modal) {
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}

function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  const icon = type === 'success' 
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e6be8a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f6dfc4" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

  toast.innerHTML = `${icon} <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ==========================================================================
   ANIMATIONS: OPENING & SCROLL SUITE
   ========================================================================== */
function initSiteOpening() {
  const preloader = document.getElementById('site-preloader');
  
  const dismissPreloader = () => {
    document.body.classList.add('page-loaded');
    if (preloader) {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 750);
    }
  };

  // Give a silky 550ms intro on first load so users appreciate the luxury emblem
  if (document.readyState === 'complete') {
    setTimeout(dismissPreloader, 450);
  } else {
    window.addEventListener('load', () => {
      setTimeout(dismissPreloader, 500);
    });
    // Hard fallback timeout ensures UI is never blocked
    setTimeout(dismissPreloader, 1200);
  }
}

function initScrollProgressBar() {
  const bar = document.getElementById('scrollProgressBar');
  if (!bar) return;

  const updateBar = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) : 0;
    bar.style.transform = `scaleX(${Math.min(Math.max(scrollPercent, 0), 1)})`;
  };

  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();
}

function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-stagger');
  if (!revealElements.length) return;

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  const toggleBtn = () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', toggleBtn, { passive: true });
  toggleBtn();

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ==========================================================================
   BILINGUAL LANGUAGE TOGGLE SYSTEM (DE / AR)
   ========================================================================== */
const I18N = {
  de: {
    nav_about: "Über Dr. Jamal",
    nav_method: "Die Methode",
    nav_content: "Coaching-Inhalte",
    nav_stories: "Erfolgsgeschichten",
    nav_faq: "FAQ",
    nav_cta: "Erstgespräch sichern",
    drawer_lang_label: "Sprache / اللغة",
    mob_problem: "Das Problem",
    mob_reasons: "7 Vorteile",
    mob_expertise: "Fachgebiete",
    mob_steps: "In 3 Schritten",
    mob_drawer_cta: "Jetzt kostenloses Erstgespräch",
    hero_title: 'Du bist hier, um etwas aufzubauen. <span class="gold-gradient-text">Nicht, um klein zu bleiben.</span>',
    hero_sub: 'Begleitung durch Dr. Jamal Bouassiria – praxiserprobt, ohne Sprachbarriere und ohne Umwege zum erfolgreichen Unternehmen in Deutschland.',
    hero_cta: 'Kostenloses Erstgespräch sichern',
    hero_about: 'Über Dr. Jamal ↓',
    hero_guarantee: '100% vertraulich · Erstberatung auf Deutsch oder Arabisch',
    trust_1: 'Über 7.000 Menschen beraten',
    trust_2: '20+ Jahre Erfahrung in DE',
    trust_3: 'Ausgezeichnete Methodik',
    pillar_kicker: 'DAS JB-ERFOLGSPRINZIP',
    pillar_tag: 'Was bedeutet das?',
    pillar_subtitle: 'Drei fundamentale Hebel, mit denen wir deine Ausgangslage in ein florierendes Business in Deutschland verwandeln.',
    pillar_word_1: 'sprache',
    pillar_title_1: 'Keine Barriere, sondern dein Vorteil',
    pillar_desc_1: 'Viele glauben, man brauche akzentfreies Deutsch, um in Deutschland erfolgreich zu gründen. Die Realität: Kunden kaufen Souveränität, Vertrauen und greifbare Resultate – keine Grammatik. Wir machen deine Mehrsprachigkeit zu deiner stärksten Marke.',
    pillar_word_2: 'netzwerk',
    pillar_title_2: 'Türen öffnen, die sonst verschlossen bleiben',
    pillar_desc_2: 'Ohne Vorbilder und lokale Kontakte wirkt der Markt oft verschlossen. Mit Dr. Jamal startest du nicht bei null, sondern nutzt über 20 Jahre gewachsenes B2B-Netzwerk, Medienkontakte und Branchenverbindungen ab Tag 1.',
    pillar_word_3: 'strategie',
    pillar_title_3: 'Aus Fleiß ein profitables Business bauen',
    pillar_desc_3: 'Eine Idee allein reicht im deutschen System nicht. Was zählt, ist die exakte Ausführung: rechtssichere Gründung, glasklare Positionierung und planbare Neukundengewinnung – ohne Umwege, Bürokratiefrust und teure Anfängerfehler.',
    banner_brand_pre: 'werde',
    banner_brand_post: 'Mentee',
    banner_text: 'Dr. Jamal gibt dir den direkten Zugang zum Praxis-Wissen, das vor dir über 7.000 Menschen genutzt haben, um aus eigener Kraft ein florierendes Unternehmen in Deutschland aufzubauen. 100% praxisnah, ohne Sprachbarriere und auf Augenhöhe.',
    banner_cta: 'Jetzt kostenloses Erstgespräch sichern',
    stat_prefix_1: 'Über',
    stat_label_1: 'Menschen beraten',
    stat_prefix_2: 'Über',
    stat_label_2: 'Erfahrung in DE',
    stat_prefix_3: 'Bis zu',
    stat_label_3: 'Praxisnah & Diskret',
    methode_tag: 'Fokus statt Überforderung',
    methode_title: 'Zwei einfache Prinzipien,',
    methode_title_gold: 'die alles verändern',
    methode_desc: 'Erfolg in der Selbstständigkeit ist keine Frage von endlosem Grübeln. Er basiert auf klaren, funktionierenden Grundsätzen:',
    methode_card1_title: '1. Das Pareto-Prinzip',
    methode_card1_desc: 'Konzentriere dich auf die 20 % deiner Handlungen, die 80 % deines Ergebnisses bringen – statt dich in Nebensächlichkeiten zu verlieren.',
    methode_card1_pill: '80% Resultate durch 20% Hebel',
    methode_card2_title: '2. Machen statt warten',
    methode_card2_desc: 'Perfektionismus ist der größte Bremser für Migrant:innen, die neu durchstarten wollen. Wer wartet, bis alles perfekt ist, fängt nie an. Wer anfängt und unterwegs verbessert, kommt an.',
    methode_card2_pill: 'Geschwindigkeit schlägt Perfektion',
    benefits_tag: 'DEINE TRANSFORMATION',
    benefits_title: 'Gemeinsam lernen',
    benefits_title_gold: 'und wachsen',
    benefits_desc: 'Gemeinsam bringen wir deine Vision aus dem Kopf in ein handfestes, profitables und rechtssicheres Business in Deutschland:',
    benefit_pillar_1: 'Säule 01 · Präsenz',
    benefit_title_1: 'Deine Online-Präsenz aufbauen',
    benefit_desc_1: 'Webseite, Shop, Logo und Corporate Design, damit du vom ersten Tag an maximal professionell auftrittst.',
    benefit_item_1_1: 'High-Converting Website & Design',
    benefit_item_1_2: 'E-Commerce & Online-Shop Setup',
    benefit_item_1_3: 'Rechtssicher nach deutschen DSGVO-Standards',
    benefit_tag_1: 'Digitale Souveränität',
    benefit_pillar_2: 'Säule 02 · Reichweite',
    benefit_title_2: 'Sichtbar werden mit der richtigen Werbung',
    benefit_desc_2: 'In neuen und klassischen Medien, um planbar mehr Umsatz, profitable Kunden und nachhaltigen Gewinn zu erzielen.',
    benefit_item_2_1: 'Performance-Marketing (Meta & Google)',
    benefit_item_2_2: 'Gezielte Medien- & PR-Platzierungen',
    benefit_item_2_3: 'Planbarer Neukundenstrom ohne Streuverlust',
    benefit_tag_2: 'Messbares Wachstum',
    benefit_pillar_3: 'Säule 03 · Autorität',
    benefit_title_3: 'Dein Personal Branding aufbauen',
    benefit_desc_3: 'Mit Dr. Jamals jahrelanger Erfahrung im Umgang mit führenden Medien und prominenten Entscheidern.',
    benefit_item_3_1: 'Souveräne Experten-Positionierung',
    benefit_item_3_2: 'Medienauftritte, Interviews & Bühnen',
    benefit_item_3_3: 'Zugang zu 20+ Jahren gewachsenem B2B-Netzwerk',
    benefit_tag_3: 'Unverwechselbare Marke',
    inhalte_tag: 'PRAXISNAHER LEHRPLAN',
    inhalte_title: 'Schritt für Schritt',
    inhalte_title_gold: 'zum eigenen Business',
    inhalte_desc: 'Workshops, Seminare und 1:1-Beratung in deutscher und arabischer Sprache:',
    mod_tag_1: 'MODUL 01',
    mod_1: 'Projektmanagement',
    mod_tag_2: 'MODUL 02',
    mod_2: 'Persönlichkeitsentwicklung',
    mod_tag_3: 'MODUL 03',
    mod_3: 'Erfolgreicher Markenaufbau (Branding)',
    mod_tag_4: 'MODUL 04',
    mod_4: 'Dein Unternehmen gründen',
    mod_tag_5: 'MODUL 05',
    mod_5: 'Journalistische Weiterbildung & Online-PR',
    mod_tag_6: 'MODUL 06',
    mod_6: 'Webseiten-Entwicklung, Werbetexte & Verkauf',
    takeaway_badge: 'FÜR DEINE PRAXIS',
    takeaway_title: 'Was du konkret mitnimmst:',
    takeaway_1: 'Ein erprobtes Online-System für finanzielle Unabhängigkeit.',
    takeaway_2: 'Strategien für wirksame Presse- und Öffentlichkeitsarbeit.',
    takeaway_3: 'Regelmäßige praxisnahe Tipps direkt per E-Mail.',
    takeaway_4: 'Fokus auf die Hebel, die wirklich zählen.',
    transparency_label: 'Transparenz & Ehrlichkeit:',
    transparency_quote: '"Mein Coaching ist nicht fürs schnelle Reichwerden gedacht. Aber die finanzielle Freiheit, nicht mehr für einen Chef acht Stunden am Tag arbeiten zu müssen, ist das Ziel, auf das wir gemeinsam hinarbeiten."',
    transparency_cta: 'Jetzt kostenlos zum Newsletter anmelden',
    reasons_tag: 'DEINE MOTIVATION',
    reasons_title: 'Diese 7 Vorteile',
    reasons_title_gold: 'bringt dir dein eigenes Business',
    reasons_desc: 'Warum es sich lohnt, jetzt den ersten Schritt zu machen und dein eigenes Fundament aufzubauen:',
    reason_tag_1: 'Monetarisierung',
    reason_title_1: 'Mache dein Wissen und deine Fähigkeiten zu Geld',
    reason_desc_1: 'Verwandle deine Lebens- und Berufserfahrung in ein gefragtes, hochprofitables Angebot auf dem deutschen Markt.',
    reason_tag_2: 'Sinn & Wirkung',
    reason_title_2: 'Hilf mit deinem Business anderen Menschen',
    reason_desc_2: 'Löse echte Probleme für deine Kunden und hinterlasse einen bleibenden, messbaren Mehrwert in deiner Community.',
    reason_tag_3: 'Planbarkeit',
    reason_title_3: 'Gewinne automatisch & planbar neue Kunden',
    reason_desc_3: 'Durch strukturierte Online-Funnel und erprobte Vertriebswege ohne unangenehme Kaltakquise.',
    reason_tag_4: 'Einkommen',
    reason_title_4: 'Steigere deine Einnahmen spürbar',
    reason_desc_4: 'Kein Chef, der dein Gehalt deckelt. Dein Einkommen wächst direkt proportional zu deinem Einsatz und Erfolg.',
    reason_tag_5: 'Autonomie',
    reason_title_5: 'Echte Freiheit – zeitlich und finanziell',
    reason_desc_5: 'Bestimme selbst über deinen Kalender, deine Arbeitsorte und die langfristige Ausrichtung deines Lebens.',
    reason_tag_6: 'Potenzial',
    reason_title_6: 'Entdecke und nutze dein volles Potenzial',
    reason_desc_6: 'Wachse über alte Begrenzungen hinaus und baue ein Unternehmen auf, auf das du und deine Kinder stolz sein können.',
    reason_tag_7: 'HERZSTÜCK & HÖCHSTER WERT',
    reason_title_7: 'Mehr Zeit für das, was wirklich zählt:',
    reason_title_7_gold: 'deine Familie',
    reason_desc_7: 'Finanzielle Sicherheit und zeitliche Souveränität bedeuten am Ende vor allem eines: Echte Lebensqualität, persönliche Präsenz und unbezahlbare Momente mit den Menschen, die dir am wichtigsten sind.',
    about_portrait_role: "Gründer, Publizist & Mentor",
    about_badge_exp: "Promotion Universität Bremen",
    about_tag: "Authentische Erfolgsgeschichte",
    about_title: "Mein Name ist Dr. Jamal Bouassiria",
    about_roles: "Politikwissenschaftler · Journalist · Online- & PR-Unternehmer",
    about_bio_1: "Ich bin in Marokko aufgewachsen und kam nach dem Abitur nach Deutschland, um Politikwissenschaft zu studieren – ohne familiäres Sicherheitsnetz, ohne Kontakte, mit einer Sprache, die ich mir erst erarbeiten musste.",
    about_bio_2: "Während meiner Promotion an der Universität Bremen zum Thema Migration entdeckte ich meine Leidenschaft für den Online-Journalismus. Daraus entstand mein eigenes deutsch-arabisches Nachrichtenportal, das bis heute eine Brücke zwischen Deutschland und Afrika schlägt.",
    about_bio_3: "2016 gründete ich meine Agentur <strong>Afripa Media Service</strong>. Seitdem berate ich Privatpersonen, Unternehmer:innen, aber auch Politiker und Verwaltungen in Deutschland und Marokko in den Bereichen Online-Marketing, Öffentlichkeitsarbeit und digitale Sichtbarkeit.",
    about_quote: "Erst machen, dann verbessern. Denn Perfektionismus und das Wort 'irgendwann' lähmen nur.",
    about_btn_talk: "Direkt mit Dr. Jamal sprechen",
    about_btn_more: "Mehr über meinen Werdegang erfahren",
    fach_tag: "Schwerpunkte & Leistungsbereiche",
    fach_title: "Wobei ich dir",
    fach_title_gold: "konkret helfe",
    fach_desc: "Erprobte Expertise aus über zwei Jahrzehnten Medien- und Unternehmenserfahrung:",
    fach_b1: "Beratung & Strategie",
    fach_t1: "Beratung für Privatpersonen, Unternehmen und Organisationen",
    fach_d1: "Verbindung aus Migrationstheorie und Online-Marketing-Praxis – passgenau für deinen Werdegang und deine Marktchancen.",
    fach_f1_1: "1:1 Analyse & glasklare Positionierung",
    fach_f1_2: "Tragfähiger Gründungs- & Geschäftsplan",
    fach_f1_3: "Rechtssicher im deutschen Wirtschaftssystem",
    fach_foot_1: "Individuell & Strategisch",
    fach_b2: "Zweisprachig (DE / AR)",
    fach_t2: "Workshops, Seminare & Vorträge",
    fach_d2: "Auf Deutsch und Arabisch. Keine Sprachbarrieren, sondern klare Wissensvermittlung und praxiserprobte Anleitungen.",
    fach_f2_1: "Komplett ohne Sprachbarriere (Deutsch & Arabisch)",
    fach_f2_2: "Praxisnahe Schritt-für-Schritt Arbeitsblätter",
    fach_f2_3: "Interaktiver Austausch & offene Fragerunden",
    fach_foot_2: "Bikulturelle Kompetenz",
    fach_b3: "Reichweite & Vertrauen",
    fach_t3: "Werbung mit Prominenten & Influencern",
    fach_d3: "Influencer-Marketing, u. a. mit Fußball-Star Ailton für Reichweite und Vertrauen bei deiner Zielgruppe.",
    fach_f3_1: "Kooperationen mit prominenten Persönlichkeiten",
    fach_f3_2: "Sofortiger Vertrauensvorschuss im Zielmarkt",
    fach_f3_3: "Maximale mediale Reichweite & Aufmerksamkeit",
    fach_foot_3: "Hohe Glaubwürdigkeit",
    fach_b4: "Performance & Content",
    fach_t4: "Digitale Sichtbarkeit für Selbstständige & Institutionen",
    fach_d4: "SEO, Google- & Social-Media-Ads, Content Management für messbare Kundengewinnung.",
    fach_f4_1: "Performance-Marketing (Meta & Google Ads)",
    fach_f4_2: "SEO-Optimierung für Google Top-Platzierungen",
    fach_f4_3: "Planbare Lead- & Neukundengewinnung",
    fach_foot_4: "Messbarer ROI",
    kpi_1: "Kunden insgesamt beraten",
    kpi_2: "Jahre Erfahrung in DE",
    kpi_3: "Erfolge gemeinsam mit Kunden",
    kpi_4: "Internationale Auszeichnungen",
    step_tag: "Dein Weg zum Start",
    step_title: "In 3 Schritten zu deinem eigenen Business",
    step_desc: "Vom ersten Gedanken bis zum funktionierenden Kundenstrom:",
    step_pill_1: "Schritt 1",
    step_t1: "Kostenloses Erstgespräch",
    step_d1: "Kennenlernen, Bestandsaufnahme und ehrliche Einschätzung deiner individuellen Potenziale.",
    step_pill_2: "Schritt 2",
    step_t2: "Dein individueller Fahrplan",
    step_d2: "Maßgeschneiderte Strategie mit Dr. Jamal Bouassiria und seinem Team für deine Gründung und Positionierung.",
    step_pill_3: "Schritt 3",
    step_t3: "Umsetzung mit 1:1-Begleitung",
    step_d3: "Direkte Begleitung, Feedbackschleifen und praxiserprobte Methoden für planbare Erfolge.",
    step_cta: "Jetzt Platz im Erstgespräch sichern",
    testi_tag: "Verifizierte Resultate",
    testi_title: "Erfolge unserer Mentees",
    testi_desc: "Echte Mentees mit Migrationsgeschichte, die den Schritt gewagt haben und heute florierende Unternehmen führen:",
    testi_b1: "6-stelliger Umsatz nach 12 Monaten",
    testi_q1: "\"Ich dachte, mein Akzent wäre ein Hindernis für den deutschen Markt. Dr. Jamal hat mir gezeigt, dass meine Geschichte meine größte Stärke ist. Heute beliefern wir Kunden in ganz Deutschland.\"",
    testi_r1: "E-Commerce & Handel",
    testi_b2: "B2B Kundenstamm etabliert",
    testi_q2: "\"Durch das 1:1-Coaching und die Medienarbeit mit Dr. Jamal habe ich eine Marke aufgebaut, die sofort Vertrauen bei institutionellen Kunden und Unternehmen schafft.\"",
    testi_r2: "Beratung & Sprache",
    testi_b3: "Meisterbetrieb ausgebaut",
    testi_q3: "\"Das Pareto-Prinzip war der Gamechanger. Dr. Jamal hat mein Marketing und meine Abläufe optimiert. Jetzt habe ich volle Auftragsbücher und endlich wieder Zeit für meine Familie.\"",
    testi_r3: "Gebäudetechnik Meister",
    faq_tag: "Klarheit & Transparenz",
    faq_title: "Häufig gestellte Fragen",
    faq_desc: "Alles, was du vor deiner kostenlosen Erstberatung wissen musst:",
    faq_q1: "Für wen ist dieses Coaching genau geeignet?",
    faq_a1: "Das Programm richtet sich speziell an Menschen mit Migrationsgeschichte in Deutschland – egal ob du noch im Angestelltenverhältnis steckst und nebenberuflich gründen möchtest, bereits eine Idee hast oder schon selbstständig bist und dein Unternehmen skalieren willst.",
    faq_q2: "Brauche ich schon eine fertige Geschäftsidee, um zu starten?",
    faq_a2: "Nein! Wenn du bereits Talente, Fähigkeiten oder Fachwissen hast, erarbeiten wir gemeinsam im Erstgespräch und den ersten Sessions das profitable Angebot, das im deutschen Markt am stärksten nachgefragt wird.",
    faq_q3: "In welcher Sprache findet das Coaching statt?",
    faq_a3: "Das Coaching findet wahlweise auf <strong>Deutsch oder Arabisch</strong> statt (oder kombiniert). Du musst keine Angst vor Sprachfehlern haben – Dr. Jamal versteht deine Situation aus eigener Erfahrung und vermittelt dir auch das nötige Vokabular für den deutschen Markt.",
    faq_q4: "Wie schnell kann ich erste konkrete Ergebnisse erwarten?",
    faq_a4: "Nach dem Prinzip „Machen statt warten“ setzen wir bereits in den ersten Wochen deine digitale Präsenz auf und leiten Marketingmaßnahmen ein. Die meisten Teilnehmer gewinnen ihre ersten zahlenden Kunden innerhalb der ersten 30 bis 60 Tage.",
    faq_q5: "Wie läuft das kostenlose Erstgespräch ab und was sind die nächsten Schritte?",
    faq_a5: "Nach deiner Terminanfrage rufen wir dich zu deinem Wunschzeitpunkt an. In ca. 30 Minuten sprechen wir vertraulich über deine Ziele, deine aktuellen Hürden und prüfen ehrlich, ob eine Zusammenarbeit Sinn macht. Wenn alles passt, erhältst du deinen maßgeschneiderten Fahrplan.",
    final_kicker: "Nur begrenzte Plätze für 1:1-Mentoring verfügbar",
    final_title: 'Bereit, aus deiner Geschichte <span class="gold-gradient-text">deinen Erfolg</span> zu machen?',
    final_sub: "Hör auf zu warten, bis alles perfekt ist. Sichere dir dein unverbindliches Erstgespräch mit Dr. Jamal Bouassiria und erfahre, wie du dein Unternehmen in Deutschland aufbaust.",
    final_btn_book: "Jetzt kostenloses Erstgespräch vereinbaren",
    final_btn_ebook: "Kostenloses E-Book herunterladen",
    footer_quote: "„Wenn du schon sagst: 'Ich schaffe das nicht', dann wirst du es nicht schaffen. Aber wenn du dich fragst: 'Wie kann ich es doch schaffen?' – dann hast du schon 80 % geschafft. Den Rest musst du nur noch tun.“",
    footer_quote_author: "— Dr. Jamal Bouassiria",
    footer_brand_desc: "Spezialisiert auf Existenzgründung, Markenaufbau und Medienpräsenz für Menschen mit Migrationsgeschichte in Deutschland.",
    footer_contact_h: "Direkter Kontakt",
    footer_nav_h: "Navigation",
    footer_rights: "© 2026 Dr. Jamal Bouassiria · Afripa Media Service. Alle Rechte vorbehalten.",
    footer_impressum: "Impressum",
    footer_datenschutz: "Datenschutz",
    mob_sticky_cta: "Erstgespräch sichern",
    // Funnel & Lead Modal Keys (DE)
    funnel_step_1_of_4: "Schritt 1 von 4",
    funnel_header_title: "Kostenloses Erstgespräch",
    funnel_step_of: "Schritt {step} von {total}",
    funnel_q1_title: "Wo stehst du aktuell?",
    funnel_q1_desc: "Wähle die Situation, die am besten auf dich zutrifft:",
    funnel_opt_s1: "Ich habe eine Geschäftsidee oder ein Talent, weiß aber nicht, wie ich starten soll.",
    funnel_opt_s2: "Ich bin bereits selbstständig, will aber mehr Kunden und ein starkes Personal Branding.",
    funnel_opt_s3: "Ich arbeite aktuell noch im Job und möchte mir nebenberuflich ein Business aufbauen.",
    funnel_q2_title: "Was ist deine größte Herausforderung?",
    funnel_q2_desc: "Damit wir uns gezielt auf dein Gespräch vorbereiten können:",
    funnel_opt_c1: "Sprachliche Unsicherheit & Angst vor deutscher Bürokratie.",
    funnel_opt_c2: "Ich kenne hier niemanden und habe kein tragfähiges Kontaktnetzwerk.",
    funnel_opt_c3: "Marketing, Social Media, Webseite und planbare Neukundengewinnung.",
    funnel_opt_c4: "Richtiges Verkaufen und Verhandeln auf Augenhöhe.",
    funnel_q3_title: "Wann möchtest du starten & Sprache",
    funnel_q3_desc: "Gib uns deinen Zeitrahmen und deine bevorzugte Beratungssprache an:",
    funnel_timeline_label: "Wann möchtest du loslegen?",
    funnel_opt_t1: "Sofort (in den nächsten 1 bis 2 Wochen)",
    funnel_opt_t2: "In den nächsten 1 bis 3 Monaten",
    funnel_lang_label: "Bevorzugte Sprache für das Gespräch:",
    funnel_opt_lang_de: "Deutsch 🇩🇪",
    funnel_opt_lang_ar: "Arabisch / العربية 🇲🇦",
    funnel_q4_title: "Deine Kontaktdaten & Wunschuhrzeit",
    funnel_q4_desc: "Wohin darf Dr. Jamal Bouassiria oder ein Berater aus dem Team sich melden?",
    funnel_name_label: "Vollständiger Name *",
    funnel_name_ph: "z. B. Tariq El-Mansouri",
    funnel_phone_label: "Telefonnummer / WhatsApp *",
    funnel_phone_ph: "z. B. +49 176 12345678",
    funnel_email_label: "E-Mail-Adresse *",
    funnel_email_ph: "name@beispiel.de",
    funnel_slot_label: "Bevorzugtes Zeitfenster für den Rückruf:",
    slot_1: "10:00 - 12:00 Uhr",
    slot_2: "14:00 - 16:00 Uhr",
    slot_3: "17:00 - 19:00 Uhr",
    funnel_notes_label: "Kurze Notiz zu deiner Idee (Optional)",
    funnel_notes_ph: "Worum geht es in deinem Vorhaben?",
    funnel_success_title: "Vielen Dank für dein Vertrauen!",
    funnel_success_desc: "Deine Daten wurden sicher übermittelt. Dr. Jamal Bouassiria oder ein leitender Mentor aus seinem Team wird sich zum gewünschten Zeitfenster persönlich bei dir melden.",
    funnel_success_close: "Fenster schließen",
    funnel_prev_btn: "← Zurück",
    funnel_next_btn: "Weiter",
    funnel_submit_btn: "Termin jetzt verbindlich anfragen",
    funnel_toast_err_status: "Bitte wähle deine aktuelle Situation aus.",
    funnel_toast_err_challenge: "Bitte wähle deine größte Herausforderung aus.",
    funnel_toast_err_timeline: "Bitte gib an, wann du starten möchtest.",
    funnel_toast_err_name: "Bitte gib deinen vollen Namen ein.",
    funnel_toast_err_phone: "Bitte gib eine gültige Telefonnummer ein.",
    funnel_toast_err_email: "Bitte gib eine gültige E-Mail-Adresse ein.",
    funnel_submitting: "Wird übertragen...",
    funnel_summary_name: "Name",
    funnel_summary_phone: "Telefon",
    funnel_summary_email: "E-Mail",
    funnel_summary_slot: "Wunschzeit",
    funnel_summary_lang: "Sprache",
    funnel_summary_status: "Status",
    funnel_success_toast: "Vielen Dank, {name}! Deine Terminanfrage wurde erfolgreich vorgemerkt.",
    lead_kicker: "Kostenloser Leitfaden",
    lead_title: "Der Migranten-Gründer-Fahrplan",
    lead_desc: "Trage dich ein und erhalte sofort praxiserprobte Tipps für Positionierung, Behördengänge und Kundenakquise in Deutschland.",
    lead_name_label: "Dein Vorname",
    lead_name_ph: "z. B. Samir",
    lead_email_label: "Deine beste E-Mail-Adresse",
    lead_email_ph: "samir@beispiel.de",
    lead_btn_submit: "Kostenlos herunterladen & anmelden",
    lead_privacy: "Kein Spam. Abmeldung jederzeit mit einem Klick möglich. DSGVO-konform.",
    lead_submitting: "Wird gesendet...",
    lead_success_toast: "Erfolg! Der Leitfaden wurde an {email} gesendet."
  },
  ar: {
    nav_about: "عن د. جمال",
    nav_method: "المنهجية",
    nav_content: "محتوى التدريب",
    nav_stories: "قصص النجاح",
    nav_faq: "أسئلة شائعة",
    nav_cta: "احجز جلستك",
    drawer_lang_label: "Sprache / اللغة",
    mob_problem: "المشكلة والحل",
    mob_reasons: "7 مزايا للبرنامج",
    mob_expertise: "مجالات الخبرة",
    mob_steps: "في 3 خطوات",
    mob_drawer_cta: "احجز جلستك الاستشارية المجانية",
    hero_title: 'أنت هنا لتبني مشروعاً حقيقياً. <span class="gold-gradient-text">وليس لتبقى صغيراً.</span>',
    hero_sub: 'مرافقة وتوجيه استراتيجي من الدكتور جمال بوعسيرية – خبرة عملية مثبتة، بدون عوائق لغوية وبأقصر الطرق لتأسيس وإنجاح شركتك في ألمانيا.',
    hero_cta: 'احجز جلستك الاستشارية المجانية',
    hero_about: 'عن د. جمال ↓',
    hero_guarantee: 'سرية تامة 100% · استشارة أولية باللغة الألمانية أو العربية',
    trust_1: 'استشارة أكثر من 7000 شخص',
    trust_2: 'أكثر من 20 عاماً خبرة في ألمانيا',
    trust_3: 'منهجية معتمدة ومثبتة',
    pillar_kicker: 'منهجية النجاح الميدانية',
    pillar_tag: 'ماذا يعني ذلك لنجاحك؟',
    pillar_subtitle: 'ثلاث ركائز استراتيجية تحول التحديات إلى شركة مستقرة ومربحة في ألمانيا تحت إشراف د. جمال بوعسيرية.',
    pillar_word_1: 'اللغة',
    pillar_title_1: 'ليست عائقاً، بل ميزتك التنافسية الكبرى',
    pillar_desc_1: 'يعتقد الكثيرون أنك تحتاج إلى ألمانية خالية من الأخطاء لتؤسس شركة ناجحة. الواقع: العملاء يشترون الثقة، الاحتراف والنتائج الملموسة وليس القواعد اللغوية. نحوّل ثنائيتك اللغوية لأقوى بطاقة تعريف لك.',
    pillar_word_2: 'العلاقات',
    pillar_title_2: 'فتح الأبواب المغلقة وشبكات الأعمال الموثوقة',
    pillar_desc_2: 'بدون علاقات محلية قد تبدو السوق صعبة ومغلقة. مع الدكتور جمال، لن تبدأ من الصفر، بل تستفيد من شبكة علاقات B2B ممتدة لأكثر من 20 عاماً، وتواصل مباشر مع رواد الأعمال وصنّاع القرار من اليوم الأول.',
    pillar_word_3: 'الاستراتيجية',
    pillar_title_3: 'تحويل الجهد والعمل الشاق إلى شركة رابحة ومستقرة',
    pillar_desc_3: 'الفكرة وحدها لا تكفي في السوق الألماني. ما يصنع الفرق هو التنفيذ الدقيق: تأسيس قانوني سليم، تموضع تسويقي واضح، واستقطاب منتظم للعملاء دون تضييع الوقت في التعقيدات البيروقراطية والأخطاء المكلفة.',
    banner_brand_pre: 'كن',
    banner_brand_post: 'شريك النجاح',
    banner_text: 'يمنحك الدكتور جمال وصولاً مباشراً إلى خلاصة الخبرة الميدانية التي اعتمد عليها أكثر من 7000 شخص لبناء مشاريع رائدة ومستدامة في ألمانيا. تدريب تطبيقي 100%، بدون حواجز لغوية وبمنتهى الاحترافية والشفافية.',
    banner_cta: 'احجز جلستك الاستشارية المجانية الآن',
    stat_prefix_1: 'أكثر من',
    stat_label_1: 'شخص تم تقديم الاستشارة لهم',
    stat_prefix_2: 'أكثر من',
    stat_label_2: 'عاماً من الخبرة في ألمانيا',
    stat_prefix_3: 'حتى',
    stat_label_3: 'تطبيق عملي وسرية تامة',
    methode_tag: 'التركيز بدل التشتت',
    methode_title: 'مبدآن جوهريان',
    methode_title_gold: 'يغيّران كل شيء',
    methode_desc: 'النجاح في تأسيس الأعمال لا يحتاج إلى تردد طويل، بل يعتمد على أسس واضحة ومجرّبة:',
    methode_card1_title: '1. مبدأ باريتو (80 / 20)',
    methode_card1_desc: 'ركّز طاقتك على 20% من الخطوات الاستراتيجية التي تحقق 80% من نتائجك وأرباحك – دون تضييع الوقت في تفاصيل هامشية.',
    methode_card1_pill: '80% من النتائج من 20% من الجهد المركزي',
    methode_card2_title: '2. البدء والتنفيذ بدل الانتظار',
    methode_card2_desc: 'السعي للكمال الزائف هو أكبر عائق أمام رواد الأعمال الجدد. من ينتظر حتى يصبح كل شيء مثالياً لن يبدأ أبداً. من ينطلق ويطوّر في الميدان يصل للقمة.',
    methode_card2_pill: 'سرعة التنفيذ والتطوير تتفوق على الانتظار',
    benefits_tag: 'خطوات التحول والنمو',
    benefits_title: 'نتعلم ونبني معاً',
    benefits_title_gold: 'خطوة بخطوة',
    benefits_desc: 'نحوّل رؤيتك وفكرتك من مجرد خطة على الورق إلى شركة حقيقية، مربحة وقانونية 100% في ألمانيا:',
    benefit_pillar_1: 'الركيزة 01 · الحضور الرقمي',
    benefit_title_1: 'بناء حضورك الرقمي المتكامل',
    benefit_desc_1: 'موقع إلكتروني، متجر، هوية بصرية وتصميم احترافي يمنح مشروعك مصداقية فورية من اليوم الأول.',
    benefit_item_1_1: 'موقع احترافي وتصميم عالي التحويل',
    benefit_item_1_2: 'إعداد المتجر الإلكتروني والدفع الرقمي',
    benefit_item_1_3: 'مطابقة قانونية كاملة لمعايير الخصوصية DSGVO',
    benefit_tag_1: 'السيادة الرقمية',
    benefit_pillar_2: 'الركيزة 02 · الوصول والعملاء',
    benefit_title_2: 'الظهور التسويقي واستقطاب العملاء',
    benefit_desc_2: 'حملات إعلانية دقيقة واستراتيجيات تسويق موجهة في الوسائط الرقمية والتقليدية لمضاعفة المبيعات والأرباح.',
    benefit_item_2_1: 'تسويق الأداء عبر ميتا وجوجل (Performance Marketing)',
    benefit_item_2_2: 'ظهور إعلامي وعلاقات عامة مستهدفة في ألمانيا',
    benefit_item_2_3: 'تدفق منتظم ومدروس للعملاء الجدد',
    benefit_tag_2: 'نمو قابل للقياس',
    benefit_pillar_3: 'الركيزة 03 · البراندينغ والمكانة',
    benefit_title_3: 'بناء علامتك الشخصية (Personal Branding)',
    benefit_desc_3: 'استثمار أكثر من 20 عاماً من خبرة د. جمال في التعامل مع وسائل الإعلام وصنّاع القرار لترسيخ مكانتك كخبير موثوق.',
    benefit_item_3_1: 'تموضع قوي كخبير مطلوب في مجالك',
    benefit_item_3_2: 'ظهور إعلامي، مقابلات وحضور واثق على المنصات',
    benefit_item_3_3: 'وصول مباشر لشبكة علاقات B2B نمت على مدار 20 عاماً',
    benefit_tag_3: 'علامة تجارية لا تُنسى',
    inhalte_tag: 'خطة تدريب وتطبيق عملية',
    inhalte_title: 'خطوة بخطوة',
    inhalte_title_gold: 'نحو شركتك المستقلة',
    inhalte_desc: 'ورشات عمل، ندوات تدريبية واستشارات فردية 1:1 باللغتين الألمانية والعربية:',
    mod_tag_1: 'الوحدة 01',
    mod_1: 'إدارة المشاريع والتخطيط',
    mod_tag_2: 'الوحدة 02',
    mod_2: 'تطوير الشخصية والقيادة',
    mod_tag_3: 'الوحدة 03',
    mod_3: 'بناء العلامة التجارية وصناعة الهوية',
    mod_tag_4: 'الوحدة 04',
    mod_4: 'تأسيس الشركة والإجراءات القانونية',
    mod_tag_5: 'الوحدة 05',
    mod_5: 'التدريب الصحفي والعلاقات العامة الرقمية',
    mod_tag_6: 'الوحدة 06',
    mod_6: 'تطوير المواقع، كتابة الإعلانات والبيع الرقمي',
    takeaway_badge: 'عوائد عملية فورية',
    takeaway_title: 'ما ستحصل عليه عملياً:',
    takeaway_1: 'نظام إلكتروني مجرّب للوصول إلى الاستقلال المالي.',
    takeaway_2: 'استراتيجيات عملية للظهور الإعلامي والعلاقات العامة.',
    takeaway_3: 'نصائح وإرشادات تطبيقية منتظمة تصلك عبر البريد.',
    takeaway_4: 'تركيز كامل على الركائز الأساسية التي تصنع الفارق الحقيقي.',
    transparency_label: 'شفافية ومصداقية تامة:',
    transparency_quote: '"برنامجي التدريبي ليس وسيلة للثراء السريع الزائف، بل للوصول إلى الحرية المالية والاستقلال عن العمل الوظيفي اليومي، وهذا هو الهدف الحقيقي الذي نعمل معاً لتحقيقه."',
    transparency_cta: 'اشترك مجاناً في القائمة البريدية الآن',
    reasons_tag: 'دوافعك للنجاح',
    reasons_title: 'هذه المزايا السبع',
    reasons_title_gold: 'يحققها لك مشروعك الخاص',
    reasons_desc: 'لماذا يستحق الأمر أن تبدأ اليوم في وضع الأساس لشركتك المستقلة في ألمانيا:',
    reason_tag_1: 'الربحية',
    reason_title_1: 'حوّل معرفتك وخبراتك إلى دخل حقيقي ومربح',
    reason_desc_1: 'استثمر تجاربك المهنية والشخصية لتبني عروضاً واستشارات مطلوبة ومربحة في السوق الألماني.',
    reason_tag_2: 'الأثر والقيمة',
    reason_title_2: 'ساعد الآخرين من خلال خدمات مشروعك',
    reason_desc_2: 'قدّم حلولاً حقيقية لمشاكل عملائك واصنع أثراً إيجابياً وملموساً في مجتمعك.',
    reason_tag_3: 'استقطاب منتظم',
    reason_title_3: 'استقطب عملاء جدد بانتظام وبشكل مدروس',
    reason_desc_3: 'عبر مسارات تسويقية رقمية وقنوات بيع مجرّبة تضمن لك تدفقاً مستمراً بدون عناء.',
    reason_tag_4: 'النمو المالي',
    reason_title_4: 'ضاعف أرباحك وعوائدك المالية بوضوح',
    reason_desc_4: 'لا وجود لسقف يفرضه عليك رب عمل – دخلك يتصاعد طردياً مع نجاحك وقيمة ما تقدمه.',
    reason_tag_5: 'الحرية والاستقلال',
    reason_title_5: 'حرية حقيقية – في وقتك وقراراتك المالية',
    reason_desc_5: 'تحكّم بنفسك في جدول أعمالك، مكان عملك ومسار مستقبلك بكل استقلالية.',
    reason_tag_6: 'إطلاق الإمكانات',
    reason_title_6: 'اكتشف واستثمر كامل قدراتك الكامنة',
    reason_desc_6: 'تجاوز الحدود الوظيفية التقليدية وابنِ مشروعاً تفتخر به أنت وعائلتك.',
    reason_tag_7: 'الجوهر وأسمى الغايات',
    reason_title_7: 'مزيد من الوقت لما يهمك حقاً:',
    reason_title_7_gold: 'عائلتك الكريمة',
    reason_desc_7: 'الأمان المالي والحرية الزمنية يعنيان قبل كل شيء: جودة حياة حقيقية، حضور أسري دافئ ولحظات لا تُقدّر بثمن مع من تحب.',
    about_portrait_role: "مؤسس، كاتب ومستشار أعمال",
    about_badge_exp: "دكتوراه من جامعة بريمن",
    about_tag: "قصة نجاح واقعية وملهمة",
    about_title: "اسمي د. جمال بوعسيرية",
    about_roles: "عالم سياسي · صحفي · رائد أعمال في الإعلام الرقمي والعلاقات العامة",
    about_bio_1: "نشأت في المغرب وجئت إلى ألمانيا بعد البكالوريا لدراسة العلوم السياسية – دون شبكة أمان عائلية، دون معارف مسبقة، وبلغة كان عليّ تعلمها وبناؤها من الصفر.",
    about_bio_2: "خلال دراستي للدكتوراه في جامعة بريمن حول قضايا الهجرة، اكتشفت شغفي بالإعلام الرقمي. ومن هناك أطلقت بوابتي الإخبارية الألمانية-العربية التي تشكل حتى اليوم جسراً إعلامياً بين ألمانيا والقارة الأفريقية.",
    about_bio_3: "في عام 2016، أسست وكالتي <strong>Afripa Media Service</strong>. ومنذ ذلك الحين أقدم الاستشارات لرواد الأعمال، الشخصيات العامة، وصنّاع القرار في ألمانيا والمغرب في مجالات التسويق الرقمي، العلاقات العامة وبناء الحضور المؤسسي.",
    about_quote: "ابدأ أولاً، ثم حسّن وطوّر. لأن السعي للكمال الزائف وكلمة 'يوماً ما' هما أكبر معطّل للنجاح.",
    about_btn_talk: "تحدث مباشرة مع د. جمال",
    about_btn_more: "تعرف على مسيرتي وخبرتي",
    fach_tag: "مجالات الخبرة والاختصاص",
    fach_title: "مجالات الخبرة التي أساعدك فيها",
    fach_title_gold: "بشكل عملي وملموس",
    fach_desc: "خبرة ميدانية مجرّبة مستخلصة من أكثر من عقدين في الإعلام وتأسيس الشركات في ألمانيا:",
    fach_b1: "الاستشارة والاستراتيجية",
    fach_t1: "استشارات للأفراد، الشركات والمنظمات",
    fach_d1: "دمج عميق بين الفهم الدقيق لواقع الهجرة والممارسة التطبيقية للتسويق الرقمي – مصممة خصيصاً لمسارك وفرصك في السوق الألماني.",
    fach_f1_1: "تحليل شخصي 1:1 وتموضع تسويقي واضح",
    fach_f1_2: "خطة عمل وتأسيس متكاملة ومستدامة",
    fach_f1_3: "مطابقة قانونية تامة للنظام الاقتصادي الألماني",
    fach_foot_1: "استراتيجي ومخصص",
    fach_b2: "ثنائي اللغة (ألماني / عربي)",
    fach_t2: "ورش عمل، ندوات ومحاضرات تدريبية",
    fach_d2: "باللغتين الألمانية والعربية. بدون حواجز لغوية، بل بنقل واضح للمعرفة وإرشادات تطبيقية فورية.",
    fach_f2_1: "بدون أي عائق لغوي (ألماني وعربي)",
    fach_f2_2: "نماذج وأوراق عمل تطبيقية خطوة بخطوة",
    fach_f2_3: "تفاعل مباشر وإجابة على كافة التساؤلات",
    fach_foot_2: "كفاءة ثنائية الثقافة",
    fach_b3: "الانتشار والمصداقية",
    fach_t3: "التسويق عبر المشاهير والشخصيات العامة",
    fach_d3: "حملات تسويقية وتأثيرية، من بينها التعاون مع نجم كرة القدم أيلتون، لصناعة مصداقية وانتشار واسع بين جمهورك المستهدف.",
    fach_f3_1: "تعاون استراتيجي مع شخصيات معروفة",
    fach_f3_2: "ثقة ومصداقية فورية لدى العملاء الجدد",
    fach_f3_3: "انتشار إعلامي وجذب واسع للأنظار",
    fach_foot_3: "مصداقية عالية",
    fach_b4: "الأداء والمحتوى",
    fach_t4: "الظهور الرقمي لرواد الأعمال والمؤسسات",
    fach_d4: "تحسين محركات البحث، إعلانات جوجل ومواقع التواصل، وإدارة المحتوى لاستقطاب عملاء جدد بشكل دوري ومستمر.",
    fach_f4_1: "تسويق الأداء عبر إعلانات ميتا وجوجل",
    fach_f4_2: "تصدر المراتب الأولى في نتائج بحث جوجل",
    fach_f4_3: "تدفق مستمر ومدروس للعملاء المحتملين",
    fach_foot_4: "عائد استثماري ملموس",
    kpi_1: "إجمالي العملاء المستفيدين من الاستشارات",
    kpi_2: "عاماً من الخبرة في ألمانيا",
    kpi_3: "قصة نجاح مشتركة مع العملاء",
    kpi_4: "جوائز وتكريمات دولية",
    step_tag: "خارطة طريقك للانطلاق",
    step_title: "في 3 خطوات نحو شركتك المستقلة",
    step_desc: "من الفكرة الأولى وحتى التدفق المستمر والمنتظم للعملاء:",
    step_pill_1: "الخطوة 1",
    step_t1: "جلسة استشارية أولية مجانية",
    step_d1: "تعارف شخصي، تحليل دقيق لواقعك الحالي وتقييم شفاف لإمكاناتك وفرص نجاحك في ألمانيا.",
    step_pill_2: "الخطوة 2",
    step_t2: "خطة عمل مخصصة لمشروعك",
    step_d2: "استراتيجية تنفيذية مصممة خصيصاً مع د. جمال وفريقه لتأسيس شركتك وتموضعك القوي في السوق.",
    step_pill_3: "الخطوة 3",
    step_t3: "التنفيذ والمرافقة الفردية 1:1",
    step_d3: "مرافقة مباشرة وميدانية، تقييم مستمر وأدوات مجرّبة لتحقيق نتائج ونجاحات مالية قابلة للقياس.",
    step_cta: "احجز موعد جلستك الاستشارية الآن",
    testi_tag: "نتائج موثقة ومثبتة",
    testi_title: "قصص نجاح متدربينا",
    testi_desc: "رواد أعمال حقيقيون من خلفيات مهاجرة اتخذوا القرار ويديرون اليوم شركات مزدهرة ومربحة في ألمانيا:",
    testi_b1: "عائدات من 6 أرقام بعد 12 شهراً",
    testi_q1: "\"كنت أعتقد أن لكنتي تشكل عائقاً في السوق الألماني. علمني د. جمال أن قصتي وخلفيتي هما نقطة قوتي الكبرى. اليوم نخدم عملاء في كل أنحاء ألمانيا.\"",
    testi_r1: "تجارة إلكترونية وتوزيع",
    testi_b2: "بناء قاعدة عملاء B2B مؤسسية",
    testi_q2: "\"بفضل التدريب الفردي 1:1 والعمل الإعلامي مع د. جمال، بنيت علامة تجارية تفرض الثقة الفورية لدى كبرى الشركات والمؤسسات.\"",
    testi_r2: "استشارات ولغات",
    testi_b3: "تطوير شركة حرفية معتمدة",
    testi_q3: "\"كان مبدأ باريتو نقطة التحول الفاصلة. حسّن د. جمال خطتي التسويقية وإدارة العمليات. واليوم لدي جدول أعمال ممتلئ بالطلبات ووجدت متسعاً لعائلتي.\"",
    testi_r3: "مايستر في التجهيزات التقنية للبناء",
    faq_tag: "وضوح وشفافية تامة",
    faq_title: "الأسئلة الشائعة",
    faq_desc: "كل ما تحتاج لمعرفته قبل جلستك الاستشارية المجانية الأولى:",
    faq_q1: "لمن يناسب هذا البرنامج التدريبي تحديداً؟",
    faq_a1: "البرنامج مصمم خصيصاً لأصحاب الخلفيات المهاجرة في ألمانيا – سواء كنت موظفاً وترغب في تأسيس عملك الخاص بجانب وظيفتك، أو لديك فكرة مشروع وتبحث عن البداية الصحيحة، أو رائد أعمال قائم وتريد مضاعفة أرباحك وتوسيع شركتك.",
    faq_q2: "هل يشترط أن أمتلك فكرة عمل جاهزة ومكتملة للبدء؟",
    faq_a2: "لا، على الإطلاق! إذا كانت لديك مهارات، مواهب أو خبرات سابقة، نقوم معاً في الجلسة الاستشارية الأولى وورش العمل ببلورة عرض تجاري عالي الربحية ومطلوب بقوة في السوق الألماني.",
    faq_q3: "بأي لغة تتم جلسات الاستشارة والتدريب؟",
    faq_a3: "يتم التدريب حسب رغبتك باللغة <strong>الألمانية أو العربية</strong> (أو بالدمج بينهما). لا تقلق أبداً بشأن الأخطاء اللغوية – د. جمال مر بنفس التجربة ويعلمك أيضاً المصطلحات المهنية اللازمة للنجاح مع العملاء الألمان.",
    faq_q4: "متى يمكنني توقع ظهور أولى النتائج الملموسة؟",
    faq_a4: "وفقاً لمبدأ 'التنفيذ بدل الانتظار'، نطلق حضورك الرقمي واستراتيجيتك التسويقية خلال الأسابيع الأولى. ومعظم المشاركين يوقعون عقودهم الأولى مع عملاء يدفعون خلال أول 30 إلى 60 يوماً.",
    faq_q5: "كيف تجري الجلسة الاستشارية المجانية الأولى وما هي الخطوات التالية؟",
    faq_a5: "بعد تقديم طلب الموعد، نتصل بك في التوقيت الذي تفضله. وخلال 30 دقيقة نناقش بسرية تامة أهدافك، التحديات التي تواجهك، ونحدد بصدق ما إذا كان التعاون بيننا مثمراً. وعند التوافق تحصل على خارطة طريقك المخصصة.",
    final_kicker: "أماكن محدودة فقط متاحة للمرافقة الفردية 1:1",
    final_title: 'هل أنت مستعد لتحويل قصتك وتجاربك إلى <span class="gold-gradient-text">نجاح حقيقي</span> في ألمانيا؟',
    final_sub: "توقف عن الانتظار حتى يصبح كل شيء مثالياً. احجز جلستك الاستشارية الأولى غير الملزمة مع د. جمال بوعسيرية واكتشف كيف تؤسس وتطلق شركتك بثقة واستقرار.",
    final_btn_book: "احجز جلستك الاستشارية المجانية الآن",
    final_btn_ebook: "حمّل الكتاب الإرشادي المجاني",
    footer_quote: "«إذا قلت لنفسك مسبقاً: 'لن أستطيع'، فلن تنجح أبداً. لكن إذا سألت نفسك: 'كيف يمكنني أن أحقق ذلك؟' – فقد قطعت 80% من طريق النجاح. وما تبقى هو التنفيذ فقط.»",
    footer_quote_author: "— د. جمال بوعسيرية",
    footer_brand_desc: "متخصصون في تأسيس الشركات، بناء العلامات التجارية وتعزيز الحضور الإعلامي لرواد الأعمال من أصول مهاجرة في ألمانيا.",
    footer_contact_h: "تواصل مباشر",
    footer_nav_h: "تصفح الموقع",
    footer_rights: "© 2026 د. جمال بوعسيرية · شركة أفريبا للخدمات الإعلامية. جميع الحقوق محفوظة.",
    footer_impressum: "البيانات القانونية",
    footer_datenschutz: "سياسة الخصوصية",
    mob_sticky_cta: "احجز جلستك المجانية",
    // Funnel & Lead Modal Keys (AR)
    funnel_step_1_of_4: "الخطوة 1 من 4",
    funnel_header_title: "جلسة استشارية أولية مجانية",
    funnel_step_of: "الخطوة {step} من {total}",
    funnel_q1_title: "أين تقف في مسارك الحالي؟",
    funnel_q1_desc: "اختر الحالة التي تصف وضعك بأفضل شكل:",
    funnel_opt_s1: "لدي فكرة مشروع أو مهارة، لكنني لا أعرف من أين أبدأ الخطوات الأولى.",
    funnel_opt_s2: "لدي مشروعي الخاص حالياً، لكنني أريد المزيد من العملاء وبناء علامة تجارية شخصية قوية.",
    funnel_opt_s3: "أعمل حالياً كموظف وأرغب في تأسيس مشروع مستقل بجانب عملي الوظيفي.",
    funnel_q2_title: "ما هو التحدي الأكبر الذي يواجهك؟",
    funnel_q2_desc: "حتى نتمكن من التحضير الدقيق والفعال لجلستك الاستشارية:",
    funnel_opt_c1: "عدم الثقة التامة باللغة والخوف من البيروقراطية والمعاملات الألمانية.",
    funnel_opt_c2: "لا أعرف أحداً هنا وليس لدي شبكة علاقات ومعارف داعمة.",
    funnel_opt_c3: "التسويق الرقمي، وسائل التواصل، الموقع وجلب عملاء جدد بانتظام.",
    funnel_opt_c4: "مهارات البيع الاحترافي والتفاوض بثقة وندية.",
    funnel_q3_title: "توقيت الانطلاق ولغة الاستشارة",
    funnel_q3_desc: "حدد لنا الإطار الزمني المفضل لديك ولغة الاستشارة:",
    funnel_timeline_label: "متى ترغب في بدء الانطلاق؟",
    funnel_opt_t1: "فوراً (خلال الأسبوع أو الأسبوعين القادمين)",
    funnel_opt_t2: "خلال الأشهر 1 إلى 3 القادمة",
    funnel_lang_label: "اللغة المفضلة للجلسة الاستشارية:",
    funnel_opt_lang_de: "الألمانية 🇩🇪",
    funnel_opt_lang_ar: "العربية / Arabisch 🇲🇦",
    funnel_q4_title: "بيانات التواصل والتوقيت المفضل للاتصال",
    funnel_q4_desc: "إلى أين يمكن للدكتور جمال بوعسيرية أو أحد مستشاري الفريق الاتصال بك؟",
    funnel_name_label: "الاسم الكامل *",
    funnel_name_ph: "مثال: طارق المنصوري",
    funnel_phone_label: "رقم الهاتف / واتساب *",
    funnel_phone_ph: "مثال: 4917612345678+",
    funnel_email_label: "البريد الإلكتروني *",
    funnel_email_ph: "name@beispiel.de",
    funnel_slot_label: "التوقيت المفضل لإجراء الاتصال:",
    slot_1: "10:00 - 12:00 ظهراً",
    slot_2: "14:00 - 16:00 عصراً",
    slot_3: "17:00 - 19:00 مساءً",
    funnel_notes_label: "ملاحظة مختصرة حول فكرتك أو مشروعك (اختياري)",
    funnel_notes_ph: "ما هو مجال فكرتك أو مشروعك المستقبلي؟",
    funnel_success_title: "شكراً جزيلاً لثقتك الغالية!",
    funnel_success_desc: "تم إرسال بياناتك بأمان وسرية تامة. سيتواصل معك د. جمال بوعسيرية أو مستشار أول من فريقه شخصياً في التوقيت الذي حددته.",
    funnel_success_close: "إغلاق النافذة",
    funnel_prev_btn: "← السابق",
    funnel_next_btn: "متابعة",
    funnel_submit_btn: "تأكيد طلب الموعد الآن",
    funnel_toast_err_status: "يرجى تحديد وضعك الحالي.",
    funnel_toast_err_challenge: "يرجى اختيار التحدي الأكبر بالنسبة لك.",
    funnel_toast_err_timeline: "يرجى تحديد متى ترغب في البدء.",
    funnel_toast_err_name: "يرجى إدخال اسمك الكامل.",
    funnel_toast_err_phone: "يرجى إدخال رقم هاتف صحيح.",
    funnel_toast_err_email: "يرجى إدخال بريد إلكتروني صحيح.",
    funnel_submitting: "جارٍ الإرسال...",
    funnel_summary_name: "الاسم",
    funnel_summary_phone: "الهاتف",
    funnel_summary_email: "البريد الإلكتروني",
    funnel_summary_slot: "التوقيت المفضل",
    funnel_summary_lang: "لغة الاستشارة",
    funnel_summary_status: "الوضع الحالي",
    funnel_success_toast: "شكراً جزيلاً لك يا {name}! تم استلام وتأكيد طلب موعدك بنجاح.",
    lead_kicker: "دليل إرشادي مجاني",
    lead_title: "خارطة طريق تأسيس المشاريع في ألمانيا",
    lead_desc: "سجّل بياناتك لتصلك فوراً خطوات عملية للتموضع التسويقي، المعاملات الرسمية واستقطاب العملاء في ألمانيا.",
    lead_name_label: "اسمك الأول",
    lead_name_ph: "مثال: سمير",
    lead_email_label: "بريدك الإلكتروني الأساسي",
    lead_email_ph: "samir@beispiel.de",
    lead_btn_submit: "تحميل مجاني والاشتراك الآن",
    lead_privacy: "بدون رسائل مزعجة. إلغاء الاشتراك متاح بضغطة واحدة في أي وقت. متوافق مع لوائح الخصوصية.",
    lead_submitting: "جارٍ الإرسال...",
    lead_success_toast: "تم بنجاح! تم إرسال الدليل الإرشادي إلى {email}."
  }
};

let currentSiteLanguage = 'de';

function getTranslation(key) {
  const dict = I18N[currentSiteLanguage] || I18N.de;
  return dict[key] || (I18N.de && I18N.de[key]) || key;
}

function initLanguageSwitcher() {
  const toggleButtons = document.querySelectorAll('.lang-opt');
  if (!toggleButtons.length) return;

  function setLanguage(lang) {
    currentSiteLanguage = lang;
    const isAr = lang === 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    if (isAr) {
      document.documentElement.classList.add('lang-ar');
    } else {
      document.documentElement.classList.remove('lang-ar');
    }

    // Update active class on both desktop and mobile toggles
    document.querySelectorAll('.lang-switch-toggle').forEach(container => {
      container.querySelectorAll('.lang-opt').forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    });

    // Translate all elements with data-i18n
    const dict = I18N[lang] || I18N.de;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.innerHTML = dict[key];
      }
    });

    // Translate all placeholders with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // Notify any active funnel to refresh its dynamic buttons and counters
    if (typeof window.refreshFunnelLanguage === 'function') {
      window.refreshFunnelLanguage();
    }

    try {
      localStorage.setItem('jb_coach_lang', lang);
    } catch (e) {}
  }

  toggleButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetLang = btn.getAttribute('data-lang');
      setLanguage(targetLang);
    });
  });

  // Restore preferred language
  try {
    const savedLang = localStorage.getItem('jb_coach_lang');
    if (savedLang && (savedLang === 'ar' || savedLang === 'de')) {
      setLanguage(savedLang);
    }
  } catch (e) {}
}
