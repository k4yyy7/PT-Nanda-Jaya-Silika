(function () {
  "use strict";

  /* ── Scroll Reveal ────────────────────────── */
  function initScrollReveal() {
    var els = document.querySelectorAll(".njs-reveal,.njs-fade-up,.njs-slide-right,.njs-slide-left");
    if (!els.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ── Navbar ───────────────────────────────── */
  function initNav() {
    var nav = document.getElementById("mainNav");
    if (!nav) return;
    window.addEventListener("scroll", function () {
      nav.classList.toggle("nav-scrolled", window.scrollY > 80);
      updateActiveLink();
    });
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = this.getAttribute("href");
        if (href === "#") return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        var offset = nav ? nav.offsetHeight : 64;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - offset, behavior: "smooth" });
        closeNavMenu();
      });
    });
  }

  function updateActiveLink() {
    var sections = document.querySelectorAll("section[id]");
    var links    = document.querySelectorAll(".nav-link-item");
    var pos      = window.scrollY + 120;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= pos && sec.offsetTop + sec.offsetHeight > pos) {
        links.forEach(function (l) { l.classList.remove("active"); });
        var a = document.querySelector('.nav-link-item[href="#' + sec.id + '"]');
        if (a) a.classList.add("active");
      }
    });
  }

  function initMobileNav() {
    var btn  = document.getElementById("navToggler");
    var menu = document.getElementById("navMenu");
    if (!btn || !menu) return;
    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      btn.classList.toggle("open", open);
    });
  }

  function closeNavMenu() {
    var btn  = document.getElementById("navToggler");
    var menu = document.getElementById("navMenu");
    if (menu) menu.classList.remove("is-open");
    if (btn)  btn.classList.remove("open");
  }

  /* ── Back to Top & WA Float ───────────────── */
  function initFloatingButtons() {
    var btt    = document.getElementById("backToTop");
    var waBtn  = document.getElementById("waFloat");
    var heroSec = document.getElementById("hero");

    function onScroll() {
      var sy = window.scrollY;
      var heroH = heroSec ? (heroSec.offsetTop + heroSec.offsetHeight - 100) : 500;
      if (btt)   btt.classList.toggle("visible",  sy > 300);
      if (waBtn) waBtn.classList.toggle("visible", sy > heroH);
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    if (btt) {
      btt.addEventListener("click", function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  /* ── Hero Slider ──────────────────────────── */
  function initHeroSlider() {
    var track     = document.getElementById("heroTrack");
    var btnLeft   = document.getElementById("heroArrowLeft");
    var btnRight  = document.getElementById("heroArrowRight");
    var counterCur = document.querySelector(".hero-counter-current");
    var counterTot = document.querySelector(".hero-counter-total");
    var progressEl = document.getElementById("heroProgress");
    var timerEl    = document.getElementById("heroTimer");

    if (!track) return;

    var slides    = track.querySelectorAll(".hero-slide");
    var textItems = document.querySelectorAll(".hero-text-item");
    var total     = slides.length;
    var current   = 0;
    var isDragging = false;
    var startX     = 0;
    var curTranslate  = 0;
    var prevTranslate = 0;
    var autoTimer  = null;
    var heroVisible = true;
    var AUTO_DELAY  = 5000;

    if (counterTot) counterTot.textContent = String(total).padStart(2, "0");

    function goTo(idx) {
      if (idx < 0) idx = total - 1;
      if (idx >= total) idx = 0;
      var same = idx === current;
      if (!same) textItems.forEach(function (t) { t.classList.remove("is-active"); });
      current = idx;
      curTranslate = -current * window.innerWidth;
      prevTranslate = curTranslate;
      track.classList.remove("dragging");
      track.style.transform = "translateX(" + curTranslate + "px)";
      slides.forEach(function (s, i) { s.classList.toggle("is-active", i === current); });
      if (!same) setTimeout(function () { if (textItems[current]) textItems[current].classList.add("is-active"); }, 150);
      if (counterCur) counterCur.textContent = String(current + 1).padStart(2, "0");
      if (progressEl) progressEl.style.width = ((current + 1) / total * 100) + "%";
      restartTimer();
    }

    function restartTimer() {
      if (!timerEl) return;
      timerEl.classList.remove("running");
      void timerEl.offsetWidth;
      if (heroVisible) timerEl.classList.add("running");
    }

    function startAuto() {
      stopAuto();
      autoTimer = setInterval(function () { if (heroVisible) goTo(current + 1); }, AUTO_DELAY);
    }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
    function resetAuto() { stopAuto(); startAuto(); restartTimer(); }

    if (btnRight) btnRight.addEventListener("click", function () { goTo(current + 1); resetAuto(); });
    if (btnLeft)  btnLeft.addEventListener("click",  function () { goTo(current - 1); resetAuto(); });

    function getX(e) { return e.type.includes("mouse") ? e.pageX : e.touches[0].clientX; }
    function dragStart(e) { isDragging = true; startX = getX(e); track.classList.add("dragging"); }
    function dragMove(e) {
      if (!isDragging) return;
      if (e.type === "touchmove") e.preventDefault();
      curTranslate = prevTranslate + (getX(e) - startX);
      track.style.transform = "translateX(" + curTranslate + "px)";
    }
    function dragEnd() {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove("dragging");
      var moved = curTranslate - prevTranslate;
      var threshold = window.innerWidth * 0.18;
      if (moved < -threshold) goTo(current + 1);
      else if (moved > threshold) goTo(current - 1);
      else goTo(current);
      resetAuto();
    }

    track.addEventListener("mousedown",  dragStart);
    track.addEventListener("mousemove",  dragMove);
    track.addEventListener("mouseup",    dragEnd);
    track.addEventListener("mouseleave", dragEnd);
    track.addEventListener("touchstart", dragStart, { passive: true });
    track.addEventListener("touchmove",  dragMove,  { passive: false });
    track.addEventListener("touchend",   dragEnd);

    var wheelLock = false;
    track.addEventListener("wheel", function (e) {
      if (wheelLock) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault(); wheelLock = true;
        if (e.deltaY > 20) goTo(current + 1);
        else if (e.deltaY < -20) goTo(current - 1);
        resetAuto();
        setTimeout(function () { wheelLock = false; }, 1000);
      }
    }, { passive: false });

    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { goTo(current + 1); resetAuto(); }
      if (e.key === "ArrowLeft")  { goTo(current - 1); resetAuto(); }
    });

    var heroSec = document.getElementById("hero");
    if (heroSec) {
      var heroObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          heroVisible = entry.isIntersecting;
          if (!heroVisible && timerEl) timerEl.classList.remove("running");
          else if (heroVisible) restartTimer();
        });
      }, { threshold: 0.1 });
      heroObs.observe(heroSec);
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        curTranslate = -current * window.innerWidth;
        prevTranslate = curTranslate;
        track.classList.remove("dragging");
        track.style.transform = "translateX(" + curTranslate + "px)";
      }, 100);
    });

    goTo(0);
    startAuto();
  }

  /* ── Product Card Flip (Touch / Click) ───── */
  function initProductFlip() {
    var isTouchDevice = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
    if (!isTouchDevice) return; // Desktop: CSS hover handles it

    document.querySelectorAll(".product-card").forEach(function (card) {
      card.addEventListener("click", function (e) {
        // Jika klik tombol "Hubungi Kami" di back-side, jangan flip balik
        if (e.target.closest(".product-back-cta")) return;
        card.classList.toggle("flipped");
      });
    });

    // Tutup card yang terbuka saat klik di luar
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".product-card")) {
        document.querySelectorAll(".product-card.flipped").forEach(function (c) {
          c.classList.remove("flipped");
        });
      }
    });
  }

  /* ── Init All ─────────────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    initHeroSlider();
    initScrollReveal();
    initNav();
    initMobileNav();
    initFloatingButtons();
    initProductFlip();
  });

})();