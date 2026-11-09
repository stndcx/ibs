# Recorrido «¿Cómo se usa?» y asistente del IBS

Implementa la propuesta «IBS — Propuesta de recorrido guiado y asistentes»
(3 de noviembre de 2026): Fase 1 (recorrido) y Fase 2 (asistente por voz y
texto, sin librerías ni servidor).

## Fase 1: recorrido guiado

- **Botón «¿Cómo se usa?»** en la barra de arriba, afuera del menú: en celular
  el menú se oculta (`.nav_links { display: none }` debajo de 600 px) y el
  botón sigue a la vista. En el blog, las notas y el mapa lleva al inicio y
  arranca el recorrido ahí (`/?recorrido`).
- **Primera visita:** aparece solo la primera vez (`localStorage`:
  `ibs.recorrido.inicio`); después, solo con el botón.
- **Estilo:** colores y tipografías del sitio (`--tierra`, `--arena`, DM Serif
  Display, JetBrains Mono) y borde amarillo en la parte iluminada. Diálogo
  modal: foco atrapado, ESC cierra, flechas ← → cambian de paso.

| # | Qué se ilumina | Frase |
| --- | --- | --- |
| 1 | Barra de arriba (en celular, la barra entera) | Desde acá vas a cualquier parte del sitio. |
| 2 | Botón «Probar el índice» | Tocá acá para medir tu suelo. |
| 3 | Los 4 deslizadores | Mové cada barra con los datos de tu muestra. |
| 4 | El número y su color (antes, el deslizador de CO₂ se mueve solo y vuelve a su lugar) | Este es el puntaje de tu suelo, de 0 a 100. |
| 5 | La recomendación | Acá te dice qué hacer con ese suelo. |
| 6 | Tabla de decisión | Qué significa cada rango y qué hacer en cada caso. |
| 7 | Compactación | Si el suelo está duro, el resultado real baja. Acá ves cuánto. |
| 8 | Agenda | Reuniones abiertas a las que te podés sumar. |
| 9 | Mapa (nuevo link en la barra) | Mirá en el mapa los resultados de cada zona. |

Decisiones sobre lo que quedaba pendiente de aprobación (fáciles de revertir):
- **Mapa:** se agregó a la barra de arriba y como paso 9. En celular el menú
  está oculto, así que ese paso se saltea (el asistente igual lleva al mapa).
- **Error del blog:** arreglado. El código de la calculadora ahora corre solo
  si existen los deslizadores; antes fallaba en el blog y en las notas.

## Fase 2: asistente por voz y texto

Botón «Asistente» abajo a la derecha (`src/assets/js/asistente.js`). Usa el
reconocimiento de voz del navegador (Chrome, Edge y Safari; en Firefox el
micrófono no aparece y se escribe). Si el pedido llegó por voz, responde
también en voz alta.

Entiende pedidos simples:
- «mi pH es 5.8», «CO2 300», «materia orgánica 3,2», «temperatura 18» → mueve
  el deslizador, recalcula y dice el resultado.
- «¿qué hago con este suelo?» → lee la recomendación y la ilumina.
- «llevame al blog / al mapa / a la agenda / a la fórmula…» → navega.
- «avisame cuándo remuestrear», «mandame el informe», «alertame si baja» →
  activa la acción de Golondrina.
- «¿cómo se usa?» → arranca el recorrido.

Se adelanta sin que le pidas nada (una vez cada cosa):
- pH fuera de rango (menos de 5,5 o más de 8) → avisa e ilumina la recomendación.
- Alguien mira la calculadora 15 s sin tocarla → le muestra qué mover.

**Fase 3** (no incluida): entender cualquier frase necesita una IA en un
servidor, porque la clave no puede quedar en una página pública. Podría ir
sobre el microservicio de `v8/api`.

## Archivos

- `src/assets/js/recorrido.js`, `src/assets/js/asistente.js`: bloques aparte
  de la calculadora.
- `src/_layouts/default.html`: botón, link al mapa, arreglo del blog y carga
  de los scripts.
- `src/index.md`: atributos `data-recorrido` en lo que se ilumina.
- `src/assets/css/style.css`: estilos al final del archivo.
