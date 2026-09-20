# Guía de respuestas en Reddit (borrador asistido)

Estado: vigente desde 2026-09-20 · Verificador: `reddit-monitor/reply_lint.py` · Contexto: `docs/adr/ADR-20260919-reddit-single-monitor.md`

## Principio

**La IA prepara el borrador; una persona decide, edita y envía.** Nada se publica solo. El ahorro de tiempo está en redactar y en decidir a qué hilos vale la pena entrar, no en pulsar "publicar".

Por qué no se publica en automático:

- Reddit y las reglas de cada sub penalizan las cuentas que responden en automático y enlazan un sitio: se arriesga la cuenta personal y la reputación de la marca en la comunidad que se quiere ganar.
- Es contenido financiero (YMYL): una cifra o un plazo equivocado expone a quien firma la respuesta.
- Decidir cuándo **no** responder es lo difícil. En la etiquetación de septiembre de 2026, solo 3 de 57 matches fueron accionables (5 %).

## 1. ¿Respondo o no?

Se prepara borrador solo si se cumplen **las cinco**:

1. Es una **pregunta** o un pedido de consejo del propio autor del hilo (no un comentario de otro usuario).
2. Es del tema: finanzas personales, trabajo y previsión, impuestos, deudas o inversión en Chile.
3. Puedes **sumar algo** que todavía no está en el hilo. Si ya hay 3 o más respuestas sustantivas que cubren lo importante, no se responde (etiqueta `ya_resuelto`).
4. El hilo es reciente (idealmente menos de 24 horas) y no está cerrado ni bloqueado.
5. No es un caso delicado: fraude en curso, quiebra, litigio o urgencia legal pasan directo a una persona, sin borrador.

Ejemplo real de "no responder": el hilo "sueldo necesario?" (r/Santiago) tenía 14 comentarios que ya cubrían colchón de 6 meses, tope de arriendo, pieza compartida, presupuesto con cifras y mes de garantía.

## 2. Voz

Español de Chile, informal y casual, como una persona de Reddit: tuteo, frases cortas, "yo en tu lugar…", "ojo con…", "depende de…". Sin tono de cátedra ni de manual.

### Regla dura: nunca emojis

**Nunca, bajo ninguna circunstancia, emojis ni símbolos decorativos** (checks, estrellas, flechas, banderas, caritas). Delatan de inmediato redacción de IA. El verificador los trata como error.

### Evitar el "AI slop"

- Sin halagos ni eco de la pregunta ("excelente pregunta", "claro que sí").
- Sin cierres de asistente ("espero que esto te ayude", "no dudes en escribirme", "¿te gustaría que…?").
- Sin muletillas de manual ("es importante destacar", "cabe mencionar", "en resumen", "hoy en día").
- Sin raya larga (—), sin negritas, sin títulos, sin listas largas. Es un comentario, no un artículo.
- Sin exclamaciones en cadena ni entusiasmo fingido.
- Sin trío de ideas perfectamente equilibradas: una respuesta real suele tener una idea principal y un matiz.
- Largo ideal: hasta 120 palabras. Más de 180 se rechaza.

### Nunca inventar experiencia

No decir "a mí me pasó", "mi amigo", "en mi experiencia" ni "como ex financial manager" salvo que la persona que firma lo confirme como cierto. Fingir experiencia propia es engañar a la comunidad. Se puede hablar en general: "lo que suele pasar es…", "yo en tu lugar…".

## 3. Contenido y seguridad

- **Cifras que cambian** (UF, UTM, topes, tasas, porcentajes): solo con fuente verificada; si no, se dice "revisa el valor actual" y se remite a la fuente oficial.
- **Sin asesoría personalizada:** consejos generales y preguntas para afinar ("cuéntame el plazo y si tienes deudas"). Nada de "invierte tu plata en X".
- **Enlace: por defecto, ninguno.** Solo si la página aporta algo que no cabe en el comentario (una calculadora, un cálculo). Con enlace es obligatorio decir que eres del equipo de Monedario y usar UTM (`utm_link.py`).
- **No repetir** lo que ya dijeron otros ni escribir lo mismo en dos hilos.
- **Reglas de cada sub:** revisar las de autopromoción antes de enlazar. `ChileInversiones` tiene hilos semanales de promoción; ahí es donde corresponde mencionar herramientas propias.
- **Ritmo:** unas 2 o 3 respuestas por semana; nunca más de una por hilo.

## 4. Flujo

1. La IA lee el hilo completo (post y comentarios) y decide con la regla de la sección 1. Si no cumple, propone la etiqueta (`ya_resuelto`, `tema_sin_accion` o `ruido`) en vez de un borrador.
2. Si procede, escribe el borrador y lo pasa por el verificador: `python3 reply_lint.py < borrador.txt` (`--enlace` si lleva enlace a propósito). Un `ERROR` bloquea el borrador; un `AVISO` se revisa a mano.
3. La persona lo lee, lo edita a su gusto y lo envía desde su cuenta. Después lo marca como atendido en la cola (con UTM si hubo enlace).

## 5. Ejemplos

Pregunta tipo: "Tengo 8 millones, ¿qué hago?".

Bien:

> Yo partiría por el colchón, unos 3 a 6 meses de gastos en una cuenta remunerada o un DAP corto. Después vería si hay deudas caras, porque esa tarjeta se come cualquier ganancia, y recién ahí invertiría lo que sobre según cuándo lo vayas a necesitar. Cuéntame plazo y si tienes deudas y afinamos.

Mal (el verificador lo rechaza por halago, muletillas, negritas, raya larga y cierre de asistente):

> Excelente pregunta. Es importante destacar que **lo primero** es armar un fondo de emergencia — en resumen, ahorra y luego invierte. Espero que esto te ayude, no dudes en escribirme.

## 6. Qué no se hace

- No publicar automáticamente ni sin revisión humana.
- No usar varias cuentas ni votar de forma artificial.
- No enlazar donde el contenido no aporta.
- No usar emojis.

## Cambios a esta guía

Cualquier cambio en las reglas duras (emojis, publicación, divulgación) se refleja también en `reply_lint.py` y en sus tests.
