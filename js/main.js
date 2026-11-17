/**
 * Dr. Jamal Bouassiria - Coaching & Personal Branding
 * Interactive UI/UX Scripts & Funnel Management
 */

let lenisInstance = null;

function initLenisSmoothScroll() {
  if (typeof Lenis === 'undefined') return;

  try {
    lenisInstance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      smoothTouch: false,
      touchMultiplier: 1.5,
      infinite: false,
    });

    window.lenis = lenisInstance;

    function raf(time) {
      if (lenisInstance) {
        lenisInstance.raf(time);
      }
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  } catch (err) {
    console.warn('Lenis smooth scroll fallback to native:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initLenisSmoothScroll();
  initSiteOpening();
  initScrollPerformanceManager();
  initScrollReveal();
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
  const mobileToggle = document.querySelector('.mobile-menu-btn');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-links a');

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
              <p><strong>${escapeHtml(lblPhone)}:</strong> <span style="color:#60a5fa;">${escapeHtml(bookingData.phone)}</span></p>
              <p><strong>${escapeHtml(lblEmail)}:</strong> <span style="color:#FFFFFF;">${escapeHtml(bookingData.email)}</span></p>
              <p><strong>${escapeHtml(lblSlot)}:</strong> <span style="color:#FFFFFF;">${escapeHtml(bookingData.slot)}</span> (${escapeHtml(lblLang)}: <span style="color:#60a5fa;">${escapeHtml(bookingData.language)}</span>)</p>
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
  if (window.lenis) {
    window.lenis.stop();
  }
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
  if (window.lenis) {
    window.lenis.start();
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function (m) {
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
    ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

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
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;

        if (window.lenis) {
          window.lenis.scrollTo(targetElement, {
            offset: -headerOffset,
            duration: 1.2
          });
        } else {
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
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

function initScrollPerformanceManager() {
  const header = document.querySelector('.header-nav');
  const bar = document.getElementById('scrollProgressBar');
  const backToTopBtn = document.getElementById('backToTopBtn');

  let ticking = false;
  let cachedDocHeight = 0;

  const updateCachedHeight = () => {
    cachedDocHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  };
  updateCachedHeight();
  window.addEventListener('resize', updateCachedHeight, { passive: true });
  window.addEventListener('load', updateCachedHeight, { passive: true });

  const onScrollTick = () => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    // 1. Sticky header visibility transition
    if (header) {
      if (scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // 2. Scroll progress bar update (GPU-accelerated scaleX)
    if (bar) {
      const scrollPercent = cachedDocHeight > 0 ? (scrollY / cachedDocHeight) : 0;
      bar.style.transform = `scaleX(${Math.min(Math.max(scrollPercent, 0), 1)})`;
    }

    // 3. Floating back-to-top button
    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(onScrollTick);
      ticking = true;
    }
  };

  if (window.lenis) {
    window.lenis.on('scroll', requestTick);
  }
  window.addEventListener('scroll', requestTick, { passive: true });
  onScrollTick();

  // Back to top click handler with Lenis support
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.lenis) {
        window.lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }
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
    threshold: 0.02,
    rootMargin: '0px 0px 80px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   BILINGUAL LANGUAGE TOGGLE SYSTEM (DE / AR)
   ========================================================================== */
const I18N = {
  de: {
    // 1. Navigation
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

    // 1. Hero-Bereich (PDF Abschnitt 1)
    hero_kicker: "Seit 2008 an der Seite von Menschen mit Migrationsgeschichte in Deutschland",
    hero_title: 'Du bist nach Deutschland gekommen, um etwas aufzubauen. <span class="gold-gradient-text">Nicht, um klein zu bleiben.</span>',
    hero_sub: 'Ich bin Dr. Jamal Bouassiria – aufgewachsen in Marokko, ohne perfektes Deutsch und ohne Netzwerk nach Deutschland gekommen. Heute helfe ich Migrantinnen und Migranten, aus eigener Kraft ein erfolgreiches Unternehmen aufzubauen. 1:1, ehrlich, und ohne leere Versprechen.',
    hero_cta: "Jetzt kostenloses Erstgespräch sichern",
    hero_about: "Meine Geschichte ansehen ↓",
    hero_guarantee: "100% vertraulich · Erstberatung auf Deutsch oder Arabisch",
    trust_1: "Über 7.000 Menschen beraten",
    trust_2: "20+ Jahre Erfahrung",
    trust_3: "Ausgezeichnet mit 4+ internationalen Auszeichnungen",
    hero_portals_title: "Unsere Webseiten & Projekte:",
    hero_portal_books: "Meine Bücher",
    hero_portal_choose: "Portal auswählen...",
    hero_portal_visit: "Besuchen ↗",

    // 2. Das Problem (PDF Abschnitt 2)
    problem_tag: "Das Problem (Identifikation schaffen)",
    problem_title: "Du kennst das vielleicht selbst",
    problem_cat_1: "SPRACHE & SICHTBARKEIT",
    problem_cat_2: "FAMILIE & VORBILDER",
    problem_cat_3: "NETZWERK & TÜREN",
    problem_cat_4: "STRUKTUR & BUSINESS",
    problem_cat_5: "CHANCEN & MINDSET",
    problem_1: "Du sprichst nicht perfekt Deutsch – und traust dich deshalb nicht, sichtbar zu werden.",
    problem_2: "Deine Familie kann dir bei geschäftlichen Fragen nicht weiterhelfen, weil sie selbst nie ein Unternehmen aufgebaut hat.",
    problem_3: "Du hast kein Netzwerk in Deutschland, das dir Türen öffnet.",
    problem_4: "Du hast eine Idee oder ein Talent – aber niemand hat dir gezeigt, wie man daraus wirklich ein Business macht.",
    problem_5: "Du hast schon einmal gedacht: „Für Leute wie mich ist das hier einfach schwerer.“",
    problem_res_title: "Das stimmt. Und trotzdem ist es möglich.",
    problem_res_text: "Ich bin der Beweis dafür – und in den letzten 20+ Jahren habe ich Tausenden Menschen mit genau diesem Startpunkt geholfen, den Weg zu gehen.",
    problem_res_cta: "Unverbindliches Erstgespräch buchen",
    problem_perspective: "DIE PERSPEKTIVE",

    // 3. Vorstellung: Wer ist Jamal Bouassiria (PDF Abschnitt 3)
    about_portrait_role: "Gründer, Publizist & Mentor",
    about_badge_exp: "Promotion Universität Bremen",
    about_tag: "Vorstellung",
    about_title: "Mein Name ist Dr. Jamal Bouassiria",
    about_roles: "Politikwissenschaftler · Journalist · Online- & PR-Unternehmer",
    about_bio_1: "Ich bin in Marokko aufgewachsen und kam nach dem Abitur nach Deutschland, um Politikwissenschaft zu studieren – ohne familiäres Sicherheitsnetz, ohne Kontakte, mit einer Sprache, die ich mir erst erarbeiten musste.",
    about_bio_2: "Während meiner Promotion an der Universität Bremen zum Thema Migration entdeckte ich meine Leidenschaft für den Online-Journalismus. Daraus entstand mein eigenes deutsch-arabisches Nachrichtenportal, das bis heute eine Brücke zwischen Deutschland und Afrika schlägt.",
    about_bio_3: "2016 gründete ich meine Agentur <strong>Afripa Media Service</strong>. Seitdem berate ich Privatpersonen, Unternehmer:innen, aber auch Politiker und Verwaltungen in Deutschland und Marokko in den Bereichen Online-Marketing, Öffentlichkeitsarbeit und digitale Sichtbarkeit.",
    about_bio_4: "Was mich antreibt: Ich habe selbst erlebt, wie es ist, in diesem Land bei null anzufangen. Deshalb ist mein Coaching kein theoretisches Konzept aus dem Lehrbuch – es basiert auf dem, was bei mir und bei hunderten meiner Klient:innen tatsächlich funktioniert hat.",
    about_quote: "Erst machen, dann verbessern. Denn Perfektionismus und das Wort 'irgendwann' lähmen nur.",
    about_btn_talk: "Direkt mit Dr. Jamal sprechen",
    about_btn_more: "Mehr über meinen Werdegang erfahren",
    about_media_badge_books: "Publikationen & Bücher",
    about_media_title_books: "Autor & Magazin-Herausgeber",
    about_media_desc_books: "Dr. Jamal Bouassiria ist Herausgeber der renommierten Zeitschrift <em>„مجلة نجاح“</em> und Verfasser praxisnaher Ratgeber für Gründer und Migranten in Deutschland.",
    about_media_btn_books: "📚 Meine Bücher entdecken ↗",
    about_media_badge_studio: "Medien & Reichweite",
    about_media_title_studio: "Eigenes Medienstudio & Video-PR",
    about_media_desc_studio: "Mit eigener TV- und Medienproduktion (GAI Africa TV, Afripa Media Service) vermittelt Dr. Jamal fundiertes Know-how für digitale Sichtbarkeit und professionelle Positionierung.",
    about_media_tag_studio: "Professionelle PR- & Studio-Expertise",

    // 4. Die Methode (PDF Abschnitt 4)
    methode_tag: "Die Methode",
    methode_title: "Zwei einfache Prinzipien,",
    methode_title_gold: "die alles verändern",
    methode_desc: "Erfolg in der Selbstständigkeit ist keine Frage von endlosem Grübeln. Er basiert auf klaren, funktionierenden Grundsätzen:",
    methode_card1_title: "1. Das Pareto-Prinzip",
    methode_principle_1: "Prinzip 01 · Fokus",
    methode_card1_desc: "Konzentriere dich auf die 20 % deiner Handlungen, die 80 % deines Ergebnisses bringen – statt dich in Nebensächlichkeiten zu verlieren.",
    methode_card1_pill: "80% Resultate durch 20% Hebel",
    methode_card2_title: "2. Machen statt warten",
    methode_principle_2: "Prinzip 02 · Umsetzung",
    methode_card2_desc: "Perfektionismus ist der größte Bremser für Migrant:innen, die neu durchstarten wollen. Wer wartet, bis alles perfekt ist, fängt nie an. Wer anfängt und unterwegs verbessert, kommt an.",
    methode_card2_pill: "Geschwindigkeit schlägt Perfektion",

    // 5. Was du durch das 1:1-Coaching erreichst (PDF Abschnitt 5)
    benefits_tag: "Was du durch das 1:1-Coaching erreichst",
    benefits_title: "Gemeinsam lernen",
    benefits_title_gold: "und wachsen",
    benefits_desc: "Gemeinsam bringen wir deine Vision aus dem Kopf in ein handfestes, profitables und rechtssicheres Business in Deutschland:",
    benefit_pillar_1: "Säule 01 · Online-Präsenz",
    benefit_title_1: "Deine Online-Präsenz aufbauen",
    benefit_desc_1: "Webseite, Shop, Logo und Design, damit du von Anfang an professionell auftrittst.",
    benefit_item_1_1: "Webseite & Shop von Grund auf",
    benefit_item_1_2: "Logo und Corporate Design",
    benefit_item_1_3: "Professioneller Auftritt von Anfang an",
    benefit_tag_1: "Digitale Souveränität",
    benefit_pillar_2: "Säule 02 · Sichtbarkeit",
    benefit_title_2: "Sichtbar werden mit der richtigen Werbung",
    benefit_desc_2: "In neuen und klassischen Medien, um mehr Umsatz und Gewinn zu erzielen.",
    benefit_item_2_1: "Gezielte Online- & Social-Media-Werbung",
    benefit_item_2_2: "Platzierungen in klassischen Medien & Presse",
    benefit_item_2_3: "Planbar mehr Umsatz und Gewinn",
    benefit_tag_2: "Messbares Wachstum",
    benefit_pillar_3: "Säule 03 · Personal Branding",
    benefit_title_3: "Dein Personal Branding aufbauen",
    benefit_desc_3: "Mit meiner jahrelangen Erfahrung im Umgang mit Medien und Prominenten.",
    benefit_item_3_1: "Unverwechselbare Experten-Positionierung",
    benefit_item_3_2: "Umgang mit Medien & Prominenten",
    benefit_item_3_3: "Glaubwürdigkeit und Autorität im Markt",
    benefit_tag_3: "Starke Marke",

    // 6. Was dich im Coaching konkret erwartet (PDF Abschnitt 6)
    inhalte_tag: "Was dich im Coaching konkret erwartet",
    inhalte_title: "Schritt für Schritt",
    inhalte_title_gold: "zum eigenen Business",
    inhalte_desc: "Ich biete Workshops, Seminare und 1:1-Beratung in deutscher und arabischer Sprache an – zu folgenden Themen:",
    mod_tag_1: "THEMA 01",
    mod_1: "Projektmanagement",
    mod_tag_2: "THEMA 02",
    mod_2: "Persönlichkeitsentwicklung",
    mod_tag_3: "THEMA 03",
    mod_3: "Erfolgreiches Markenaufbau (Branding)",
    mod_tag_4: "THEMA 04",
    mod_4: "Dein Unternehmen gründen",
    mod_tag_5: "THEMA 05",
    mod_5: "Journalistische Weiterbildung & Online-PR<span class=\"module-name-sub\">Medien, Presse & echte Aufmerksamkeit</span>",
    mod_tag_6: "THEMA 06",
    mod_6: "Webseiten-Entwicklung, Werbetexte und Online-Verkauf",
    takeaway_badge: "FÜR DEINE PRAXIS",
    takeaway_title: "Das nimmst du konkret mit:",
    takeaway_1: "Du lernst Schritt für Schritt ein Online-System kennen, mit dem du finanziell unabhängiger wirst.",
    takeaway_2: "Du verstehst, wie erfolgreiche Unternehmen Presse- und Öffentlichkeitsarbeit im Internet nutzen.",
    takeaway_3: "Du bekommst regelmäßig kostenlose, praxisnahe Tipps direkt per E-Mail.",
    takeaway_4: "Du lernst, deine Zeit und Energie auf das zu konzentrieren, was wirklich zählt.",
    guarantee_badge_de: "100% Praxiserprobt in Deutschland",
    transparency_role: "Mentor, Publizist & Executive Coach",
    cta_consultation: "Unverbindliches Erstgespräch buchen",
    transparency_label: "Wichtig zu wissen:",
    transparency_quote: "\"Mein Coaching ist nicht fürs schnelle Reichwerden gedacht. Aber die finanzielle Freiheit, nicht mehr für einen Chef acht Stunden am Tag arbeiten zu müssen, ist das Ziel, auf das wir gemeinsam hinarbeiten – durch Arbeit, Klarheit und die richtige Strategie, nicht über Nacht.\"",
    transparency_cta: "Jetzt kostenlos zum Newsletter anmelden",

    // 7. Warum ein eigenes Business – 7 gute Gründe (PDF Abschnitt 7)
    reasons_tag: "7 GUTE GRÜNDE",
    reasons_title: "Diese 7 Vorteile",
    reasons_title_gold: "bringt dir dein eigenes Business",
    reasons_desc: "Warum es sich lohnt, jetzt den ersten Schritt zu machen und dein eigenes Business aufzubauen:",
    reason_tag_1: "VORTEIL 01",
    reason_title_1: "Du machst dein Wissen und deine Fähigkeiten zu Geld.",
    reason_desc_1: "Verwandle dein Können und deine Erfahrung in ein profitables, nachhaltiges Angebot auf dem Markt.",
    reason_tag_2: "VORTEIL 02",
    reason_title_2: "Du hilfst mit deinem Business anderen Menschen.",
    reason_desc_2: "Löse echte Probleme für deine Kunden und schaffe echten, spürbaren Mehrwert.",
    reason_tag_3: "VORTEIL 03",
    reason_title_3: "Du gewinnst automatisch neue Kunden statt sie mühsam suchen zu müssen.",
    reason_desc_3: "Durch funktionierende Positionierung und Online-Kanäle kommen Kunden verlässlich zu dir.",
    reason_tag_4: "VORTEIL 04",
    reason_title_4: "Du steigerst deine Einnahmen spürbar.",
    reason_desc_4: "Kein Arbeitgeber begrenzt dein Einkommen – dein Erfolg wächst direkt mit deinem Einsatz.",
    reason_tag_5: "VORTEIL 05",
    reason_title_5: "Du gewinnst echte Freiheit – zeitlich und finanziell.",
    reason_desc_5: "Bestimme selbst über deinen Kalender, deinen Arbeitsort und deine finanzielle Zukunft.",
    reason_tag_6: "VORTEIL 06",
    reason_title_6: "Du entdeckst und nutzt dein volles Potenzial.",
    reason_desc_6: "Wachse über alte Begrenzungen hinaus und baue ein Unternehmen auf, auf das du stolz bist.",
    reason_tag_7: "VORTEIL 07 · HERZSTÜCK",
    reason_title_7: "Du hast mehr Zeit für das, was zählt:",
    reason_title_7_gold: "deine Familie",
    reason_desc_7: "Echte Freiheit und finanzielle Souveränität bedeuten am Ende vor allem mehr wertvolle Zeit mit deiner Familie.",
    signature_sub_badge: "★ Das wahre Fundament jedes Erfolgs",
    chip_time_autonomy: "Zeitliche Souveränität",
    chip_family_presence: "Familiäre Präsenz",
    chip_quality_life: "Lebensqualität in Deutschland",

    // 8. Meine Fachgebiete (PDF Abschnitt 8)
    fach_tag: "Meine Fachgebiete",
    fach_title: "Wobei ich dir",
    fach_title_gold: "konkret helfe",
    fach_desc: "Erprobte Expertise aus über zwei Jahrzehnten Medien- und Unternehmenserfahrung:",
    fach_b1: "Beratung",
    fach_t1: "Beratung für Privatpersonen, Unternehmen und Organisationen",
    fach_d1: "Als Politikwissenschaftler mit Promotion im Bereich Migration und als Unternehmer im Online-Marketing verbinde ich theoretisches Wissen mit praktischer Erfahrung – gesammelt u. a. in der Beratung von Politikern und Institutionen in Marokko und Deutschland.",
    fach_f1_1: "Theoretisches Wissen & praktische Erfahrung vereint",
    fach_f1_2: "Beratung von Politikern und Institutionen",
    fach_f1_3: "Fundierte Expertise für Marokko und Deutschland",
    fach_foot_1: "Individuell & Strategisch",
    fach_b2: "Zweisprachig (DE / AR)",
    fach_t2: "Workshops, Seminare & Vorträge",
    fach_d2: "Auf Deutsch und Arabisch, zu Projektmanagement, Kommunikation, Persönlichkeitsentwicklung, Journalismus und Online-Business.",
    fach_f2_1: "Workshops auf Deutsch und Arabisch",
    fach_f2_2: "Projektmanagement & Kommunikation",
    fach_f2_3: "Persönlichkeitsentwicklung & Journalismus",
    fach_foot_2: "Bikulturelle Kompetenz",
    fach_b3: "Prominente & Reichweite",
    fach_t3: "Werbung mit Prominenten",
    fach_d3: "Durch Influencer-Marketing – unter anderem mit dem brasilianischen Fußball-Star Ailton – helfe ich dir, mehr Reichweite und mehr Kunden zu gewinnen. Ich spreche dabei aus eigener Praxis, denn ich betreibe selbst mehrere Online- und Offline-Geschäfte.",
    fach_f3_1: "Influencer-Marketing mit Fußball-Star Ailton",
    fach_f3_2: "Mehr Reichweite und neue Kunden gewinnen",
    fach_f3_3: "Erfahrung aus eigenen Online- und Offline-Geschäften",
    fach_foot_3: "Hohe Glaubwürdigkeit",
    fach_b4: "Digitale Sichtbarkeit",
    fach_t4: "Digitale Sichtbarkeit für Selbstständige, Lehrende & Institutionen",
    fach_d4: "Von Google- und Social-Media-Werbung über suchmaschinenoptimierte Webseiten bis zur professionellen Social-Media-Betreuung – für einen starken Auftritt in den Medien.",
    fach_f4_1: "Google- und Social-Media-Werbekampagnen",
    fach_f4_2: "Suchmaschinenoptimierte Webseiten (SEO)",
    fach_f4_3: "Professionelle Social-Media-Betreuung",
    fach_foot_4: "Messbare Medienpräsenz",

    // 9. Zahlen, die für sich sprechen (PDF Abschnitt 9)
    kpi_section_title: "Meine Erfahrung in Zahlen",
    kpi_1: "Kunden insgesamt beraten",
    kpi_2: "Jahre Erfahrung",
    kpi_3: "Erfolge gemeinsam mit Kunden",
    kpi_4: "Internationale Auszeichnungen",

    // 10. Ablauf: So läuft die Zusammenarbeit ab (PDF Abschnitt 10)
    step_tag: "Ablauf der Zusammenarbeit",
    step_title: "In 3 Schritten zu deinem eigenen Business",
    step_title_part1: "In 3 Schritten",
    step_title_part2: "zu deinem eigenen Business",
    step_desc: "So läuft die Zusammenarbeit ab:",
    step_pill_1: "Schritt 1",
    step_t1: "Kostenloses Erstgespräch",
    step_d1: "Wir lernen uns kennen, du erzählst mir von deiner Situation und deinem Ziel, und ich zeige dir ehrlich, ob und wie ich dir helfen kann.",
    step_badge_1: "100% unverbindlich & diskret",
    step_pill_2: "Schritt 2",
    step_t2: "Dein individueller Fahrplan",
    step_d2: "Gemeinsam mit mir und meinem Team entwickeln wir eine Strategie, die zu deiner Ausgangslage passt – egal ob du bei null startest oder schon erste Schritte gegangen bist. Du hast damit nicht nur mich, sondern ein ganzes Team hinter dir.",
    step_badge_2: "Maßgeschneidert auf deine Stärken",
    step_pill_3: "Schritt 3",
    step_t3: "Umsetzung mit 1:1-Begleitung",
    step_d3: "Du setzt um, ich begleite dich eng – mit klaren Aufgaben, ehrlichem Feedback und den Methoden, die sich in der Praxis bewährt haben.",
    step_badge_3: "Direkte Praxisbegleitung",
    step_cta: "Jetzt Platz im Erstgespräch sichern",

    // 11. Stimmen unserer Kund:innen (PDF Abschnitt 11)
    testi_tag: "Stimmen unserer Kund:innen",
    testi_title: "Das sagen Klient:innen über die Zusammenarbeit",
    testi_title_part1: "Das sagen Klient:innen",
    testi_title_part2: "über die Zusammenarbeit",
    testi_desc: "Echte Erfahrungen von Menschen mit Migrationsgeschichte, die den Schritt gewagt haben und heute florierende Unternehmen führen:",
    testi_verified: "Verifizierte Fallstudie",
    testi_b1: "6-stelliger Umsatz nach 12 Monaten",
    testi_q1: "\"Ich dachte, mein Akzent wäre ein Hindernis für den deutschen Markt. Dr. Jamal hat mir gezeigt, dass meine Geschichte meine größte Stärke ist. Heute beliefern wir Kunden in ganz Deutschland.\"",
    testi_r1: "E-Commerce & Handel",
    testi_name_1: "Tariq El-Mansouri",
    testi_loc_1: "Frankfurt am Main",
    testi_b2: "B2B Kundenstamm etabliert",
    testi_q2: "\"Durch das 1:1-Coaching und die Medienarbeit mit Dr. Jamal habe ich eine Marke aufgebaut, die sofort Vertrauen bei institutionellen Kunden und Unternehmen schafft.\"",
    testi_r2: "Beratung & Sprache",
    testi_name_2: "Amina Benali",
    testi_loc_2: "Düsseldorf",
    testi_b3: "Meisterbetrieb ausgebaut",
    testi_q3: "\"Das Pareto-Prinzip war der Gamechanger. Dr. Jamal hat mein Marketing und meine Abläufe optimiert. Jetzt habe ich volle Auftragsbücher und endlich wieder Zeit für meine Familie.\"",
    testi_r3: "Gebäudetechnik Meister",
    testi_name_3: "Karim Al-Sayed",
    testi_loc_3: "Bremen",
    testi_read_case: "Fallstudie ansehen",

    // 12. Häufige Fragen (FAQ) (PDF Abschnitt 12)
    faq_tag: "Häufige Fragen",
    faq_title: "Häufig gestellte Fragen",
    faq_title_part1: "Häufig gestellte",
    faq_title_part2: "Fragen",
    faq_desc: "Alles, was du vor deiner kostenlosen Erstberatung wissen musst:",
    faq_q1: "Für wen ist dieses Coaching geeignet?",
    faq_a1: "Für Migrant:innen in Deutschland, die ein eigenes Business aufbauen oder ihr bestehendes Geschäft sichtbarer machen wollen – unabhängig vom Sprachniveau oder vom bisherigen Wissensstand.",
    faq_q2: "Muss ich schon eine Geschäftsidee haben?",
    faq_a2: "Nein. Viele meiner Klient:innen entdecken ihr \"verstecktes Expertenwissen\" erst gemeinsam mit mir im Coaching.",
    faq_q3: "In welcher Sprache findet das Coaching statt?",
    faq_a3: "Auf <strong>Deutsch und auf Arabisch</strong> – je nachdem, was für dich angenehmer ist.",
    faq_q4: "Wie schnell kann ich mit Ergebnissen rechnen?",
    faq_a4: "Das hängt von deinem Einsatz ab. Ich verspreche keine Wunder über Nacht – aber mit der richtigen Strategie und konsequenter Umsetzung sind spürbare Fortschritte innerhalb weniger Monate realistisch.",
    faq_q5: "Wie geht es nach der Anmeldung weiter?",
    faq_a5: "Du bekommst zeitnah einen Termin für ein kostenloses Erstgespräch, in dem wir deine Situation und deine Ziele besprechen.",
    faq_support_badge: "✦ SUPPORT & ORIENTIERUNG",
    faq_support_title: "Noch eine persönliche Frage offen geblieben?",
    faq_support_desc: "Besprich deine individuellen Fragen und deine Ausgangslage direkt im vertraulichen 1:1 Erstgespräch.",
    faq_support_btn: "Jetzt Erstgespräch vereinbaren",

    // 13. Abschluss-CTA (vor dem Footer) (PDF Abschnitt 13)
    final_kicker: "Bereit für deinen nächsten Schritt?",
    final_title: 'Bereit, aus deiner Geschichte <span class="gold-gradient-text">deinen Erfolg</span> zu machen?',
    final_sub: "Du musst nicht perfekt Deutsch sprechen. Du brauchst kein Netzwerk, das dir alles vorgibt. Du brauchst einen ersten Schritt – und jemanden, der dir zeigt, wie es wirklich geht.",
    final_btn_book: "Jetzt kostenloses Erstgespräch vereinbaren",
    final_btn_ebook: "Kostenloses E-Book herunterladen",

    // 14. Footer (PDF Abschnitt 14)
    footer_quote: "„Wenn du schon sagst: 'Ich schaffe das nicht', dann wirst du es nicht schaffen. Aber wenn du dich fragst: 'Wie kann ich es doch schaffen?' – dann hast du schon 80 % geschafft. Den Rest musst du nur noch tun.“",
    footer_quote_author: "— Jamal Bouassiria",
    footer_brand_desc: "1:1 Business Coaching und Mentoring für Migrantinnen und Migranten in Deutschland. Dr. Jamal Bouassiria begleitet dich auf Deutsch und Arabisch zum erfolgreichen Unternehmen.",
    footer_contact_h: "Kontakt",
    footer_nav_h: "Navigation",
    footer_websites_h: "Unsere Webseiten",
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
    // 1. Navigation
    nav_about: "عن د. جمال",
    nav_method: "المنهجية",
    nav_content: "محتوى التدريب",
    nav_stories: "قصص النجاح",
    nav_faq: "أسئلة شائعة",
    nav_cta: "احجز جلستك",
    drawer_lang_label: "Sprache / اللغة",
    mob_problem: "التحدي والحل",
    mob_reasons: "7 مزايا للبرنامج",
    mob_expertise: "مجالات الخبرة",
    mob_steps: "في 3 خطوات",
    mob_drawer_cta: "احجز جلستك الاستشارية المجانية",

    // 1. Hero
    hero_kicker: "منذ عام 2008 إلى جانب المهاجرين ورواد الأعمال في ألمانيا",
    hero_title: 'جئت إلى ألمانيا لتبني مشروعاً حقيقياً. <span class="gold-gradient-text">وليس لتبقى صغيراً.</span>',
    hero_sub: 'أنا د. جمال بوعسيرية – نشأت في المغرب وجئت إلى ألمانيا دون ألمانية مثالية ودون شبكة علاقات. اليوم أساعد المهاجرات والمهاجرين على بناء مشاريع ناجحة ومربحة بقوتهم الذاتية. مرافقة 1:1، صادقة ودون وعود وهمية.',
    hero_cta: "احجز جلستك الاستشارية المجانية الآن",
    hero_about: "تعرف على قصتي ↓",
    hero_guarantee: "سرية تامة 100% · استشارة أولية باللغة الألمانية أو العربية",
    trust_1: "استشارة أكثر من 7000 شخص",
    trust_2: "أكثر من 20 عاماً خبرة",
    trust_3: "حائز على أكثر من 4 جوائز دولية",
    hero_portals_title: "مواقعنا ومشاريعنا الرسمية:",
    hero_portal_books: "كتبي ومؤلفاتي",
    hero_portal_choose: "اختر موقعاً للزيارة...",
    hero_portal_visit: "زيارة الموقع ↗",

    // 2. Das Problem
    problem_tag: "المشكلة والواقع (خلق التطابق)",
    problem_title: "ربما تعرف هذا الواقع بنفسك",
    problem_cat_1: "اللغة والظهور المهني",
    problem_cat_2: "العائلة والقدوة التجارية",
    problem_cat_3: "شبكة العلاقات وفتح الأبواب",
    problem_cat_4: "هيكلة الفكرة وتحويلها لمشروع",
    problem_cat_5: "العقلية وتجاوز الحواجز",
    problem_1: "لا تتحدث الألمانية بشكل مثالي – ولذلك تتردد في الظهور والانطلاق.",
    problem_2: "عائلتك لا تستطيع مساعدتك في الأسئلة التجارية لأنها لم تؤسس شركة من قبل.",
    problem_3: "ليس لديك شبكة علاقات ومعارف في ألمانيا تفتح لك الأبواب.",
    problem_4: "لديك فكرة أو موهبة – لكن لم يسبق لأحد أن علّمك كيف تحولها حقاً إلى مشروع تجاري.",
    problem_5: "فكرت من قبل: «بالنسبة لأشخاص مثلي، الأمر هنا ببساطة أصعب».",
    problem_res_title: "هذا صحيح. ورغم ذلك، النجاح ممكن تماماً.",
    problem_res_text: "أنا الدليل الحي على ذلك – وعلى مدار أكثر من 20 عاماً ساعدت آلاف الأشخاص الذين انطلقوا من نفس نقطة بدايتك للوصول إلى أهدافهم.",
    problem_res_cta: "احجز جلستك الاستشارية غير الملزمة",
    problem_perspective: "المنظور والحل",

    // 3. Vorstellung: Wer ist Jamal Bouassiria
    about_portrait_role: "مؤسس، كاتب ومستشار أعمال",
    about_badge_exp: "دكتوراه من جامعة بريمن",
    about_tag: "التعريف بالمرشد",
    about_title: "اسمي د. جمال بوعسيرية",
    about_roles: "عالم سياسي · صحفي · رائد أعمال في الإعلام الرقمي والعلاقات العامة",
    about_bio_1: "نشأت في المغرب وجئت إلى ألمانيا بعد البكالوريا لدراسة العلوم السياسية – دون شبكة أمان عائلية، دون معارف، وبلغة كان عليّ تعلمها وبناؤها من الصفر.",
    about_bio_2: "خلال دراستي للدكتوراه في جامعة بريمن حول قضايا الهجرة، اكتشفت شغفي بالإعلام الرقمي. ومن هناك أطلقت بوابتي الإخبارية الألمانية-العربية التي تشكل حتى اليوم جسراً إعلامياً بين ألمانيا والقارة الأفريقية.",
    about_bio_3: "في عام 2016، أسست وكالتي <strong>Afripa Media Service</strong>. ومنذ ذلك الحين أقدم الاستشارات لرواد الأعمال، الشخصيات العامة، وصنّاع القرار في ألمانيا والمغرب في مجالات التسويق الرقمي، العلاقات العامة وبناء الحضور المؤسسي.",
    about_bio_4: "ما يحفزني: لقد عشت بنفسي تجربة البدء من الصفر في هذا البلد. ولهذا فإن تدريبي ليس نظريات كتب – بل مبني على ما أثبت نجاحه واقعياً معي ومع مئات من المتدربين لدي.",
    about_quote: "ابدأ أولاً، ثم حسّن وطوّر. لأن السعي للكمال الزائف وكلمة 'يوماً ما' هما أكبر معطّل للنجاح.",
    about_btn_talk: "تحدث مباشرة مع د. جمال",
    about_btn_more: "تعرف على مسيرتي وخبرتي",
    about_media_badge_books: "منشورات ومؤلفات",
    about_media_title_books: "مؤلف وناشر مجلة",
    about_media_desc_books: "د. جمال بوعسيرية هو ناشر المجلة المرموقة <em>«مجلة نجاح»</em> ومؤلف أدلة عملية لرواد الأعمال والمهاجرين في ألمانيا.",
    about_media_btn_books: "📚 اكتشف كتبي ومؤلفاتي ↗",
    about_media_badge_studio: "إعلام وانتشار رقمي",
    about_media_title_studio: "استوديو إعلامي وإنتاج مرئي خاص",
    about_media_desc_studio: "من خلال إنتاجه التلفزيوني والإعلامي الخاص (GAI Africa TV وAfripa Media Service)، يقدم د. جمال خبرة عميقة في الظهور الرقمي وبناء الحضور الاحترافي.",
    about_media_tag_studio: "خبرة احترافية في العلاقات العامة والاستوديو",

    // 4. Die Methode
    methode_tag: "المنهجية المتبعة",
    methode_title: "مبدآن جوهريان",
    methode_title_gold: "يغيّران كل شيء",
    methode_desc: "النجاح في العمل الحر لا يحتاج إلى تردد طويل، بل يعتمد على أسس واضحة ومجرّبة:",
    methode_card1_title: "1. مبدأ باريتو (80 / 20)",
    methode_principle_1: "المبدأ 01 · التركيز",
    methode_card1_desc: "ركّز طاقتك على 20% من الخطوات الاستراتيجية التي تحقق 80% من نتائجك وأرباحك – دون تضييع الوقت في تفاصيل هامشية.",
    methode_card1_pill: "80% من النتائج من 20% من الجهد المركزي",
    methode_card2_title: "2. البدء والتنفيذ بدل الانتظار",
    methode_principle_2: "المبدأ 02 · التنفيذ",
    methode_card2_desc: "السعي للكمال الزائف هو أكبر عائق أمام رواد الأعمال الجدد. من ينتظر حتى يصبح كل شيء مثالياً لن يبدأ أبداً. من ينطلق ويطوّر في الميدان يصل للقمة.",
    methode_card2_pill: "سرعة التنفيذ والتطوير تتفوق على الانتظار",

    // 5. Was du erreichst
    benefits_tag: "ما ستحققه من خلال التدريب الفردي 1:1",
    benefits_title: "نتعلم وننمو معاً",
    benefits_title_gold: "خطوة بخطوة",
    benefits_desc: "نحوّل رؤيتك وفكرتك إلى شركة حقيقية، مربحة وقانونية 100% في ألمانيا:",
    benefit_pillar_1: "الركيزة 01 · الحضور الرقمي",
    benefit_title_1: "بناء حضورك الرقمي المتكامل",
    benefit_desc_1: "موقع إلكتروني، متجر، هوية بصرية وتصميم احترافي يمنح مشروعك مصداقية فورية من اليوم الأول.",
    benefit_item_1_1: "موقع احترافي وتصميم عالي المصداقية",
    benefit_item_1_2: "إعداد المتجر الإلكتروني والدفع الرقمي",
    benefit_item_1_3: "مظهر مؤسسي موثوق منذ اليوم الأول",
    benefit_tag_1: "السيادة الرقمية",
    benefit_pillar_2: "الركيزة 02 · الوصول والعملاء",
    benefit_title_2: "الظهور التسويقي واستقطاب العملاء",
    benefit_desc_2: "حملات إعلانية دقيقة واستراتيجيات تسويق موجهة في الوسائط الرقمية والتقليدية لمضاعفة المبيعات والأرباح.",
    benefit_item_2_1: "إعلانات مستهدفة في الوسائط الرقمية والتقليدية",
    benefit_item_2_2: "ظهور إعلامي وعلاقات عامة موجهة",
    benefit_item_2_3: "تدفق منتظم ومدروس للعملاء والمبيعات",
    benefit_tag_2: "نمو قابل للقياس",
    benefit_pillar_3: "الركيزة 03 · البراندينغ الشخصي",
    benefit_title_3: "بناء علامتك الشخصية (Personal Branding)",
    benefit_desc_3: "استثمار سنوات خبرة د. جمال في التعامل مع وسائل الإعلام والمشاهير وصنّاع القرار لترسيخ مكانتك كخبير موثوق.",
    benefit_item_3_1: "تموضع قوي كخبير موثوق ومطلوب",
    benefit_item_3_2: "خبرة واسعة في الإعلام والشخصيات العامة",
    benefit_item_3_3: "مصداقية عالية ومكانة رائدة في مجالك",
    benefit_tag_3: "علامة تجارية بارزة",

    // 6. Was dich konkret erwartet
    inhalte_tag: "ما ينتظرك عملياً في البرنامج",
    inhalte_title: "خطوة بخطوة",
    inhalte_title_gold: "نحو شركتك المستقلة",
    inhalte_desc: "أقدم ورشات عمل، ندوات تدريبية واستشارات فردية 1:1 باللغتين الألمانية والعربية – حول المحاور التالية:",
    mod_tag_1: "المحور 01",
    mod_1: "إدارة المشاريع والتخطيط",
    mod_tag_2: "المحور 02",
    mod_2: "تطوير الشخصية والقيادة",
    mod_tag_3: "المحور 03",
    mod_3: "بناء العلامة التجارية وصناعة الهوية (Branding)",
    mod_tag_4: "المحور 04",
    mod_4: "تأسيس شركتك وإجراءات الانطلاق",
    mod_tag_5: "المحور 05",
    mod_5: "التدريب الصحفي والعلاقات العامة الرقمية<span class=\"module-name-sub\">الصحف، الإعلام واكتساب اهتمام حقيقي</span>",
    mod_tag_6: "المحور 06",
    mod_6: "تطوير المواقع، كتابة الإعلانات والبيع الرقمي",
    takeaway_badge: "عوائد عملية فورية",
    takeaway_title: "ما ستكتسبه وتطبقه عملياً:",
    takeaway_1: "تتعلم خطوة بخطوة نظاماً إلكترونياً مجرّباً للوصول إلى الاستقلال المالي.",
    takeaway_2: "تكتشف كيف تستخدم الشركات الناجحة الصحافة والعلاقات العامة الرقمية.",
    takeaway_3: "تحصل بانتظام على نصائح وإرشادات تطبيقية مباشرة عبر بريدك الإلكتروني.",
    takeaway_4: "تتعلم تركيز وقتك وطاقتك على ما يصنع الفارق الحقيقي فقط.",
    guarantee_badge_de: "مجرّب عملياً 100% في ألمانيا",
    transparency_role: "مرشد أعمال، كاتب صحفي ومدرّب تنفيذي",
    cta_consultation: "احجز استشارتك المجانية الأولى",
    transparency_label: "مهم جداً أن تعرف:",
    transparency_quote: "\"برنامجي التدريبي ليس وسيلة للثراء السريع الزائف. لكن الوصول إلى الحرية المالية والاستقلال عن العمل الوظيفي اليومي هو الهدف الذي نعمل معاً لتحقيقه – بالعمل الواضح والاستراتيجية الصحيحة، وليس بين ليلة وضحاها.\"",
    transparency_cta: "اشترك مجاناً في القائمة البريدية الآن",

    // 7. Warum ein eigenes Business
    reasons_tag: "7 أسباب حقيقية",
    reasons_title: "هذه المزايا السبع",
    reasons_title_gold: "يحققها لك مشروعك الخاص",
    reasons_desc: "لماذا يستحق الأمر أن تبدأ اليوم في تأسيس شركتك المستقلة في ألمانيا:",
    reason_tag_1: "الميزة 01",
    reason_title_1: "تحوّل معرفتك ومواهبك إلى دخل مالي حقيقي.",
    reason_desc_1: "استثمر خبراتك ومهاراتك لتبني خدمات وعروضاً مربحة ومطلوبة بقوة في السوق.",
    reason_tag_2: "الميزة 02",
    reason_title_2: "تساعد الآخرين من خلال خدمات مشروعك.",
    reason_desc_2: "قدّم حلولاً ملموسة لمشاكل عملائك واصنع أثراً إيجابياً وملموساً.",
    reason_tag_3: "الميزة 03",
    reason_title_3: "تستقطب عملاء جدد تلقائياً بدل البحث المرهق عنهم.",
    reason_desc_3: "عبر أنظمة التسويق الرقمي والقنوات الاحترافية التي تجذب العملاء إليك.",
    reason_tag_4: "الميزة 04",
    reason_title_4: "تضاعف أرباحك وعوائدك المالية بوضوح.",
    reason_desc_4: "لا يوجد سقف يفرضه عليك رب عمل – دخلك ينمو مباشرة مع حجم إنجازك وقيمتك.",
    reason_tag_5: "الميزة 05",
    reason_title_5: "تكسب حرية حقيقية – في وقتك وقراراتك المالية.",
    reason_desc_5: "تحكّم بنفسك في جدول مواعيدك، مكان عملك ومسار مستقبلك بكل استقلالية.",
    reason_tag_6: "الميزة 06",
    reason_title_6: "تكتشف وتستثمر كامل قدراتك وإمكاناتك.",
    reason_desc_6: "تجاوز الحدود الوظيفية التقليدية وابنِ صرحاً تفتخر به أنت وعائلتك.",
    reason_tag_7: "الميزة 07 · أسمى الغايات",
    reason_title_7: "مزيد من الوقت لما يهمك حقاً:",
    reason_title_7_gold: "عائلتك الكريمة",
    reason_desc_7: "الأمان المالي والاستقلال الزمني يعنيان قبل كل شيء: جودة حياة حقيقية وحضور دافئ مع من تحب.",
    signature_sub_badge: "★ الأساس الحقيقي والغاية الكبرى لكل نجاح",
    chip_time_autonomy: "استقلالية الوقت وحرية القرار",
    chip_family_presence: "حضور عائلي دافئ ومستمر",
    chip_quality_life: "جودة حياة كريمة في ألمانيا",

    // 8. Meine Fachgebiete
    fach_tag: "مجالات الخبرة والاختصاص",
    fach_title: "مجالات الخبرة التي أساعدك فيها",
    fach_title_gold: "بشكل عملي وملموس",
    fach_desc: "خبرة ميدانية مجرّبة مستخلصة من أكثر من عقدين في الإعلام وتأسيس الشركات في ألمانيا:",
    fach_b1: "الاستشارة",
    fach_t1: "استشارات للأفراد، الشركات والمنظمات",
    fach_d1: "بصفتي باحثاً في العلوم السياسية بدرجة دكتوراه في الهجرة ورائد أعمال في التسويق الرقمي، أدمج بين المعرفة النظرية والخبرة الميدانية – المكتسبة من استشارة سياسيين ومؤسسات كبرى في المغرب وألمانيا.",
    fach_f1_1: "دمج المعرفة الأكاديمية بالخبرة الميدانية",
    fach_f1_2: "استشارات موجهة للشركات، المنظمات والشخصيات العامة",
    fach_f1_3: "خبرة عملية موثقة في ألمانيا والمغرب",
    fach_foot_1: "استراتيجي ومخصص",
    fach_b2: "ثنائي اللغة (ألماني / عربي)",
    fach_t2: "ورش عمل، ندوات ومحاضرات تدريبية",
    fach_d2: "باللغتين الألمانية والعربية، حول إدارة المشاريع، التواصل، التطوير الذاتي، الصحافة وإطلاق الأعمال الرقمية.",
    fach_f2_1: "برامج تدريبية باللغتين الألمانية والعربية",
    fach_f2_2: "إدارة المشاريع والتواصل الفعال",
    fach_f2_3: "تطوير الذات والصحافة الرقمية",
    fach_foot_2: "كفاءة ثنائية الثقافة",
    fach_b3: "المشاهير والانتشار",
    fach_t3: "التسويق عبر المشاهير والشخصيات العامة",
    fach_d3: "من خلال التسويق التأثيري – بما في ذلك التعاون مع نجم كرة القدم البرازيلي أيلتون – أساعدك على اكتساب انتشار واسع وثقة عملاء جدد. أتحدث هنا من واقع عملي لأنني أدير بنفسي مشاريع رقمية وواقعية متعددة.",
    fach_f3_1: "حملات تسويقية مع مشاهير وشخصيات كبرى (مثل أيلتون)",
    fach_f3_2: "كسب ثقة سريعة وقاعدة جماهيرية واسعة",
    fach_f3_3: "مستمد من إدارة مشاريع تجارية واقعية ورقمية",
    fach_foot_3: "مصداقية عالية",
    fach_b4: "الظهور الرقمي",
    fach_t4: "الظهور الرقمي لرواد الأعمال، الأساتذة والمؤسسات",
    fach_d4: "من إعلانات جوجل ومنصات التواصل الاجتماعي، إلى المواقع المتوافقة مع محركات البحث، وحتى الإدارة المتكاملة للحسابات – لحضور إعلامي ورقمي قوي ومؤثر.",
    fach_f4_1: "إعلانات جوجل ومنصات التواصل الاجتماعي",
    fach_f4_2: "مواقع إلكترونية مهيأة لمحركات البحث (SEO)",
    fach_f4_3: "إدارة احترافية للحسابات والظهور الإعلامي",
    fach_foot_4: "ظهور رقمي مدروس",

    // 9. Zahlen
    kpi_section_title: "خبرتي العملية بالأرقام",
    kpi_1: "إجمالي العملاء المستفيدين من الاستشارات",
    kpi_2: "عاماً من الخبرة في ألمانيا",
    kpi_3: "قصة نجاح مشتركة مع العملاء",
    kpi_4: "جوائز وتكريمات دولية",

    // 10. Ablauf
    step_tag: "خارطة طريق التعاون",
    step_title: "في 3 خطوات نحو شركتك المستقلة",
    step_title_part1: "في 3 خطوات",
    step_title_part2: "نحو شركتك المستقلة",
    step_desc: "هكذا تجري مراحل العمل المشترك:",
    step_pill_1: "الخطوة 1",
    step_t1: "جلسة استشارية أولية مجانية",
    step_d1: "نتعرف على بعضنا البعض، تحدثني عن واقعك وأهدافك، وأوضح لك بكل صدق وشفافية كيف يمكنني مساعدتك.",
    step_badge_1: "100% استشارة سرية وغير ملزمة",
    step_pill_2: "الخطوة 2",
    step_t2: "خطة عمل مخصصة لمشروعك",
    step_d2: "معي ومع فريقي المتخصص نضع استراتيجية تناسب نقطة انطلاقك – سواء كنت تبدأ من الصفر أو قطعت أولى الخطوات. سيكون خلفك فريق متكامل يدعمك.",
    step_badge_2: "مفصلة خصيصاً وفق قدراتك",
    step_pill_3: "الخطوة 3",
    step_t3: "التنفيذ والمرافقة الفردية 1:1",
    step_d3: "أنت تنفذ وأنا أرافقك خطوة بخطوة – بمهام واضحة، تقييم مستمر وأدوات أثبتت نجاحها الفعلي في الميدان.",
    step_badge_3: "مرافقة ميدانية تطبيقية مستمرة",
    step_cta: "احجز موعد جلستك الاستشارية الآن",

    // 11. Stimmen
    testi_tag: "شهادات متدربينا",
    testi_title: "ما يقوله عملاؤنا عن تجربة التعاون",
    testi_title_part1: "ما يقوله عملاؤنا",
    testi_title_part2: "عن تجربة التعاون والنتائج",
    testi_desc: "قصص حقيقية لرواد أعمال من خلفيات مهاجرة انطلقوا مع د. جمال ويقودون اليوم مشاريع ناجحة في ألمانيا:",
    testi_verified: "دراسة حالة موثقة",
    testi_b1: "عائدات من 6 أرقام بعد 12 شهراً",
    testi_q1: "\"كنت أعتقد أن لكنتي تشكل عائقاً في السوق الألماني. علمني د. جمال أن قصتي وخلفيتي هما نقطة قوتي الكبرى. اليوم نخدم عملاء في كل أنحاء ألمانيا.\"",
    testi_r1: "تجارة إلكترونية وتوزيع",
    testi_name_1: "طارق المنصوري",
    testi_loc_1: "فرانكفورت",
    testi_b2: "بناء قاعدة عملاء B2B مؤسسية",
    testi_q2: "\"بفضل التدريب الفردي 1:1 والعمل الإعلامي مع د. جمال، بنيت علامة تجارية تفرض الثقة الفورية لدى كبرى الشركات والمؤسسات.\"",
    testi_r2: "استشارات ولغات",
    testi_name_2: "أمينة بنعلي",
    testi_loc_2: "دوسلدورف",
    testi_b3: "تطوير شركة حرفية معتمدة",
    testi_q3: "\"كان مبدأ باريتو نقطة التحول الفاصلة. حسّن د. جمال خطتي التسويقية وإدارة العمليات. واليوم لدي جدول أعمال ممتلئ بالطلبات ووجدت متسعاً لعائلتي.\"",
    testi_r3: "مايستر في التجهيزات التقنية للبناء",
    testi_name_3: "كريم السيد",
    testi_loc_3: "بريمن",
    testi_read_case: "اطّلع على تفاصيل التجربة",

    // 12. FAQ
    faq_tag: "وضوح وشفافية تامة",
    faq_title: "الأسئلة الشائعة",
    faq_title_part1: "أهم الإجابات و",
    faq_title_part2: "الأسئلة الشائعة",
    faq_desc: "كل ما تحتاج لمعرفته قبل جلستك الاستشارية المجانية الأولى:",
    faq_q1: "لمن يناسب هذا البرنامج التدريبي تحديداً؟",
    faq_a1: "للمهاجرات والمهاجرين في ألمانيا الراغبين في تأسيس عملهم الخاص أو جعل مشاريعهم الحالية أكثر وضوحاً وربحية – بغض النظر عن مستواهم اللغوي أو معرفتهم السابقة.",
    faq_q2: "هل يشترط أن أمتلك فكرة عمل جاهزة للبدء؟",
    faq_a2: "لا، على الإطلاق! العديد من المتدربين يكتشفون \"خبرتهم الدفينة\" معي خلال جلسات التدريب الأولى.",
    faq_q3: "بأي لغة تتم جلسات الاستشارة والتدريب؟",
    faq_a3: "تتم باللغتين <strong>الألمانية أو العربية</strong> – بحسب ما هو أسهل وأنسب بالنسبة لك.",
    faq_q4: "متى يمكنني توقع ظهور أولى النتائج الملموسة؟",
    faq_a4: "يعتمد ذلك على مدى التزامك. لا أعد بمعجزات بين عشية وضحاها – ولكن بالاستراتيجية الصحيحة والتنفيذ المستمر، فإن تحقيق نتائج ملموسة خلال بضعة أشهر أمر واقعي تماماً.",
    faq_q5: "كيف تسير الأمور بعد تقديم طلب التسجيل؟",
    faq_a5: "تتلقى في أقرب وقت موعداً لجلسة استشارية أولية مجانية، نناقش فيها وضعك الحالي وأهدافك المستقبلية.",
    faq_support_badge: "✦ دعم واستفسارات مباشرة",
    faq_support_title: "هل لا يزال لديك سؤال شخصي لم يُذكر هنا؟",
    faq_support_desc: "ناقش تساؤلاتك وظروفك الخاصة مباشرة في جلسة استشارية أولية 1:1 بسرية تامة.",
    faq_support_btn: "احجز جلستك الآن",

    // 13. Abschluss-CTA
    final_kicker: "هل أنت مستعد لخطوتك القادمة؟",
    final_title: 'هل أنت مستعد لتحويل قصتك وتجاربك إلى <span class="gold-gradient-text">نجاح حقيقي</span> في ألمانيا؟',
    final_sub: "لا تحتاج إلى إتقان مثالي للألمانية. ولا تحتاج إلى شبكة علاقات تقدم لك كل شيء. تحتاج إلى خطوة أولى – وإلى شخص يرشدك كيف تسير الأمور حقاً.",
    final_btn_book: "احجز جلستك الاستشارية المجانية الآن",
    final_btn_ebook: "حمّل الكتاب الإرشادي المجاني",

    // 14. Footer
    footer_quote: "«إذا قلت لنفسك مسبقاً: 'لن أستطيع'، فلن تنجح أبداً. لكن إذا سألت نفسك: 'كيف يمكنني أن أحقق ذلك؟' – فقد قطعت 80% من طريق النجاح. وما تبقى هو التنفيذ فقط.»",
    footer_quote_author: "— د. جمال بوعسيرية",
    footer_brand_desc: "تدريب ومرافقة فردية 1:1 للمهاجرات والمهاجرين في ألمانيا. يرافقك د. جمال بوعسيرية باللغتين الألمانية والعربية لتأسيس وإطلاق شركتك بنجاح.",
    footer_contact_h: "بيانات التواصل",
    footer_nav_h: "تصفح الموقع",
    footer_websites_h: "مواقعنا ومنصاتنا",
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
    } catch (e) { }
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
  } catch (e) { }
}

