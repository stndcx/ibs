# Golondrina en la demo del IBS (prototipo)

Rama `feat/golondrina-seguimiento`. Debajo de los sliders de la demo
(`#demo` en `src/index.md`) aparece un bloque **Golondrina**: acciones de un
clic que toman el resultado del índice y lo convierten en un seguimiento
concreto del lote.

| Acción | Qué muestra |
| --- | --- |
| Avisame cuándo remuestrear | Fecha de la próxima muestra según el estado (crítico 30 días, bajo 60, moderado 90, bueno y excelente 365) |
| Avisame para medir compactación | Aviso 24–48 h después de la próxima lluvia o riego (capacidad de campo) |
| Mandame el informe | Índice, estado y acción recomendada |
| Alertame si el IBS baja | Alerta si el valor cae por debajo del piso del estado actual, con sensores de CO₂ y temperatura |

Las acciones activas se recalculan en vivo al mover los sliders. Cada una
muestra qué va a hacer Golondrina, cuándo, y una vista previa del aviso. Los
canales (WhatsApp, Calendario, Mail) se conectan con un clic, y al conectar
uno se envía en el acto lo que estaba esperando por él ("Conectar WhatsApp y
activar" → "Enviando por WhatsApp…" → aviso entregado). Si el canal ya estaba
conectado, la acción se envía directo.

**Es todo simulado en el navegador**: no hay backend, no se conecta a cuentas
reales y no se manda nada. No cambia la fórmula ni la demo existente.

## Archivos

- `src/assets/js/golondrina.js`: acciones, canales y `ejecutarAccion` (el
  único punto a reemplazar por llamadas reales cuando exista la integración).
- `src/index.md`: el bloque dentro de la sección de la demo.
- `src/_layouts/default.html`: carga el script y le pasa el IBS y el estado en
  cada cambio de slider (`window.golondrinaActualizar`).
- `src/assets/css/style.css`: estilos `.golondrina*` al final del archivo.

## Cómo verlo

`cd src && bundle exec jekyll serve` y abrir la sección **Probar el índice**.
