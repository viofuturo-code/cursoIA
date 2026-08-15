/* =====================================================================
   VIO FUTURO — Landing Page · Scripts
   ---------------------------------------------------------------------
   1. Mídias do hero: carregamento só no desktop e tratamento de falha
   2. Parallax da montagem do hero
   3. Animação de entrada das seções ao rolar

   Tudo aqui é melhoria progressiva: sem JavaScript a página continua
   correta, apenas sem parallax e sem o vídeo (que cai no poster).
   Leve, sem dependências. Respeita "prefers-reduced-motion".
   ===================================================================== */

(function () {
  'use strict';

  var DESKTOP = '(min-width: 900px)';
  var telaGrande = window.matchMedia(DESKTOP);
  var menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');

  function aoMudar(mq, fn) {
    if (mq.addEventListener) mq.addEventListener('change', fn);
    else if (mq.addListener) mq.addListener(fn);
  }

  /* ------------------------------------------------------------------
     1. MÍDIAS DO HERO
     ------------------------------------------------------------------ */

  /* O shimmer do placeholder precisa parar em qualquer desfecho: mídia
     carregada (a imagem cobre o bloco) ou mídia quebrada (fica só o
     gradiente da marca). Nunca ícone de imagem quebrada, nunca buraco. */
  function pronto(frame) {
    if (frame) frame.classList.remove('is-loading');
  }
  function falhou(frame) {
    if (!frame) return;
    frame.classList.remove('is-loading');
    frame.classList.add('has-error');
  }

  Array.prototype.forEach.call(document.querySelectorAll('.frame__media'), function (media) {
    var frame = media.closest ? media.closest('.frame') : media.parentNode;

    if (media.tagName === 'IMG') {
      // complete + naturalWidth 0 significa que já falhou antes deste script rodar
      if (media.complete) {
        if (media.naturalWidth > 0) pronto(frame);
        else if (telaGrande.matches) falhou(frame);
      }
      media.addEventListener('load', function () { pronto(frame); });
      media.addEventListener('error', function () { falhou(frame); });
    } else {
      media.addEventListener('loadeddata', function () { pronto(frame); });
      media.addEventListener('error', function () { falhou(frame); });
    }
  });

  /* O <video> nasce sem <source>: as fontes só entram no desktop. Só
     esconder por CSS não bastaria — o navegador baixaria o arquivo. */
  (function () {
    var video = document.querySelector('[data-desktop-video]');
    if (!video) return;

    var frame = video.closest ? video.closest('.frame') : video.parentNode;
    var carregado = false;

    function carregar() {
      if (carregado || !telaGrande.matches) return;
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

      // Se nenhuma das fontes tocar, o <video> dispara error no elemento
      video.addEventListener('error', function () { falhou(frame); }, true);
      video.load();

      // Quem pediu menos movimento fica só com o poster parado.
      if (!menosMovimento.matches) {
        video.autoplay = true;
        var tocando = video.play();
        if (tocando && tocando.catch) tocando.catch(function () {});
      }
    }

    carregar();
    aoMudar(telaGrande, carregar);
  })();

  /* ------------------------------------------------------------------
     2. PARALLAX DA MONTAGEM
     ------------------------------------------------------------------
     Cada peça anda em velocidade própria (a maior mais lenta, o círculo
     mais rápido). O deslocamento é escrito só em translate3d, dentro de
     requestAnimationFrame — nunca top/margin, que forçariam layout a
     cada quadro. O cálculo só roda enquanto o hero está na tela.
     ------------------------------------------------------------------ */

  (function () {
    var hero = document.querySelector('.hero');
    var pecas = document.querySelectorAll('[data-parallax]');
    if (!hero || !pecas.length || !('IntersectionObserver' in window)) return;

    // Ponteiro grosso (touch) não tem scroll suave o bastante para o
    // efeito compensar o custo — e a montagem nem aparece no mobile.
    var ponteiroFino = window.matchMedia('(hover: hover) and (pointer: fine)');

    var ligado = false;
    var visivel = false;
    var agendado = false;

    function ativo() {
      return telaGrande.matches && ponteiroFino.matches && !menosMovimento.matches;
    }

    function desenhar() {
      agendado = false;
      var avanco = -hero.getBoundingClientRect().top;

      Array.prototype.forEach.call(pecas, function (peca) {
        var velocidade = parseFloat(peca.getAttribute('data-parallax')) || 0;
        peca.style.transform = 'translate3d(0,' + (avanco * velocidade).toFixed(2) + 'px,0)';
      });
    }

    function agendar() {
      if (agendado || !visivel || !ligado) return;
      agendado = true;
      window.requestAnimationFrame(desenhar);
    }

    function limpar() {
      Array.prototype.forEach.call(pecas, function (peca) {
        peca.style.transform = '';
        peca.style.willChange = '';
      });
    }

    function reavaliar() {
      var deveLigar = ativo();
      if (deveLigar === ligado) return;
      ligado = deveLigar;

      if (ligado) {
        Array.prototype.forEach.call(pecas, function (peca) {
          peca.style.willChange = 'transform';
        });
        agendar();
      } else {
        limpar();
      }
    }

    new IntersectionObserver(function (entries) {
      visivel = entries[0].isIntersecting;
      if (visivel) agendar();
    }).observe(hero);

    window.addEventListener('scroll', agendar, { passive: true });
    window.addEventListener('resize', agendar, { passive: true });
    aoMudar(telaGrande, reavaliar);
    aoMudar(menosMovimento, reavaliar);
    aoMudar(ponteiroFino, reavaliar);

    reavaliar();
  })();

  /* ------------------------------------------------------------------
     3. ANIMAÇÃO DE ENTRADA DAS SEÇÕES
     ------------------------------------------------------------------ */

  (function () {
    var elementos = document.querySelectorAll('.reveal');

    // Sem suporte a IntersectionObserver ou usuário prefere menos
    // movimento: mostra tudo imediatamente.
    if (menosMovimento.matches || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(elementos, function (el) {
        el.classList.add('is-visible');
      });
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

    Array.prototype.forEach.call(elementos, function (el) { observador.observe(el); });
  })();
})();
