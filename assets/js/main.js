// Main JS for GenAI‑ERA site
// Handles: preloader, smooth scroll active links, Isotope filters, counters
(function(){
  'use strict';

  // Preloader hide
  document.addEventListener('DOMContentLoaded', function(){
    var pre = document.getElementById('js-preloader');
    if(pre){ setTimeout(function(){ pre.classList.add('loaded'); }, 300); }
  });

  // Smooth scroll and active link highlighting
  function setActiveLink(){
    var sections = ['top','vision-block','events','videos','programs','research','grants','team','tools','contact'];
    var scrollPos = window.scrollY + 100;
    sections.forEach(function(id){
      var sec = document.getElementById(id);
      var link = document.querySelector('.navbar a[href="#'+id+'"]');
      if(!sec || !link) return;
      var rect = sec.getBoundingClientRect();
      var offsetTop = window.scrollY + rect.top;
      if(scrollPos >= offsetTop && scrollPos < offsetTop + sec.offsetHeight){
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  window.addEventListener('scroll', setActiveLink);
  window.addEventListener('load', setActiveLink);

  // Back to top button
  (function(){
    var btn = null;
    function onScroll(){
      if(!btn){ btn = document.getElementById('backToTop'); }
      if(!btn) return;
      if(window.scrollY > 400){ btn.classList.add('show'); } else { btn.classList.remove('show'); }
    }
    function toTop(){ window.scrollTo({ top: 0, behavior: 'smooth' }); }
    window.addEventListener('scroll', onScroll);
    window.addEventListener('load', onScroll);
    document.addEventListener('DOMContentLoaded', function(){ var b = document.getElementById('backToTop'); if(b){ b.addEventListener('click', toTop); } });
  })();

  // Hero arrow navigation between stacked hero blocks
  function initHeroArrows(){
    var track = document.querySelector('.main-banner .hero-track');
    var sections = Array.prototype.slice.call(document.querySelectorAll('.main-banner .hero-block'));
    if(!track || sections.length === 0) return;
    function scrollToIndex(idx){
      var target = sections[idx];
      if(!target) return;
      var left = target.offsetLeft;
      // Use instant scroll for faster response
      track.scrollTo({ left: left, behavior: 'auto' });
    }
    sections.forEach(function(sec, i){
      var prev = sec.querySelector('.hero-arrow.prev');
      var next = sec.querySelector('.hero-arrow.next');
      if(prev){
        prev.addEventListener('click', function(){ scrollToIndex(Math.max(0, i-1)); });
      }
      if(next){
        next.addEventListener('click', function(){ scrollToIndex(Math.min(sections.length-1, i+1)); });
      }
      // Always hide arrows that would lead to nowhere: prev on first, next on last
      if(prev && i === 0){
        prev.classList.add('disabled');
        prev.setAttribute('aria-disabled','true');
        prev.setAttribute('aria-hidden','true');
        prev.setAttribute('tabindex','-1');
        prev.style.display = 'none';
      }
      if(next && i === sections.length-1){
        next.classList.add('disabled');
        next.setAttribute('aria-disabled','true');
        next.setAttribute('aria-hidden','true');
        next.setAttribute('tabindex','-1');
        next.style.display = 'none';
      }
    });
  }
  window.addEventListener('load', initHeroArrows);

  // Isotope filters (if library present)
  function initIsotope(){
    if(typeof Isotope === 'undefined') return;
    var grid = document.querySelector('.event_box');
    if(!grid) return;
  var iso = new Isotope(grid, { itemSelector: '.event_outer', layoutMode: 'fitRows', transitionDuration: 150 });
    document.querySelectorAll('.event_filter a').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        document.querySelectorAll('.event_filter a').forEach(function(b){ b.classList.remove('is_active'); });
        btn.classList.add('is_active');
        var filterValue = btn.getAttribute('data-filter') || '*';
        iso.arrange({ filter: filterValue });
      });
    });
  }
  window.addEventListener('load', initIsotope);

  // Counters
  function animateCounters(){
    var els = document.querySelectorAll('.count-number[data-to]');
    var speed = 1000;
    els.forEach(function(el){
      var target = parseInt(el.getAttribute('data-to'), 10) || 0;
      var start = 0;
      var startTime = null;
      function step(ts){
        if(!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / speed, 1);
        var value = Math.floor(progress * target);
        el.textContent = value.toString();
        if(progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  var countersStarted = false;
  function onScrollCounters(){
    if(countersStarted) return;
    var section = document.querySelector('.fun-facts');
    if(!section) return;
    var rect = section.getBoundingClientRect();
    if(rect.top < window.innerHeight){ countersStarted = true; animateCounters(); }
  }
  window.addEventListener('scroll', onScrollCounters);
  window.addEventListener('load', onScrollCounters);

  // Reveal on scroll animations
  function initReveals(){
    var els = Array.prototype.slice.call(document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right'));
    if(els.length === 0) return;
    if('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){ entry.target.classList.add('in-view'); io.unobserve(entry.target); }
        });
      }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
      els.forEach(function(el){ io.observe(el); });
    } else {
      // Fallback: add immediately
      els.forEach(function(el){ el.classList.add('in-view'); });
    }
  }
  window.addEventListener('load', initReveals);
  // Also initialize reveals as soon as DOM is ready so animations don't wait for slow resources
  document.addEventListener('DOMContentLoaded', initReveals);

  // Prevent page jump for featured program buttons (href="#") while allowing Bootstrap modals to open
  document.addEventListener('click', function(e){
    var anchor = e.target && e.target.closest('.programs-section a[href="#"]');
    if(anchor){
      e.preventDefault();
    }
  });
  // Also prevent default on keyboard activation for the same buttons
  document.addEventListener('keydown', function(e){
    if((e.key === 'Enter' || e.key === ' ') && e.target && e.target.closest('.programs-section a[href="#"]')){
      e.preventDefault();
    }
  });

  // Make entire Featured Programs cards behave like buttons opening their modal, without page scroll
  document.addEventListener('DOMContentLoaded', function(){
    var cards = Array.prototype.slice.call(document.querySelectorAll('.programs-section .program-card'));
    if(cards.length === 0) return;
    cards.forEach(function(card){
      // Improve accessibility: make card focusable and button-like
      if(!card.hasAttribute('tabindex')){ card.setAttribute('tabindex', '0'); }
      if(!card.hasAttribute('role')){ card.setAttribute('role', 'button'); }

      // Click anywhere on card triggers inner modal button
      card.addEventListener('click', function(ev){
        // If the direct click target is already an actionable element, let it handle
        if(ev.target.closest('a, button')){ return; }
        var btn = card.querySelector('a.discover-btn[data-bs-toggle="modal"]');
        if(btn){
          ev.preventDefault();
          // Trigger the anchor click so Bootstrap opens the modal; our global handler prevents page-jump
          btn.click();
        }
      });

      // Keyboard support: Enter/Space should open the modal
      card.addEventListener('keydown', function(ev){
        if(ev.key === 'Enter' || ev.key === ' '){
          var btn = card.querySelector('a.discover-btn[data-bs-toggle="modal"]');
          if(btn){
            ev.preventDefault();
            btn.click();
          }
        }
      });
    });
  });

  // Contact form: set _next to return to site and show success message
  document.addEventListener('DOMContentLoaded', function(){
    try {
      var nextField = document.getElementById('contact-next');
      if(nextField){
        var url = new URL(window.location.href);
        url.hash = 'message-sent';
        nextField.value = url.toString();
      }
      if(window.location.hash === '#message-sent'){
        var alertBox = document.getElementById('contact-success');
        if(alertBox){ alertBox.classList.remove('d-none'); }
      }
      var copyBtn = document.getElementById('copy-email');
      if(copyBtn){
        copyBtn.addEventListener('click', function(){
          var email = copyBtn.getAttribute('data-email') || 'genaiera1@gmail.com';
          if(navigator.clipboard && navigator.clipboard.writeText){
            navigator.clipboard.writeText(email).then(function(){
              copyBtn.textContent = 'copied!';
              setTimeout(function(){ copyBtn.textContent = 'copy email'; }, 1500);
            }).catch(function(){
              window.prompt('Copy email address:', email);
            });
          } else {
            window.prompt('Copy email address:', email);
          }
        });
      }
    } catch(e) {
      // no-op
    }
  });

  // Close mobile navbar when clicking outside of it
  document.addEventListener('click', function(e){
    try {
      var collapse = document.querySelector('.navbar-collapse');
      if(!collapse) return;
      // Only proceed if collapse is currently shown (mobile open)
      if(!collapse.classList.contains('show')) return;
      // If click happened inside the navbar, do nothing
      if(e.target && e.target.closest && e.target.closest('.navbar')) return;

      // Try to use Bootstrap Collapse API if available
      if(window.bootstrap && bootstrap.Collapse){
        var bsCollapse = bootstrap.Collapse.getInstance(collapse) || new bootstrap.Collapse(collapse, { toggle: false });
        bsCollapse.hide();
      } else {
        // Fallback: remove classes/attributes
        collapse.classList.remove('show');
        collapse.setAttribute('aria-expanded', 'false');
        var toggler = document.querySelector('.navbar-toggler');
        if(toggler){ toggler.classList.remove('collapsed'); toggler.setAttribute('aria-expanded','false'); }
      }
    } catch(err){ /* ignore errors */ }
  });
})();
