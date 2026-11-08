/* Golondrina en la demo del IBS: acciones de un clic según el estado del suelo.
   Golondrina es el motor de avisos de TecnoRosario (sensores + WhatsApp).

   PROTOTIPO: todo es simulado en el navegador. No se conecta a cuentas reales
   ni manda nada. Para la integración real, el único punto a reemplazar es
   `ejecutarAccion` (hoy arma el resultado localmente).

   La demo (src/_layouts/default.html) llama a `window.golondrinaActualizar(ibs, estado)`
   cada vez que se mueve un slider; las acciones activas se recalculan con el
   valor nuevo. */
(function () {
  const raiz = document.getElementById('golondrina');
  if (!raiz) return;

  // Cada cuánto remuestrear según el estado (tabla de decisión del README).
  const REMUESTREO_DIAS = { 'CRÍTICO': 30, 'BAJO': 60, 'MODERADO': 90, 'BUENO': 365, 'EXCELENTE': 365 };
  // Piso de cada estado: si el IBS baja de acá, cambia de categoría.
  const PISO = { 'CRÍTICO': 0, 'BAJO': 31, 'MODERADO': 51, 'BUENO': 71, 'EXCELENTE': 86 };

  const CANALES = [
    { id: 'whatsapp', nombre: 'WhatsApp', que: 'Avisos e informes por mensaje', icono: 'bi-whatsapp' },
    { id: 'calendario', nombre: 'Calendario', que: 'Fechas de muestreo en tu agenda', icono: 'bi-calendar3' },
    { id: 'mail', nombre: 'Mail', que: 'Informe PDF del lote', icono: 'bi-envelope' },
  ];

  const ACCIONES = [
    { id: 'remuestreo', titulo: 'Avisame cuándo remuestrear', bajada: 'Según el estado de este suelo', canal: 'calendario', icono: 'bi-calendar-check' },
    { id: 'compactacion', titulo: 'Avisame para medir compactación', bajada: 'Cuando el lote esté en capacidad de campo', canal: 'whatsapp', icono: 'bi-cloud-rain' },
    { id: 'informe', titulo: 'Mandame el informe', bajada: 'Índice, estado y acción recomendada', canal: 'mail', icono: 'bi-file-earmark-text' },
    { id: 'alerta', titulo: 'Alertame si el IBS baja', bajada: 'Con sensores de CO₂ y temperatura en el lote', canal: 'whatsapp', icono: 'bi-graph-down-arrow' },
  ];

  const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const fecha = (dias) => {
    const f = new Date();
    f.setDate(f.getDate() + dias);
    return `${f.getDate()} ${MESES[f.getMonth()]} ${f.getFullYear()}`;
  };

  let ibs = 0;
  let estado = { label: '', desc: '' };
  const canales = { whatsapp: false, calendario: false, mail: false };
  let activas = []; // ids, la última activada primero
  let timer = null;

  function ejecutarAccion(id) {
    const valor = ibs.toFixed(1);
    switch (id) {
      case 'remuestreo': {
        const dias = REMUESTREO_DIAS[estado.label] || 90;
        return {
          regla: 'Recordarte la próxima muestra de este lote',
          cuando: `${fecha(dias)} (en ${dias} días)`,
          detalle: [`Estado actual: ${estado.label} (${valor}).`, estado.desc],
          aviso: `🧪 Toca remuestrear el lote. Último IBS: ${valor} (${estado.label}).`,
        };
      }
      case 'compactacion':
        return {
          regla: 'Avisarte para medir compactación con penetrómetro',
          cuando: 'Entre 24 y 48 h después de la próxima lluvia o riego',
          detalle: ['Es la ventana de capacidad de campo: seco sobreestima, saturado subestima.'],
          aviso: '🌧️ Llovió hace 24 h: el lote está en capacidad de campo. Buen momento para el penetrómetro.',
        };
      case 'informe':
        return {
          regla: 'Mandarte el informe de esta muestra',
          cuando: 'Ahora',
          detalle: [`IBS ${valor} · ${estado.label}`, `Acción: ${estado.desc}`],
          aviso: `📄 Tu informe IBS está listo: ${valor} (${estado.label}).`,
        };
      case 'alerta': {
        const piso = PISO[estado.label] || 0;
        return {
          regla: piso > 0 ? `Alertarte si el IBS baja de ${piso}` : 'Alertarte si el IBS sigue bajando',
          cuando: 'Apenas lo detecten los sensores',
          detalle: ['Lectura continua de CO₂ y temperatura con el módulo Golondrina en el lote.'],
          aviso: piso > 0
            ? `⚠️ El IBS del lote bajó de ${piso}: pasó a la categoría de abajo. Revisá el manejo.`
            : `⚠️ El IBS del lote sigue bajando (${valor}). Enmienda orgánica urgente.`,
        };
      }
    }
  }

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = (sel) => raiz.querySelector(sel);

  function renderEstado() {
    $('[data-g="estado"]').textContent = `${estado.label} · ${ibs.toFixed(1)}`;
  }

  function renderAcciones() {
    $('[data-g="acciones"]').innerHTML = ACCIONES.map((a) => {
      const on = activas.includes(a.id);
      return `<li><button type="button" class="golondrina_accion" data-accion="${a.id}" aria-pressed="${on}">
        <span class="golondrina_accion_top"><i class="bi ${a.icono}" aria-hidden="true"></i>${on ? '<i class="bi bi-check2" aria-label="Activada"></i>' : ''}</span>
        <span class="golondrina_accion_titulo">${a.titulo}</span>
        <span class="golondrina_accion_bajada">${a.bajada}</span></button></li>`;
    }).join('');
  }

  function renderResultados() {
    const cont = $('[data-g="resultados"]');
    cont.hidden = activas.length === 0;
    $('[data-g="reglas"]').innerHTML = activas.map((id) => {
      const r = ejecutarAccion(id);
      const a = ACCIONES.find((x) => x.id === id);
      const c = CANALES.find((x) => x.id === a.canal);
      return `<li class="golondrina_regla">
        <div class="golondrina_regla_top"><strong>${esc(r.regla)}</strong>
          <button type="button" class="golondrina_quitar" data-quitar="${id}" aria-label="Quitar: ${esc(r.regla)}"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div>
        <p class="golondrina_cuando"><i class="bi bi-clock" aria-hidden="true"></i> ${esc(r.cuando)}</p>
        <ul>${r.detalle.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
        ${canales[a.canal] ? '' : `<button type="button" class="golondrina_falta" data-canal="${c.id}">Conectar ${c.nombre} para que te llegue →</button>`}
      </li>`;
    }).join('');
  }

  function renderAviso(animar) {
    const cont = $('[data-g="aviso"]');
    if (!activas.length) { cont.innerHTML = ''; return; }
    const id = activas[0];
    const r = ejecutarAccion(id);
    const a = ACCIONES.find((x) => x.id === id);
    const canal = canales[a.canal] ? CANALES.find((x) => x.id === a.canal).nombre : null;
    const cuando = r.cuando === 'Ahora' || r.cuando.startsWith('Apenas') ? 'ahora' : 'programado';
    cont.innerHTML = `<p class="golondrina_aviso_label">Así te va a llegar ${canal ? 'por ' + canal : 'al celular'}:</p>
      <div class="golondrina_aviso${animar ? ' golondrina_aviso--entra' : ''}">
        <svg class="golondrina_logo golondrina_logo--chico" aria-hidden="true"><use href="#golondrina-logo"/></svg>
        <div><p class="golondrina_aviso_head"><span>Golondrina${canal ? ' · ' + canal : ''}</span><span>${cuando}</span></p>
        <p class="golondrina_aviso_msg">${esc(r.aviso)}</p></div></div>`;
  }

  function renderCanales() {
    $('[data-g="canales"]').innerHTML = CANALES.map((c) => `<li class="golondrina_canal">
      <i class="bi ${c.icono} golondrina_canal_icono" aria-hidden="true"></i>
      <span class="golondrina_canal_txt"><strong>${c.nombre}</strong><span>${c.que}</span></span>
      <button type="button" class="golondrina_conectar" data-canal="${c.id}" aria-pressed="${canales[c.id]}">${canales[c.id] ? '<i class="bi bi-check2" aria-hidden="true"></i> Conectado' : 'Conectar'}</button>
    </li>`).join('');
  }

  function activar(id) {
    activas = [id, ...activas.filter((x) => x !== id)];
    renderAcciones();
    renderResultados();
    $('[data-g="aviso"]').innerHTML = '';
    clearTimeout(timer);
    timer = setTimeout(() => renderAviso(true), 700);
  }

  raiz.addEventListener('click', (e) => {
    const t = e.target.closest('[data-accion],[data-quitar],[data-canal]');
    if (!t) return;
    if (t.dataset.accion) activar(t.dataset.accion);
    else if (t.dataset.quitar) {
      activas = activas.filter((x) => x !== t.dataset.quitar);
      renderAcciones(); renderResultados(); renderAviso(false);
    } else if (t.dataset.canal) {
      canales[t.dataset.canal] = !canales[t.dataset.canal];
      renderCanales(); renderResultados(); renderAviso(false);
    }
  });

  window.golondrinaActualizar = function (nuevoIbs, nuevoEstado) {
    ibs = nuevoIbs;
    estado = nuevoEstado;
    renderEstado();
    renderResultados();
    renderAviso(false);
  };

  renderAcciones();
  renderCanales();
})();
