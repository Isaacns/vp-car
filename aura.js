/* =========================================================================
   MODO AURA — VP CAR · "CONSTELAÇÃO" (v3, sem feixes/linhas)
   Campo de estrelas cintilando sobre um brilho profundo que respira, com
   orbs subindo, vinheta de profundidade e grão sutil. Sem raios/linhas.
   Sempre ativa (sem botão). Respeita prefers-reduced-motion: mantém a luz,
   remove o movimento. Auto-contido: window.AURA.
   Acento configurável: window.VZ_ACCENT (default steel VP CAR).
   ========================================================================= */
(function () {
  'use strict';
  if (window.__AURA_INIT__) return;
  window.__AURA_INIT__ = 1;

  function accentHex() {
    var v = window.VZ_ACCENT ||
      (getComputedStyle(document.documentElement).getPropertyValue('--steel') || '').trim() || '#2F6E96';
    return v.charAt(0) === '#' ? v : '#2F6E96';
  }
  function rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(function(c){return c+c;}).join('');
    var n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255];}
  var HEX=accentHex(), R=rgb(HEX).join(','), RL=rgb('#E6D2A0').join(',');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css = document.createElement('style');
  css.id = 'auraCSS';
  css.textContent = [
    '.vz-afix{position:fixed;inset:-14%;z-index:0;pointer-events:none;overflow:hidden;',
    'will-change:transform;transition:transform .18s ease-out}',

    /* brilho profundo central que respira */
    '.vz-cglow{position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;background:',
    'radial-gradient(58% 56% at 50% 44%,rgba('+R+',.34),transparent 70%),',
    'radial-gradient(46% 42% at 16% 8%,rgba('+RL+',.16),transparent 66%),',
    'radial-gradient(44% 40% at 92% 96%,rgba('+R+',.14),transparent 66%);',
    'animation:vzBreathe 9s ease-in-out infinite}',
    '@keyframes vzBreathe{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}',

    /* campo de estrelas — deriva devagar (vida), estrelas cintilam */
    '.vz-stars{position:absolute;inset:0;pointer-events:none;animation:vzSky 120s linear infinite}',
    '@keyframes vzSky{0%{transform:translate(0,0)}50%{transform:translate(-1.4%,-1.2%)}100%{transform:translate(0,0)}}',
    '.vz-star{position:absolute;border-radius:50%;background:#F3ECDD;mix-blend-mode:screen;animation:vzTw 3.4s ease-in-out infinite}',
    '@keyframes vzTw{0%,100%{opacity:.12;transform:scale(1)}50%{opacity:.9;transform:scale(1.6)}}',

    /* orbs subindo (poeira luminosa) */
    '.vz-orb{position:absolute;border-radius:50%;pointer-events:none;mix-blend-mode:screen;filter:blur(1px)}',
    '.vz-orb.o1{width:8px;height:8px;left:22%;top:64%;background:rgba('+RL+',.9);box-shadow:0 0 16px rgba('+RL+',.7);animation:vzRise 24s linear infinite}',
    '.vz-orb.o2{width:5px;height:5px;left:70%;top:80%;background:rgba('+R+',.9);box-shadow:0 0 12px rgba('+R+',.6);animation:vzRise 32s linear infinite 7s}',
    '.vz-orb.o3{width:6px;height:6px;left:46%;top:72%;background:rgba('+RL+',.85);box-shadow:0 0 14px rgba('+RL+',.6);animation:vzRise 28s linear infinite 13s}',
    '@keyframes vzRise{0%{transform:translateY(0);opacity:0}12%{opacity:.9}88%{opacity:.5}100%{transform:translateY(-72vh);opacity:0}}',

    /* vinheta de profundidade — emoldura o conteúdo (premium) */
    '.vz-vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 90% at 50% 42%,transparent 52%,rgba(0,0,0,.36) 100%)}',
    '[data-theme="light"] .vz-vig{background:radial-gradient(120% 90% at 50% 42%,transparent 62%,rgba(20,40,70,.08) 100%)}',
    '[data-theme="light"] .vz-star{background:#C7A96B}',

    /* grão sutil (textura editorial) */
    '.vz-grain{position:absolute;inset:0;pointer-events:none;opacity:.045;mix-blend-mode:overlay;',
    "background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>\")}",

    reduce ? '.vz-cglow,.vz-stars,.vz-star,.vz-orb{animation:none!important}' : '',

    /* conteúdo sempre acima da luz (sem tocar em #login/#lock/#portalLogin,
       que já são position:fixed com z-index alto e centralizam sozinhos) */
    '#app,.wrap,#app>aside,#app>main,header,section,footer{position:relative;z-index:1}'
  ].join('');
  document.head.appendChild(css);

  var afix = document.querySelector('.vz-afix');
  if (!afix) { afix = document.createElement('div'); afix.className = 'vz-afix'; document.body.insertBefore(afix, document.body.firstChild); }
  afix.setAttribute('aria-hidden', 'true');

  // gera o campo de estrelas
  var stars = '';
  var N = Math.min(90, Math.max(48, Math.round(window.innerWidth / 18)));
  for (var i = 0; i < N; i++) {
    var x = (Math.random() * 100).toFixed(2);
    var y = (Math.random() * 100).toFixed(2);
    var s = (Math.random() * 1.6 + 0.8).toFixed(2);
    var dl = (Math.random() * 3.4).toFixed(2);
    var op = (Math.random() * 0.5 + 0.3).toFixed(2);
    stars += '<span class="vz-star" style="left:' + x + '%;top:' + y + '%;width:' + s + 'px;height:' + s + 'px;opacity:' + op + ';animation-delay:' + dl + 's"></span>';
  }
  afix.innerHTML =
    '<div class="vz-cglow"></div>' +
    '<div class="vz-stars">' + stars + '</div>' +
    '<span class="vz-orb o1"></span><span class="vz-orb o2"></span><span class="vz-orb o3"></span>' +
    '<div class="vz-grain"></div><div class="vz-vig"></div>';

  if (!reduce) {
    var tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 20;
      ty = (e.clientY / window.innerHeight - 0.5) * 20;
    }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.05; cy += (ty - cy) * 0.05;
      afix.style.transform = 'translate(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px)';
      requestAnimationFrame(loop);
    })();
  }

  window.AURA = { version: '3-constelacao', always: true, variant: 'constelacao' };
})();
