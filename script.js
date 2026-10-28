/**
 * MAHEDI RAZA BHOJANI — PORTFOLIO JAVASCRIPT
 * Smooth Scrolling, Scroll Reveals, Live Rep Counter,
 * Interactive Nav, Skill Bar Animations & Accessibility
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. Smooth Scrolling Setup (Lenis + Native Fallback)
     ========================================================================== */
  let lenis = null;

  if (!prefersReducedMotion && typeof window.Lenis !== 'undefined') {
    try {
      lenis = new window.Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.5,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    } catch (e) {
      console.warn('Lenis initialization skipped, falling back to native scroll:', e);
    }
  }

  // Smooth scroll handler for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      e.preventDefault();

      // Close mobile drawer if open
      closeMobileMenu();

      if (lenis && !prefersReducedMotion) {
        lenis.scrollTo(targetElement, {
          offset: -70,
          duration: 1.1,
        });
      } else {
        const headerOffset = 70;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      }

      // Update URL hash without jumping
      if (history.pushState) {
        history.pushState(null, null, targetId);
      }
    });
  });

  /* ==========================================================================
     2. Top Scroll Progress Bar
     ========================================================================== */
  const scrollProgressBar = document.getElementById('scrollProgressBar');

  function updateScrollProgress() {
    if (!scrollProgressBar) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) : 0;
    
    // 60fps GPU-accelerated scaleX
    scrollProgressBar.style.transform = `scaleX(${progress})`;
    scrollProgressBar.setAttribute('aria-valuenow', Math.round(progress * 100));
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* ==========================================================================
     3. Sticky Header & Active Nav Highlighting (Scroll Spy)
     ========================================================================== */
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const sections = document.querySelectorAll('section[id]');

  function handleHeaderScroll() {
    const scrollY = window.scrollY;
    if (header) {
      if (scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Scroll spy for active section
    let currentSectionId = '';
    const scrollPosition = scrollY + 140;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach((link) => {
        const href = link.getAttribute('href').substring(1);
        if (href === currentSectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      mobileNavLinks.forEach((link) => {
        const href = link.getAttribute('href').substring(1);
        if (href === currentSectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  /* ==========================================================================
     4. Mobile Navigation Menu Toggle
     ========================================================================== */
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const mobileMenuDrawer = document.getElementById('mobileMenuDrawer');

  function openMobileMenu() {
    if (!mobileMenuToggle || !mobileMenuDrawer) return;
    mobileMenuToggle.setAttribute('aria-expanded', 'true');
    mobileMenuDrawer.setAttribute('aria-hidden', 'false');
    mobileMenuDrawer.classList.add('open');
  }

  function closeMobileMenu() {
    if (!mobileMenuToggle || !mobileMenuDrawer) return;
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileMenuDrawer.setAttribute('aria-hidden', 'true');
    mobileMenuDrawer.classList.remove('open');
  }

  if (mobileMenuToggle && mobileMenuDrawer) {
    mobileMenuToggle.addEventListener('click', () => {
      const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Close on Esc key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    });
  }

  /* ==========================================================================
     5. Hero Title Word Rotator / Cycling Animation
     ========================================================================== */
  const cycleWords = document.querySelectorAll('.cycle-word');
  let currentWordIndex = 0;

  if (cycleWords.length > 0 && !prefersReducedMotion) {
    setInterval(() => {
      const currentWord = cycleWords[currentWordIndex];
      currentWord.classList.remove('active');
      currentWord.classList.add('leaving');

      currentWordIndex = (currentWordIndex + 1) % cycleWords.length;
      const nextWord = cycleWords[currentWordIndex];
      nextWord.classList.remove('leaving');
      nextWord.classList.add('active');

      setTimeout(() => {
        currentWord.classList.remove('leaving');
      }, 400);
    }, 2800);
  }

  /* ==========================================================================
     6. Interactive Live Rep Counter Widget
     ========================================================================== */
  const repCounterDisplay = document.getElementById('repCounterDisplay');
  const repPumpBtn = document.getElementById('repPumpBtn');
  const repResetBtn = document.getElementById('repResetBtn');
  const repGaugeFill = document.getElementById('repGaugeFill');
  const repFeedbackMsg = document.getElementById('repFeedbackMsg');
  const repWidget = document.getElementById('repWidget');

  let repCount = 0;
  const targetSet = 10;

  const motivationalMilestones = [
    { reps: 1, text: "Good start! Hip depth locked in." },
    { reps: 3, text: "3 clean reps! Keep knees aligned over toes." },
    { reps: 5, text: "Halfway through set 1! Chest upright, back neutral." },
    { reps: 8, text: "8 reps! Parallel achieved. Push through the heels!" },
    { reps: 10, text: "💥 SET 1 COMPLETED! 10 clean reps. Take a rest or keep pumping!" },
    { reps: 15, text: "15 reps! Absolute iron discipline. High volume beast!" },
    { reps: 20, text: "🔥 20 REPS! New PR territory. RepRight would be proud!" },
  ];

  const burstPhrases = [
    "+1 REP",
    "CLEAN DEPTH",
    "PARALLEL!",
    "SOLID FORM",
    "PR DRIVE",
    "POWER UP",
    "LOCKOUT!",
  ];

  function updateRepUI() {
    if (!repCounterDisplay) return;
    repCounterDisplay.textContent = repCount;

    // Number bump animation
    repCounterDisplay.classList.remove('bump');
    void repCounterDisplay.offsetWidth; // Trigger reflow
    repCounterDisplay.classList.add('bump');

    // Update gauge bar (based on targetSet)
    if (repGaugeFill) {
      const percentage = Math.min((repCount / targetSet) * 100, 100);
      repGaugeFill.style.width = `${percentage}%`;
    }

    // Update message based on milestone
    if (repFeedbackMsg) {
      if (repCount === 0) {
        repFeedbackMsg.textContent = "Warm up! Hit 10 reps to complete a working set.";
      } else {
        const milestone = [...motivationalMilestones]
          .reverse()
          .find((m) => repCount >= m.reps);

        if (milestone) {
          repFeedbackMsg.textContent = milestone.text;
        } else {
          repFeedbackMsg.textContent = `Rep ${repCount} locked in! Keep the rhythm.`;
        }
      }
    }
  }

  function spawnBurstBadge(e) {
    if (!repWidget || prefersReducedMotion) return;

    const badge = document.createElement('div');
    badge.className = 'floating-rep-badge';

    const randomPhrase = burstPhrases[Math.floor(Math.random() * burstPhrases.length)];
    badge.textContent = randomPhrase;

    // Position relative to pump button or widget
    const widgetRect = repWidget.getBoundingClientRect();
    const btnRect = repPumpBtn.getBoundingClientRect();

    const left = (btnRect.left - widgetRect.left) + (btnRect.width / 2) + (Math.random() * 20 - 10);
    const top = (btnRect.top - widgetRect.top) + (Math.random() * 10 - 5);

    badge.style.left = `${left}px`;
    badge.style.top = `${top}px`;

    repWidget.appendChild(badge);

    setTimeout(() => {
      badge.remove();
    }, 700);
  }

  if (repPumpBtn) {
    repPumpBtn.addEventListener('click', (e) => {
      repCount += 1;
      updateRepUI();
      spawnBurstBadge(e);
    });
  }

  if (repResetBtn) {
    repResetBtn.addEventListener('click', () => {
      repCount = 0;
      updateRepUI();
    });
  }

  /* ==========================================================================
     7. IntersectionObserver: Staggered Scroll Reveal System
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal-item');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => {
      revealObserver.observe(el);
    });
  } else {
    // If IntersectionObserver unsupported or prefers-reduced-motion
    revealElements.forEach((el) => el.classList.add('revealed'));
  }

  /* ==========================================================================
     8. Skill Bars Animation on Scroll
     ========================================================================== */
  const skillBars = document.querySelectorAll('.skill-bar');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const skillObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target;
            const level = bar.getAttribute('data-level') || '50%';
            const scaleValue = parseFloat(level) / 100;
            bar.style.transform = `scaleX(${scaleValue})`;
            observer.unobserve(bar);
          }
        });
      },
      {
        threshold: 0.25,
      }
    );

    skillBars.forEach((bar) => {
      skillObserver.observe(bar);
    });
  } else {
    // Immediate display
    skillBars.forEach((bar) => {
      const level = bar.getAttribute('data-level') || '50%';
      const scaleValue = parseFloat(level) / 100;
      bar.style.transform = `scaleX(${scaleValue})`;
    });
  }

  /* ==========================================================================
     9. Clipboard Copy for Contact Email
     ========================================================================== */
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimer = null;

  function showToast(message) {
    if (!toastNotification) return;
    if (toastMessage) toastMessage.textContent = message;

    toastNotification.classList.add('show');
    toastNotification.setAttribute('aria-hidden', 'false');

    if (toastTimer) clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
      toastNotification.setAttribute('aria-hidden', 'true');
    }, 2800);
  }

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = 'mahdirazabhojani41@gmail.com';
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
        } else {
          // Fallback
          const tempInput = document.createElement('input');
          tempInput.value = email;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        }
        showToast('Email copied: mahdirazabhojani41@gmail.com');
      } catch (err) {
        showToast('Direct email: mahdirazabhojani41@gmail.com');
      }
    });
  }

  /* ==========================================================================
     10. Quick Message Form -> Composes Pre-filled Mailto
     ========================================================================== */
  const quickMessageForm = document.getElementById('quickMessageForm');

  if (quickMessageForm) {
    quickMessageForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('senderName')?.value || 'Visitor';
      const purpose = document.getElementById('messagePurpose')?.value || 'Collaboration';
      const message = document.getElementById('senderMessage')?.value || '';

      const subject = encodeURIComponent(`[Portfolio Inquiry] ${purpose} - from ${name}`);
      const body = encodeURIComponent(
        `Hi Mahedi,\n\nMy name is ${name}.\n\nPurpose: ${purpose}\n\nMessage:\n${message}\n\nLooking forward to connecting!\n`
      );

      const mailtoUrl = `mailto:mahdirazabhojani41@gmail.com?subject=${subject}&body=${body}`;
      
      showToast('Opening your email client...');
      window.location.href = mailtoUrl;
    });
  }

  /* ==========================================================================
     11. Footer Live Time Indicator (Ahmedabad, Gujarat / IST: UTC+5:30)
     ========================================================================== */
  const liveTimeIndicator = document.getElementById('liveTimeIndicator');

  function updateAhmedabadTime() {
    if (!liveTimeIndicator) return;
    try {
      const now = new Date();
      // Format time in Asia/Kolkata timezone
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const timeString = formatter.format(now);
      liveTimeIndicator.textContent = `${timeString} IST (UTC+5:30)`;
    } catch (e) {
      liveTimeIndicator.textContent = 'IST (UTC+5:30)';
    }
  }

  updateAhmedabadTime();
  setInterval(updateAhmedabadTime, 30000);

  /* ==========================================================================
     12. Initial Load Hero Sequence (< 1.2s Intro)
     ========================================================================== */
  // Ensure hero elements reveal cleanly on initial render
  const heroRevealItems = document.querySelectorAll('#hero .reveal-item');
  setTimeout(() => {
    heroRevealItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('revealed');
      }, index * 90);
    });
  }, 100);

});

