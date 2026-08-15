/* =====================================================================
   VIO FUTURO — Landing Page · Scripts
   ---------------------------------------------------------------------
   Dois comportamentos: animação sutil de fade-in ao rolar a página e
   carregamento do vídeo do hero apenas no desktop.
   Leve, sem dependências. Respeita "prefers-reduced-motion".
   ===================================================================== */

/* ---------- Vídeo do hero (somente desktop) ----------
   O <video> nasce sem <source>: as fontes só são inseridas quando a tela
   é larga. Assim o celular não baixa nem um byte de vídeo, o que
   "display: none" sozinho não garantiria. */
(function () {
  'use strict';

  var video = document.querySelector('[data-desktop-video]');
  if (!video) return;

  var desktop = window.matchMedia('(min-width: 900px)');
  var carregado = false;

  function carregar() {
    if (carregado || !desktop.matches) return;
    carregado = true;
    video.poster = video.getAttribute('data-poster');

    [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(function (par) {
      var url = video.getAttribute('data-' + par[0]);
      if (!url) return;
      var source = document.createElement('source');
      source.src = url;
      source.type = par[1];
      video.appendChild(source);
    });

    video.load();

    // Quem pediu menos movimento fica só com o poster parado.
    var prefereParado = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefereParado) {
      video.autoplay = true;
      var tocando = video.play();
      // Se o navegador recusar o autoplay, o poster continua no lugar.
      if (tocando && tocando.catch) tocando.catch(function () {});
    }
  }

  carregar();
  // Cobre quem gira o aparelho ou redimensiona a janela para o desktop.
  if (desktop.addEventListener) desktop.addEventListener('change', carregar);
  else if (desktop.addListener) desktop.addListener(carregar);
})();

/* ---------- Animação de entrada das seções ---------- */
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
