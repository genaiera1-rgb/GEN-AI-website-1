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
    var sections = ['top','vision-block','programs','team','tools','events','contact'];
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

  // Hero arrow navigation between stacked hero blocks
  function initHeroArrows(){
    var track = document.querySelector('.main-banner .hero-track');
    var sections = Array.prototype.slice.call(document.querySelectorAll('.main-banner .hero-block'));
    if(!track || sections.length === 0) return;
    var isSmall = window.matchMedia && window.matchMedia('(max-width: 576px)').matches;
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
      // On larger screens, visually disable at edges; on phones keep tappable for consistency
      if(!isSmall){
        if(prev && i === 0){ prev.classList.add('disabled'); prev.setAttribute('disabled','disabled'); }
        if(next && i === sections.length-1){ next.classList.add('disabled'); next.setAttribute('disabled','disabled'); }
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
})();
