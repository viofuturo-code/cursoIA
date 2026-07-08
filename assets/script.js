/* =====================================================================
   VIO FUTURO — Landing Page · Scripts
   ---------------------------------------------------------------------
   Único comportamento: animação sutil de fade-in ao rolar a página.
   Leve, sem dependências. Respeita "prefers-reduced-motion".
   ===================================================================== */

(function () {
  'use strict';

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var elementos = document.querySelectorAll('.reveal');

  // Sem suporte a IntersectionObserver ou usuário prefere menos movimento:
  // mostra tudo imediatamente.
  if (prefersReduced || !('IntersectionObserver' in window)) {
    elementos.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observador = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observador.unobserve(entry.target); // anima só uma vez
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px'
  });

  elementos.forEach(function (el) { observador.observe(el); });
})();
