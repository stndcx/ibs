/* Asistente del IBS por voz y texto (Fase 2 de la propuesta, ver RECORRIDO.md).

   Sin librerías ni servidor: entiende pedidos simples con reglas y usa el
   reconocimiento de voz que trae el navegador (Chrome, Edge y Safari; en
   Firefox no existe y el micrófono no aparece). Ejemplos:
     «mi pH es 5.8»            → mueve el deslizador y dice el resultado
     «llevame al blog»         → navega
     «¿qué hago con este suelo?» → lee la recomendación
     «avisame cuándo remuestrear» → activa la acción de Golondrina
     «¿cómo se usa?»           → arranca el recorrido
   También se adelanta sin que le pidas nada: si el pH queda fuera de rango
   ilumina la recomendación, y si alguien mira la calculadora sin tocarla le
   muestra qué mover. Entender cualquier frase sería la Fase 3 (IA en un
   servidor, porque la clave no puede quedar en una página pública). */
(function () {
  'use strict';

  const BASE = (document.currentScript && document.currentScript.dataset.base) || '';
  const enInicio = !!document.getElementById('sl_co2');
  const Reconocedor = window.SpeechRecognition || window.webkitSpeechRecognition;

  const PARAMS = [
    { id: 'sl_co2', nombre: 'CO₂', patron: /\b(co2|co₂|dióxido|dioxido|respiraci[oó]n)\b/, fmt: (v) => String(Math.round(v)) },
    { id: 'sl_mo', nombre: 'materia orgánica', patron: /\b(materia org[aá]nica|mo)\b/, fmt: (v) => v.toFixed(1) },
    { id: 'sl_ph', nombre: 'pH', patron: /\bph\b/, fmt: (v) => v.toFixed(1) },
    { id: 'sl_temp', nombre: 'temperatura', patron: /\b(temperatura|temp|grados)\b/, fmt: (v) => String(v) },
  ];
  const DESTINOS = [
    { patron: /\bblog\b/, nombre: 'el blog', ruta: '/blog/' },
    { patron: /\bmapa\b/, nombre: 'el mapa', ruta: '/mapa/' },
    { patron: /\bf[oó]rmula\b/, nombre: 'la fórmula', ancla: 'formula' },
    { patron: /\b(estados|tabla)\b/, nombre: 'la tabla de decisión', ancla: 'estados' },
    { patron: /\bcompactaci[oó]n\b/, nombre: 'compactación', objetivo: 'compactacion' },
    { patron: /\b(agenda|reuni[oó]n|reuniones|eventos)\b/, nombre: 'la agenda', ancla: 'agenda' },
    { patron: /\bmodelo\b/, nombre: 'el modelo ML', ancla: 'modelo' },
    { patron: /\bintegraci/, nombre: 'integraciones', ancla: 'integraciones' },
    { patron: /\b(calculadora|demo|probar|medir)\b/, nombre: 'la calculadora', ancla: 'demo' },
    { patron: /\binicio\b/, nombre: 'el inicio', ruta: '/' },
  ];
  const GOLONDRINA = [
    { patron: /remuestre|pr[oó]xima muestra|volver a muestrear/, accion: 'remuestreo', texto: 'Listo, Golondrina te va a avisar cuándo volver a muestrear.' },
    { patron: /compactaci[oó]n|penetr[oó]metro/, accion: 'compactacion', texto: 'Listo, Golondrina te avisa cuando el lote esté en capacidad de campo para medir compactación.' },
    { patron: /informe|reporte/, accion: 'informe', texto: 'Listo, Golondrina te prepara el informe de esta muestra.' },
    { patron: /alert|si (el ibs )?baja/, accion: 'alerta', texto: 'Listo, Golondrina te alerta si el IBS baja.' },
  ];
  const SUGERENCIAS = enInicio
    ? ['Mi pH es 5.8', '¿Qué hago con este suelo?', 'Avisame cuándo remuestrear', '¿Cómo se usa?', 'Llevame al blog']
    : ['¿Cómo se usa?', 'Llevame a la calculadora', 'Llevame al mapa'];

  // ---------- Interfaz ----------
  const raiz = document.createElement('div');
  raiz.className = 'asistente';
  raiz.innerHTML =
    '<div class="asistente_burbuja" hidden role="status"></div>' +
    '<section class="asistente_panel" id="asistente-panel" hidden aria-label="Asistente del IBS">' +
      '<header><div><strong>Asistente del IBS</strong><span>Hablale o escribile</span></div>' +
      '<button type="button" class="asistente_x" aria-label="Cerrar asistente"><i class="bi bi-x-lg" aria-hidden="true"></i></button></header>' +
      '<div class="asistente_log" aria-live="polite"></div>' +
      '<div class="asistente_chips"></div>' +
      '<form class="asistente_form">' +
        '<label for="asistente-q" class="asistente_oculto">Tu pedido</label>' +
        '<input id="asistente-q" autocomplete="off" placeholder="Ej.: mi pH es 5.8">' +
        (Reconocedor ? '<button type="button" class="asistente_mic" aria-pressed="false" aria-label="Hablar"><i class="bi bi-mic" aria-hidden="true"></i></button>' : '') +
        '<button type="submit" class="asistente_enviar" aria-label="Enviar"><i class="bi bi-send" aria-hidden="true"></i></button>' +
      '</form>' +
      (Reconocedor ? '' : '<p class="asistente_nota">Este navegador no tiene reconocimiento de voz: escribí tu pedido.</p>') +
    '</section>' +
    '<button type="button" class="asistente_lanzador" aria-expanded="false" aria-controls="asistente-panel"><i class="bi bi-chat-dots" aria-hidden="true"></i><span>Asistente</span></button>';
  document.body.appendChild(raiz);

  const $ = (s) => raiz.querySelector(s);
  const panel = $('.asistente_panel');
  const log = $('.asistente_log');
  const input = $('#asistente-q');
  const burbuja = $('.asistente_burbuja');
  const lanzador = $('.asistente_lanzador');
  let saludo = false;

  $('.asistente_chips').innerHTML = SUGERENCIAS.map((t) => '<button type="button">' + t + '</button>').join('');

  function abrir() {
    panel.hidden = false;
    burbuja.hidden = true;
    lanzador.setAttribute('aria-expanded', 'true');
    if (!saludo) {
      saludo = true;
      decir(enInicio
        ? 'Hola. Puedo mover la calculadora por vos, explicarte el resultado o pedirle a Golondrina que te avise. Probá con un ejemplo de abajo.'
        : 'Hola. Puedo llevarte a cualquier parte del sitio o mostrarte cómo se usa.', false);
    }
    input.focus();
  }
  function cerrar() {
    panel.hidden = true;
    lanzador.setAttribute('aria-expanded', 'false');
    lanzador.focus();
  }
  lanzador.addEventListener('click', () => (panel.hidden ? abrir() : cerrar()));
  $('.asistente_x').addEventListener('click', cerrar);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden && !(window.ibsRecorrido && window.ibsRecorrido.activo())) cerrar();
  });

  function agregar(texto, quien) {
    const p = document.createElement('p');
    p.className = 'asistente_msg asistente_msg--' + quien;
    p.textContent = texto;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
  }

  // Responde por escrito y, si el pedido llegó por voz, también en voz alta.
  function decir(texto, enVozAlta) {
    agregar(texto, 'bot');
    if (enVozAlta && 'speechSynthesis' in window) {
      try {
        const u = new SpeechSynthesisUtterance(texto);
        u.lang = 'es-AR';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      } catch (e) { /* sin voz: queda el texto */ }
    }
  }

  // Ilumina un elemento un par de segundos (mismo amarillo que el recorrido).
  function iluminar(el) {
    if (!el) return;
    el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    el.classList.remove('asistente_iluminado');
    void el.offsetWidth;
    el.classList.add('asistente_iluminado');
    setTimeout(() => el.classList.remove('asistente_iluminado'), 2600);
  }

  const estadoActual = () => ({
    numero: (document.getElementById('demo_numero') || {}).textContent || '',
    estado: (document.getElementById('demo_estado') || {}).textContent || '',
    desc: ((document.getElementById('demo_desc') || {}).textContent || '').trim(),
  });
  const coma = (t) => String(t).replace('.', ',');

  // ---------- Entender el pedido ----------
  function entender(textoOriginal, porVoz) {
    const t = textoOriginal.toLowerCase().normalize('NFC').trim();
    if (!t) return;
    agregar(textoOriginal, 'yo');

    if (/c[oó]mo se usa|recorrido|ayuda|tutorial/.test(t)) {
      decir('Te muestro el sitio paso a paso.', porVoz);
      cerrar();
      if (window.ibsRecorrido) window.ibsRecorrido.iniciar();
      return;
    }

    // «mi pH es 5.8», «CO2 300», «materia orgánica 3,2»
    const numero = t.match(/(\d+(?:[.,]\d+)?)/);
    const param = PARAMS.find((p) => p.patron.test(t));
    if (param && numero) {
      if (!enInicio) {
        decir('La calculadora está en el inicio. Te llevo y lo cargás ahí.', porVoz);
        setTimeout(() => { window.location.href = BASE + '/#demo'; }, 900);
        return;
      }
      const sl = document.getElementById(param.id);
      const pedido = Number(numero[1].replace(',', '.'));
      const valor = Math.min(Number(sl.max), Math.max(Number(sl.min), pedido));
      sl.value = String(valor);
      sl.dispatchEvent(new Event('input', { bubbles: true }));
      const e = estadoActual();
      const ajuste = valor !== pedido ? ' (la barra va de ' + coma(sl.min) + ' a ' + coma(sl.max) + ', así que lo dejé en ' + coma(param.fmt(valor)) + ')' : '';
      decir('Listo: ' + param.nombre + ' ' + coma(param.fmt(valor)) + ajuste + '. El IBS queda en ' + coma(e.numero) + ', ' + e.estado.toLowerCase() + '. ' + e.desc, porVoz);
      iluminar(document.querySelector('[data-recorrido="puntaje"]'));
      return;
    }
    if (param && !numero) {
      decir('Decime el valor, por ejemplo: «' + param.nombre + ' ' + (param.id === 'sl_ph' ? '6,2' : '3') + '».', porVoz);
      return;
    }

    if (/qu[eé] hago|recomend|qu[eé] significa|c[oó]mo est[aá]/.test(t)) {
      if (!enInicio) { decir('Eso lo ves en la calculadora del inicio. Te llevo.', porVoz); setTimeout(() => { window.location.href = BASE + '/#demo'; }, 900); return; }
      const e = estadoActual();
      decir('Con IBS ' + coma(e.numero) + ' el suelo está ' + e.estado.toLowerCase() + '. ' + e.desc, porVoz);
      iluminar(document.getElementById('demo_desc'));
      return;
    }

    // Sólo si es un pedido («avisame…», «mandame…»), no una pregunta sobre el tema.
    const gol = /avis|mand|alert|record|prepar|quiero/.test(t) ? GOLONDRINA.find((g) => g.patron.test(t)) : null;
    if (gol) {
      const boton = document.querySelector('[data-accion="' + gol.accion + '"]');
      if (!boton) { decir('Golondrina está en la calculadora del inicio. Te llevo.', porVoz); setTimeout(() => { window.location.href = BASE + '/#golondrina'; }, 900); return; }
      if (boton.getAttribute('aria-pressed') !== 'true') boton.click();
      decir(gol.texto + ' Si querés que te llegue, conectá WhatsApp, Calendario o Mail ahí abajo.', porVoz);
      iluminar(document.getElementById('golondrina'));
      return;
    }

    const destino = DESTINOS.find((d) => d.patron.test(t));
    if (destino) {
      if (destino.ruta) {
        decir('Te llevo a ' + destino.nombre + '.', porVoz);
        setTimeout(() => { window.location.href = BASE + destino.ruta; }, 700);
        return;
      }
      const el = destino.objetivo ? document.querySelector('[data-recorrido="' + destino.objetivo + '"]') : document.getElementById(destino.ancla);
      if (el) { decir('Acá está ' + destino.nombre + '.', porVoz); iluminar(el); }
      else { decir('Te llevo a ' + destino.nombre + '.', porVoz); setTimeout(() => { window.location.href = BASE + '/#' + (destino.ancla || ''); }, 700); }
      return;
    }

    decir('Todavía entiendo pedidos simples, como «mi pH es 5,8», «llevame al blog» o «avisame cuándo remuestrear».', porVoz);
  }

  $('.asistente_form').addEventListener('submit', (e) => {
    e.preventDefault();
    const t = input.value;
    input.value = '';
    entender(t, false);
  });
  $('.asistente_chips').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) entender(b.textContent, false);
  });

  // ---------- Voz ----------
  const mic = $('.asistente_mic');
  let rec = null;
  if (mic) {
    mic.addEventListener('click', () => {
      if (rec) { rec.stop(); return; }
      try {
        rec = new Reconocedor();
      } catch (e) {
        decir('No pude usar el micrófono en este navegador. Escribí tu pedido.', false);
        return;
      }
      rec.lang = 'es-AR';
      rec.interimResults = true;
      rec.continuous = false;
      let final = '';
      mic.setAttribute('aria-pressed', 'true');
      input.placeholder = 'Te escucho…';
      rec.onresult = (ev) => {
        final = Array.prototype.map.call(ev.results, (r) => r[0].transcript).join(' ');
        input.value = final;
      };
      rec.onerror = (ev) => {
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') decir('Para hablarme, permití el micrófono en el navegador. Mientras tanto, podés escribir.', false);
      };
      rec.onend = () => {
        mic.setAttribute('aria-pressed', 'false');
        input.placeholder = 'Ej.: mi pH es 5.8';
        rec = null;
        if (final.trim()) { input.value = ''; entender(final, true); }
      };
      rec.start();
    });
  }

  // ---------- Se adelanta ----------
  function avisar(texto, objetivo) {
    if (window.ibsRecorrido && window.ibsRecorrido.activo()) return;
    if (!panel.hidden) { decir(texto, false); iluminar(objetivo); return; }
    burbuja.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = texto;
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = 'Abrir asistente';
    b.addEventListener('click', abrir);
    const x = document.createElement('button');
    x.type = 'button';
    x.className = 'asistente_burbuja_x';
    x.setAttribute('aria-label', 'Cerrar aviso');
    x.innerHTML = '<i class="bi bi-x" aria-hidden="true"></i>';
    x.addEventListener('click', () => { burbuja.hidden = true; });
    burbuja.append(x, p, b);
    burbuja.hidden = false;
    iluminar(objetivo);
  }

  if (enInicio) {
    const sliders = ['sl_co2', 'sl_mo', 'sl_ph', 'sl_temp'].map((id) => document.getElementById(id));
    let tocado = false;
    let ultimoPhAvisado = null;
    let espera = null;

    sliders.forEach((sl) => sl.addEventListener('input', (e) => {
      if (!e.isTrusted) return; // los movimientos del recorrido o del asistente no cuentan
      tocado = true;
      if (sl.id !== 'sl_ph') return;
      clearTimeout(espera);
      espera = setTimeout(() => {
        const ph = Number(sl.value);
        const fuera = ph < 5.5 ? 'bajo' : ph > 8 ? 'alto' : null;
        if (!fuera || fuera === ultimoPhAvisado) return;
        ultimoPhAvisado = fuera;
        avisar('Un pH de ' + coma(ph.toFixed(1)) + ' es ' + (fuera === 'bajo' ? 'muy ácido' : 'muy alcalino') + ' para la vida del suelo. Mirá la recomendación.', document.getElementById('demo_desc'));
      }, 1200);
    }));

    // Si alguien mira la calculadora un rato sin tocar nada, le muestra qué mover (una vez).
    const demo = document.getElementById('demo');
    let quieto = null;
    let mostrado = false;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entradas) => {
        const enPantalla = entradas[0].isIntersecting;
        clearTimeout(quieto);
        if (!enPantalla || tocado || mostrado) return;
        quieto = setTimeout(() => {
          if (tocado || mostrado) return;
          mostrado = true;
          avisar('Mové cualquiera de las cuatro barras con los datos de tu muestra y mirá cómo cambia el puntaje.', document.querySelector('[data-recorrido="deslizadores"]'));
        }, 15000);
      }, { threshold: 0.5 }).observe(demo);
    }
  }
})();
