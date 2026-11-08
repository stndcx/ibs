/* Recorrido guiado «¿Cómo se usa?» del inicio del IBS (ver RECORRIDO.md).

   Ilumina cada parte con un borde amarillo y una frase corta. Aparece solo la
   primera vez que alguien entra al inicio; después, solo con el botón
   «¿Cómo se usa?» de la barra de arriba. En el blog, en las notas y en el mapa
   ese botón lleva al inicio y arranca el recorrido ahí.

   Va en un bloque aparte de la calculadora: si algo falla acá, la calculadora
   sigue andando (y al revés). Expone window.ibsRecorrido.iniciar() para el
   asistente. */
(function () {
  'use strict';

  const BASE = (document.currentScript && document.currentScript.dataset.base) || '';
  const CLAVE = 'ibs.recorrido.inicio';
  const enInicio = !!document.getElementById('demo');

  // [objetivo, frase, antes del paso]
  const PASOS = [
    ['barra', 'Desde acá vas a cualquier parte del sitio.'],
    ['probar', 'Tocá acá para medir tu suelo.'],
    ['deslizadores', 'Mové cada barra con los datos de tu muestra.'],
    ['puntaje', 'Este es el puntaje de tu suelo, de 0 a 100.', 'mostrarCambio'],
    ['recomendacion', 'Acá te dice qué hacer con ese suelo.'],
    ['tabla', 'Qué significa cada rango y qué hacer en cada caso.'],
    ['compactacion', 'Si el suelo está duro, el resultado real baja. Acá ves cuánto.'],
    ['agenda', 'Reuniones abiertas a las que te podés sumar.'],
    ['mapa', 'Mirá en el mapa los resultados de cada zona.'],
  ];
  const TITULOS = {
    barra: 'Barra de arriba', probar: 'Probar el índice', deslizadores: 'Los 4 deslizadores',
    puntaje: 'El puntaje', recomendacion: 'La recomendación', tabla: 'Tabla de decisión',
    compactacion: 'Compactación', agenda: 'Agenda', mapa: 'Mapa',
  };

  const memoria = {};
  const visto = () => { try { return localStorage.getItem(CLAVE) === 'visto'; } catch (e) { return !!memoria[CLAVE]; } };
  const marcar = () => { memoria[CLAVE] = true; try { localStorage.setItem(CLAVE, 'visto'); } catch (e) { /* sin almacenamiento */ } };
  const reducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esVisible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const buscar = (obj) => Array.prototype.find.call(document.querySelectorAll('[data-recorrido="' + obj + '"]'), esVisible) || null;

  // ---------- Botón «¿Cómo se usa?» ----------
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-como-se-usa]')) return;
    if (enInicio) iniciar();
    else window.location.href = BASE + '/?recorrido';
  });

  if (!enInicio) {
    window.ibsRecorrido = { iniciar: function () { window.location.href = BASE + '/?recorrido'; }, activo: function () { return false; } };
    return;
  }

  // ---------- Capa del recorrido ----------
  const capa = document.createElement('div');
  capa.className = 'recorrido_capa';
  capa.hidden = true;
  capa.innerHTML =
    '<div class="recorrido_foco" aria-hidden="true"></div>' +
    '<div class="recorrido_globo" role="dialog" aria-modal="true" aria-labelledby="recorrido-titulo" aria-describedby="recorrido-frase"></div>';
  document.body.appendChild(capa);
  const foco = capa.querySelector('.recorrido_foco');
  const globo = capa.querySelector('.recorrido_globo');

  let paso = -1;
  let objetivo = null;
  let antesDeAbrir = null;
  let animacion = null;

  function iniciar() {
    marcar();
    antesDeAbrir = document.activeElement;
    capa.hidden = false;
    irA(0);
  }

  function cerrar() {
    capa.hidden = true;
    paso = -1;
    objetivo = null;
    terminarAnimacion();
    if (antesDeAbrir && antesDeAbrir.focus) antesDeAbrir.focus();
  }

  function irA(i, direccion) {
    direccion = direccion || 1;
    terminarAnimacion();
    if (i < 0) i = 0;
    if (i >= PASOS.length) return cerrar();
    const el = buscar(PASOS[i][0]);
    // Lo que no está a la vista (p. ej. el link al mapa con el menú oculto en celular) se saltea.
    if (!el) return irA(i + direccion, direccion);
    paso = i;
    objetivo = el;
    pintar();
    el.scrollIntoView({ block: 'center', behavior: reducido() ? 'auto' : 'smooth' });
    setTimeout(function () {
      if (objetivo !== el) return;
      ubicar();
      const sig = globo.querySelector('[data-r="sig"]');
      if (sig) sig.focus({ preventScroll: true });
      if (PASOS[i][2] === 'mostrarCambio') mostrarCambio();
    }, reducido() ? 30 : 450);
  }

  // Paso 4: un deslizador se mueve solo para que se vea cambiar el puntaje y vuelve a su lugar.
  function mostrarCambio() {
    const sl = document.getElementById('sl_co2');
    if (!sl || reducido() || typeof window.actualizar !== 'function') return;
    const original = Number(sl.value);
    const destino = 560;
    const t0 = performance.now();
    const dur = 2400;
    function frame(t) {
      const k = Math.min(1, (t - t0) / dur);
      // sube en la primera mitad y vuelve en la segunda
      const ida = k < 0.5 ? k * 2 : (1 - k) * 2;
      sl.value = String(Math.round(original + (destino - original) * ida));
      window.actualizar();
      if (k < 1) animacion = requestAnimationFrame(frame);
      else { sl.value = String(original); window.actualizar(); animacion = null; terminarAnimacion.original = undefined; }
    }
    terminarAnimacion.original = original;
    animacion = requestAnimationFrame(frame);
  }
  function terminarAnimacion() {
    if (!animacion) return;
    cancelAnimationFrame(animacion);
    animacion = null;
    const sl = document.getElementById('sl_co2');
    if (sl && terminarAnimacion.original !== undefined) { sl.value = String(terminarAnimacion.original); window.actualizar(); }
  }

  function pintar() {
    // Lo que no está a la vista no cuenta (en celular el link al mapa queda oculto).
    const disponibles = PASOS.filter(function (p) { return buscar(p[0]); });
    const ultimo = paso === PASOS.length - 1 || !PASOS.slice(paso + 1).some(function (p) { return buscar(p[0]); });
    globo.innerHTML =
      '<button type="button" class="recorrido_x" data-r="cerrar" aria-label="Cerrar recorrido"><i class="bi bi-x-lg" aria-hidden="true"></i></button>' +
      '<p class="recorrido_k">¿Cómo se usa? · Paso ' + (disponibles.indexOf(PASOS[paso]) + 1) + ' de ' + disponibles.length + '</p>' +
      '<h2 id="recorrido-titulo">' + TITULOS[PASOS[paso][0]] + '</h2>' +
      '<p id="recorrido-frase" class="recorrido_f">' + PASOS[paso][1] + '</p>' +
      '<div class="recorrido_pie"><div class="recorrido_puntos" aria-hidden="true">' +
      disponibles.map(function (p) { return '<i' + (p === PASOS[paso] ? ' class="on"' : '') + '></i>'; }).join('') +
      '</div><div>' + (paso > 0 ? '<button type="button" class="recorrido_ant" data-r="ant">Anterior</button>' : '') +
      '<button type="button" class="recorrido_sig" data-r="sig">' + (ultimo ? 'Listo' : 'Siguiente') + '</button></div></div>';
  }

  function ubicar() {
    if (!objetivo || capa.hidden) return;
    const r = objetivo.getBoundingClientRect();
    const M = 8;
    foco.style.top = (r.top - M) + 'px';
    foco.style.left = (r.left - M) + 'px';
    foco.style.width = (r.width + 2 * M) + 'px';
    foco.style.height = (r.height + 2 * M) + 'px';
    const W = window.innerWidth, H = window.innerHeight;
    const gw = Math.min(330, W - 32), gh = globo.offsetHeight || 180;
    let top, left;
    if (W < 640) { left = 16; top = H - gh - 16; }
    else {
      left = Math.min(Math.max(16, r.left), W - gw - 16);
      if (r.bottom + M + 12 + gh < H) top = r.bottom + M + 12;
      else if (r.top - M - 12 - gh > 0) top = r.top - M - 12 - gh;
      else if (r.left > gw + 40) { left = r.left - gw - M - 16; top = Math.max(16, r.top + r.height / 2 - gh / 2); }
      else if (W - r.right > gw + 40) { left = r.right + M + 16; top = Math.max(16, r.top + r.height / 2 - gh / 2); }
      else { left = W - gw - 24; top = H - gh - 24; }
    }
    globo.style.top = top + 'px';
    globo.style.left = left + 'px';
    globo.style.width = gw + 'px';
  }

  capa.addEventListener('click', function (e) {
    const b = e.target.closest('[data-r]');
    if (!b) return;
    if (b.dataset.r === 'cerrar') cerrar();
    else if (b.dataset.r === 'ant') irA(paso - 1, -1);
    else if (b.dataset.r === 'sig') irA(paso + 1, 1);
  });
  document.addEventListener('keydown', function (e) {
    if (capa.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); cerrar(); }
    else if (e.key === 'ArrowRight') irA(paso + 1, 1);
    else if (e.key === 'ArrowLeft') irA(paso - 1, -1);
    else if (e.key === 'Tab') {
      const bs = Array.prototype.slice.call(globo.querySelectorAll('button'));
      const i = bs.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); bs[bs.length - 1].focus(); }
      else if (!e.shiftKey && i === bs.length - 1) { e.preventDefault(); bs[0].focus(); }
    }
  });
  const reubicar = function () { if (!capa.hidden) requestAnimationFrame(ubicar); };
  window.addEventListener('scroll', reubicar, { passive: true });
  window.addEventListener('resize', reubicar);

  window.ibsRecorrido = { iniciar: iniciar, activo: function () { return !capa.hidden; } };

  // Primera visita, o ?recorrido (lo pone el botón desde otra página).
  const pedido = /[?&]recorrido\b/.test(window.location.search);
  if (pedido) window.history.replaceState(null, '', window.location.pathname + window.location.hash);
  if (pedido || !visto()) setTimeout(iniciar, 800);
})();
