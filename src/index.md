---
layout: default
title: IBS — Índice de Bioactividad del Suelo
description: Índice científico de bioactividad del suelo que integra respiración microbiana, materia orgánica, pH y temperatura
---

<!-- HERO -->
<section class="hero">
  <div class="hero_eyebrow">Proyecto abierto · Agtech · Argentina</div>
  <h1 class="hero_titulo">
    El suelo tiene un <span>número.</span><br>
    Ahora podés medirlo.
  </h1>
  <p class="hero_bajada">
    IBS es un índice científico de bioactividad del suelo: integra respiración microbiana,
    materia orgánica, pH y temperatura en un único valor accionable (0–100),
    con recomendaciones de manejo automáticas.
  </p>
  <div class="hero_acciones">
    <a href="#demo" class="btn_primario" data-recorrido="probar">Probar el índice</a>
    <a href="https://github.com/stndcx/ibs" target="_blank" class="btn_secundario"><i class="bi bi-github"></i> Ver en GitHub</a>
  </div>
</section>

<!-- DEMO INTERACTIVA -->
<section class="indice_demo" id="demo">
  <div data-recorrido="puntaje">
    <div class="indice_estado" id="demo_estado">MODERADO</div>
    <div class="indice_numero" id="demo_numero">63.4</div>
    <div class="indice_barra_wrap">
      <div class="indice_barra_fill" id="demo_barra"></div>
    </div>
  </div>
  <p class="indice_desc" id="demo_desc" data-recorrido="recomendacion">
    Aplicar bioestimulante microbiano liviano. Remonitorear en 90 días.
  </p>

  <div class="demo_sliders" data-recorrido="deslizadores">
    <div class="slider_item">
      <label class="slider_label">
        CO₂
        <span class="slider_valor" id="val_co2">280</span>
      </label>
      <input type="range" id="sl_co2" min="30" max="600" value="280">
    </div>
    <div class="slider_item">
      <label class="slider_label">
        MO %
        <span class="slider_valor" id="val_mo">2.4</span>
      </label>
      <input type="range" id="sl_mo" min="0.3" max="6" step="0.1" value="2.4">
    </div>
    <div class="slider_item">
      <label class="slider_label">
        pH
        <span class="slider_valor" id="val_ph">6.5</span>
      </label>
      <input type="range" id="sl_ph" min="4.5" max="9" step="0.1" value="6.5">
    </div>
    <div class="slider_item">
      <label class="slider_label">
        Tem. °C
        <span class="slider_valor" id="val_temp">21</span>
      </label>
      <input type="range" id="sl_temp" min="5" max="40" step="0.5" value="21">
    </div>
  </div>

  <!-- GOLONDRINA: acciones de un clic según el estado (prototipo, ver GOLONDRINA.md) -->
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <symbol id="golondrina-logo" viewBox="0 0 100 115"><path d="M 50 6 L 89 19 C 89 62 80 92 50 110 C 20 92 11 62 11 19 Z" fill="#0B1220" stroke="#22D3EE" stroke-width="6" stroke-linejoin="round"/><path d="M66 40 H42 L32 50 V70 L42 80 H58 L66 72 V62 H52" fill="none" stroke="#F1F5F9" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="66" cy="40" r="6" fill="#22D3EE"/><circle cx="52" cy="62" r="6" fill="#22D3EE"/></symbol>
  </svg>
  <div class="golondrina" id="golondrina">
    <div class="golondrina_head">
      <svg class="golondrina_logo" aria-hidden="true"><use href="#golondrina-logo"/></svg>
      <div>
        <p class="golondrina_titulo">Golondrina se encarga del seguimiento</p>
        <p class="golondrina_sub">Tocá una acción y te aviso donde vos me dejes. Este suelo: <strong data-g="estado"></strong></p>
      </div>
    </div>

    <h3 class="golondrina_label">Acciones para este lote</h3>
    <ul class="golondrina_acciones" data-g="acciones"></ul>

    <div data-g="resultados" aria-live="polite" hidden>
      <div data-g="aviso"></div>
      <h3 class="golondrina_label">Lo que voy a hacer</h3>
      <ul class="golondrina_reglas" data-g="reglas"></ul>
    </div>

    <h3 class="golondrina_label">¿Dónde te aviso?</h3>
    <ul class="golondrina_canales" data-g="canales"></ul>

    <p class="golondrina_nota">Prototipo: no se conecta a tus cuentas ni manda nada.</p>
  </div>
</section>

<!-- FÓRMULA -->
<section id="formula">
  <div class="formula_section">
    <h2 class="seccion_titulo">La fórmula</h2>
    <p class="seccion_sub">
      Abierta, documentada y ajustable por zona climática.
      Los pesos reflejan la importancia relativa de cada parámetro en la actividad biológica del suelo.
    </p>
    <div class="formula_bloque">
      <span class="comentario"># Índice de Bioactividad del Suelo</span><br>
      IBS = (<span class="clave">CO2_norm</span>  × 0.40) +
            (<span class="clave">MO_norm</span>   × 0.30) +
            (<span class="clave">pH_score</span>  × 0.20) +
            (<span class="clave">Temp_score</span> × 0.10)
      <br><br>
      <span class="comentario"># Normalización lineal (CO₂ y MO)</span><br>
      valor_norm = (medicion - rango_min) / (rango_max - rango_min)
      <br><br>
      <span class="comentario"># Curva gaussiana (pH y Temperatura)</span><br>
      ph_score   = exp(-0.5 × ((ph   - 6.5) / 1.2)²)<br>
      temp_score = exp(-0.5 × ((temp - 22.0) / 8.0)²)
    </div>
    <div class="params_grid">
      <div class="param_card">
        <div class="param_nombre">CO₂ — Respiración basal</div>
        <div class="param_peso">40%</div>
        <div class="param_detalle">mg CO₂ / kg suelo / día. Indicador directo de actividad microbiana. Rango: 30–600.</div>
      </div>
      <div class="param_card">
        <div class="param_nombre">Materia Orgánica</div>
        <div class="param_peso">30%</div>
        <div class="param_detalle">Porcentaje en muestra seca. Sustrato energético de los microorganismos. Rango: 0.3–6.0%.</div>
      </div>
      <div class="param_card">
        <div class="param_nombre">pH del suelo</div>
        <div class="param_peso">20%</div>
        <div class="param_detalle">Regula disponibilidad de nutrientes y comunidades microbianas. Óptimo biológico: 6.0–7.0.</div>
      </div>
      <div class="param_card">
        <div class="param_nombre">Temperatura</div>
        <div class="param_peso">10%</div>
        <div class="param_detalle">Factor corrector de cinética biológica. °C a 10 cm de profundidad. Óptimo: 15–28°C.</div>
      </div>
    </div>
  </div>

  <div class="formula_section" data-recorrido="compactacion">
    <h2 class="seccion_titulo">Compactación - El Enfoque IBS</h2>
    <p class="seccion_sub">Busca la pérdida de rendimiento asociada a la resistencia a la penetración.</p>
    <h3 class="seccion_titulo_h3">Factor de Compactación</h3>
    <p class="seccion_sub_com">Representa la fracción del potencial productivo que se mantiene frente a una resistencia mecánica determinada del suelo.<br><br>Cuando el suelo se compacta, las raíces tienen dificultad para crecer, explorar agua y nutrientes y sostener el cultivo en momentos críticos. Aunque el suelo tenga buena biología, la compactación puede impedir que ese potencial se exprese.<br><br>El enfoque IBS no mide la compactación como un problema aislado. Evalúa cuánto del potencial productivo del suelo se pierde cuando la resistencia mecánica dificulta el crecimiento radicular.<br><br>Un suelo puede estar biológicamente sano, pero funcionalmente limitado.</p>
    <div class="formula_bloque">
      <span class="comentario"># Función Logística (Sigmoide)</span><br>
      Factor = 1 / (1 + e^(a·(kPa - b)))<br><br>
      <span class="comentario"># Resultado</span><br>
      IBS Funcional = IBS base × Factor
    </div>
    <p class="seccion_sub_com">El IBS funcional permite separar potencial de limitaciones reales, ayudando a decidir dónde conviene intervenir y dónde no.</p>
  </div>
</section>

<!-- ESTADOS -->
<section class="estados_section" id="estados" data-recorrido="tabla">
  <div class="estados_inner">
    <h2 class="seccion_titulo">Tabla de decisión</h2>
    <p class="seccion_sub">El IBS no solo mide — recomienda. Cada rango activa un protocolo de manejo específico.</p>

    <div class="estados_lista">
      <div class="estado_card" style="--color:#EF4444">
        <div class="estado_rango">0 – 30</div>
        <div class="estado_nombre">Crítico</div>
        <div class="estado_accion">Enmienda orgánica urgente. Suspender labranza 90 días. Remonitorear en 45 días.</div>
      </div>
      <div class="estado_card" style="--color:#F97316">
        <div class="estado_rango">31 – 50</div>
        <div class="estado_nombre">Bajo</div>
        <div class="estado_accion">Incorporar compost. Rotación de cultivos. Reducir herbicidas de contacto.</div>
      </div>
      <div class="estado_card" style="--color:#CA8A04">
        <div class="estado_rango">51 – 70</div>
        <div class="estado_nombre">Moderado</div>
        <div class="estado_accion">Bioestimulante microbiano liviano. Mantener cobertura. Monitorear pH.</div>
      </div>
      <div class="estado_card" style="--color:#16A34A">
        <div class="estado_rango">71 – 85</div>
        <div class="estado_nombre">Bueno</div>
        <div class="estado_accion">Mantener manejo actual. Registrar prácticas. Muestra anual.</div>
      </div>
      <div class="estado_card" style="--color:#2563EB">
        <div class="estado_rango">86 – 100</div>
        <div class="estado_nombre">Excelente</div>
        <div class="estado_accion">No intervenir. Documentar como caso de referencia.</div>
      </div>
    </div>
  </div>
</section>

<!-- MODELO ML -->
<section id="modelo">
  <div class="ml_section">
    <div>
      <h2 class="seccion_titulo">Modelo ML</h2>
      <p class="seccion_sub" style="margin-bottom:1.5rem">
        Un Random Forest Regressor entrenado sobre dataset sintético de 3.000 registros
        con ruido gaussiano aprende los patrones no lineales que la fórmula ponderada no captura.
        Mejora con datos reales de campo a medida que se incorporan.
      </p>
      <p style="font-size:0.85rem;color:var(--grafito);line-height:1.7">
        El modelo y el dataset son públicos. La fórmula base actúa como fallback
        si el microservicio no está disponible. Los pesos son ajustables por zona climática.
      </p>
    </div>
    <div class="ml_metricas">
      <div class="metrica_item">
        <span class="metrica_nombre">Algoritmo</span>
        <span class="metrica_valor">Random Forest</span>
      </div>
      <div class="metrica_item">
        <span class="metrica_nombre">Estimadores</span>
        <span class="metrica_valor">200</span>
      </div>
      <div class="metrica_item">
        <span class="metrica_nombre">Dataset</span>
        <span class="metrica_valor">3.000 registros</span>
      </div>
      <div class="metrica_item">
        <span class="metrica_nombre">MAE esperado</span>
        <span class="metrica_valor">&lt; 3.5 pts</span>
      </div>
      <div class="metrica_item">
        <span class="metrica_nombre">R²</span>
        <span class="metrica_valor">&gt; 0.97</span>
      </div>
      <div class="metrica_item">
        <span class="metrica_nombre">Microservicio</span>
        <span class="metrica_valor">Flask / Python</span>
      </div>
    </div>
  </div>
</section>

<!-- INTEGRACIONES / NEGOCIO -->
<section class="negocio_section" id="integraciones">
  <div class="negocio_inner">
    <h2 class="seccion_titulo">Cómo trabajar con IBS</h2>
    <p class="seccion_sub">
      El índice es abierto. Los informes profesionales y las integraciones son el producto.
    </p>
    <div class="canales_grid">
      <div class="canal_card">
        <div class="canal_icono"><i class="bi bi-file-earmark-pdf" style="color: #F5F0E8; font-size: 2rem;"></i></div>
        <div class="canal_nombre">Informes por demanda</div>
        <div class="canal_desc">
          Ingresás los parámetros de tu muestra y recibís un informe PDF profesional
          con el índice, la interpretación y el plan de acción firmado.
        </div>
      </div>
      <div class="canal_card">
        <div class="canal_icono"><i class="bi bi-buildings" style="color: #F5F0E8; font-size: 2rem;"></i></div>
        <div class="canal_nombre">Integración B2B</div>
        <div class="canal_desc">
          Si tenés una plataforma agro, podés integrar el motor IBS vía API.
          Tus clientes generan informes desde tu sistema, vos mantenés la marca.
        </div>
      </div>
      <div class="canal_card">
        <div class="canal_icono"><i class="bi bi-git" style="color: #F5F0E8; font-size: 2rem;"></i></div>
        <div class="canal_nombre">Contribución abierta</div>
        <div class="canal_desc">
          Datos reales de campo, revisión de pesos por zona, nuevos parámetros.
          El índice mejora con cada contribución validada científicamente.
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ===== AGENDA ===== -->
<section class="sec sec--agenda" id="agenda" data-recorrido="agenda" style="background: var(--pergamino);">
  <div class="sec__contenedor">
    <p class="sec__eyebrow">Agenda abierta</p>
    <h2 class="sec__titulo">Próximas instancias</h2>
    <p class="sec__desc">Reuniones, revisiones y sprints abiertos a la comunidad. Todos los eventos son de participación libre salvo indicación.</p>

    <div class="agenda">
      {% assign hoy = site.time | date: "%Y-%m-%d" %}
      {% assign eventos = site.events | sort: 'date' %}
      {% assign eventos_vigentes = "" | split: "" %}

      {% for event in eventos %}
        {% assign fecha_evento = event.date | date: "%Y-%m-%d" %}
        {% if fecha_evento >= hoy %}
          {% assign eventos_vigentes = eventos_vigentes | push: event %}
        {% endif %}
      {% endfor %}

      {% for event in eventos_vigentes limit: 5 %}
        {% assign dia = event.date | date: "%d" %}
        {% assign mes = event.date | date: "%b" %}
        {% assign fecha_evento = event.date | date: "%Y-%m-%d" %}
        {% assign es_hoy = false %}
        {% if fecha_evento == hoy %}{% assign es_hoy = true %}{% endif %}

        <div class="agenda__item{% if es_hoy %} agenda__item--hoy{% endif %}">
          <div class="agenda__fecha">
            <span class="agenda__dia">{{ dia }}</span>
            <span class="agenda__mes">{{ mes }}</span>
            {% if es_hoy %}
              <span class="agenda__badge">Hoy</span>
            {% endif %}
          </div>
          <div class="agenda__contenido">
            <h3 class="agenda__titulo">{{ event.title }}</h3>
            <p class="agenda__meta">
              {{ event.time }}
              <span class="agenda__tipo agenda__tipo--{{ event.type }}">
                {% case event.type %}
                  {% when 'remoto' %}Remoto
                  {% when 'presencial' %}Presencial
                  {% when 'asincronico' %}Asincrónico
                {% endcase %}
              </span>
            </p>
            <a href="{{ event.link }}"
               {% if event.link contains 'http' %}target="_blank"{% endif %}
               class="agenda__link">
              <i class="{{ event.link_icon }}" aria-hidden="true"></i> {{ event.link_text }}
            </a>
          </div>
        </div>
      {% else %}
        <p class="agenda__vacio">No hay eventos programados. ¡Próximamente!</p>
      {% endfor %}
    </div>

    <p class="sec__nota">
      ¿Querés proponer un evento?
      <a href="https://github.com/stndcx/ibs/issues" target="_blank">Abrí un issue en GitHub</a>
    </p>
  </div>
</section>

<section class="empresas_section" id="empresas">
  <div class="empresas_inner">
    <h2 class="seccion_titulo">Proyectos y espacios colaboradores</h2>
    <p class="seccion_sub">Iniciativas y proyectos que apoyan al IBS proporcionando espacios físicos o virtuales, difusión, comunicación y contextos de aplicación y experimentación.</p>
    <div class="empresas_grid">
      <div class="empresa_card" style="border-left: 4px solid #8B5CF6;">
        <div class="empresa_badge tech">
          <i class="bi bi-bookmark-fill"></i>
        </div>
        <div class="empresa_logo">
          <img src="{{ site.baseurl }}/assets/images/reservanatural_tigre.jpg" loading="lazy">
        </div>
        <div class="empresa_info">
          <div class="empresa_nombre">Reserva Natural Tigre</div>
          <div class="empresa_rol">Experimentación en entorno real</div>
          <div class="empresa_contacto">
            <a href="https://www.instagram.com/reservanatural.tigre" target="_blank"><i class="bi bi-instagram"></i></a>
            <a href="https://www.facebook.com/ReservaNaturalTigre" target="_blank"><i class="bi bi-facebook"></i></a>
          </div>
        </div>
      </div>
      <div class="empresa_card" style="border-left: 4px solid #8B5CF6;">
        <div class="empresa_badge tech">
          <i class="bi bi-bookmark-fill"></i>
        </div>
        <div class="empresa_logo">
          <img src="{{ site.baseurl }}/assets/images/comunidadverde.jpg" loading="lazy">
        </div>
        <div class="empresa_info">
          <div class="empresa_nombre">Comunidad Verde ONG</div>
          <div class="empresa_rol">Contexto y validación ambiental</div>
          <div class="empresa_contacto">
            <a href="https://comunidadverde.ar" target="_blank"><i class="bi bi-globe2"></i></a>
            <a href="https://www.instagram.com/comunidadverde.ong" target="_blank"><i class="bi bi-instagram"></i></a>
          </div>
        </div>
      </div>
    </div>
    <div class="empresas_grid">
      <div class="empresa_card" style="border-left: 4px solid #8B5CF6;">
        <div class="empresa_badge tech">
          <i class="bi bi-bookmark-fill"></i>
        </div>
        <div class="empresa_logo">
          <img src="{{ site.baseurl }}/assets/images/whatido_logo.jpg" loading="lazy">
        </div>
        <div class="empresa_info">
          <div class="empresa_nombre">whatIDO_</div>
          <div class="empresa_rol">Comunidad IT Argentina</div>
          <div class="empresa_contacto">
            <a href="https://whatido.tech/" target="_blank"><i class="bi bi-globe2"></i></a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="colaboradores_section" id="colaboradores">
  <div class="colaboradores_inner">
    <h2 class="seccion_titulo">Colaboradores</h2>
    <p class="seccion_sub">Personas que construyen y mejoran el Índice IBS</p>
    <div class="colaboradores_grid">
      <div class="colaborador_card">
        <div class="colaborador_avatar">
          <img src="{{ site.baseurl }}/assets/images/pablo_kosak.jpg" loading="lazy">
        </div>
        <div class="colaborador_info">
          <div class="colaborador_nombre">Pablo Kosak</div>
          <div class="colaborador_rol">T&eacute;cnico Agr&oacute;nomo</div>
          <div class="colaborador_contacto">
            <a href="mailto:kosakpablo@gmail.com" target="_blank"><i class="bi bi-send"></i></a>
          </div>
        </div>
      </div>
      <div class="colaborador_card">
        <div class="colaborador_avatar">
          <img src="{{ site.baseurl }}/assets/images/facundo_martinez.jpg" loading="lazy">
        </div>
        <div class="colaborador_info">
          <div class="colaborador_nombre">Facundo Martínez</div>
          <div class="colaborador_rol">Software Engineer</div>
          <div class="colaborador_contacto">
            <a href="https://www.linkedin.com/in/fxmartinez" target="_blank"><i class="bi bi-linkedin"></i></a>
            <a href="https://github.com/fx-biocoder" target="_blank"><i class="bi bi-github"></i></a>
          </div>
        </div>
      </div>
      <div class="colaborador_card">
        <div class="colaborador_avatar">
          <img src="{{ site.baseurl }}/assets/images/andreshoyos.jpg" loading="lazy">
        </div>
        <div class="colaborador_info">
          <div class="colaborador_nombre">Andrés Hoyos</div>
          <div class="colaborador_rol">Software Architect</div>
          <div class="colaborador_contacto">
            <a href="https://www.linkedin.com/in/andreshoyos/" target="_blank"><i class="bi bi-linkedin"></i></a>
            <a href="https://github.com/andres-victor-hoyos" target="_blank"><i class="bi bi-github"></i></a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA FINAL -->
<section class="cta_section">
  <h2 class="seccion_titulo">¿Querés integrar o colaborar?</h2>
  <p class="seccion_sub">
    Buscamos empresas agro, laboratorios y agrónomos que quieran usar o mejorar el índice.
    El código es abierto. La conversación también.
  </p>
  <div class="cta_acciones">
    <a href="https://github.com/stndcx/ibs" target="_blank" class="btn_tierra"><i class="bi bi-github"></i> Ver el repositorio</a>
    <a href="https://github.com/stndcx/ibs/issues" target="_blank" class="btn_borde">Abrir un issue</a>
  </div>
</section>