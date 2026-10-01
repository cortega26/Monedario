# Arquitectura editorial y de confianza (E-E-A-T / YMYL)

Fecha: 2026-09-29 · Rama: `feat/eeat-arquitectura-confianza`

Principio: no optimizar para parecer confiable; construir un sistema cuya
confiabilidad pueda auditarse. **No se crea `/eeat/`** ni ninguna página cuya
función sea declarar cumplimiento.

## Responsabilidades por página

| Página | Pregunta que responde |
|---|---|
| `/acerca-de/` | Qué es Monedario, por qué existe y quién responde por él |
| `/autor/` | Entity home: quién es el autor, credenciales y límites profesionales |
| `/metodologia/` | Documento maestro: cómo se produce, verifica y corrige la información |
| `/como-usamos-los-datos/` | Procedencia de los datos entre la fuente y el número publicado |
| `/correcciones/` | (futuro) qué se corrigió, por qué y qué control se añadió |

## Auditoría inicial (NOW) — estado

- `/autor/`: ya tenía `ProfilePage` → `mainEntity` `Person` (`@id` = `/autor/`),
  credenciales, límites profesionales visibles y formulario `#reportar-error`.
  Sin cambios.
- `Article.author` (`ArticleJsonLd.astro`): ya referenciaba `@id` = `/autor/`.
  Se alineó `sameAs` con el de `/autor/` (se añadió `authorPortfolio`).
- `/metodologia/`: title y H1 nuevos; se añadieron las secciones jerarquía de
  fuentes, integridad factual, completitud material, vigencia, revisión
  especializada proporcional, correcciones y "Por qué aplicamos este estándar"
  (E-E-A-T/YMYL breve, sin afirmar puntuación ni certificación). IA, pruebas de
  calculadoras y separación de roles ya estaban cubiertas.
- Enlazado institucional: `Metodología` añadido al footer; `/acerca-de/` enlaza
  ahora también a `/como-usamos-los-datos/`.

## Diseño de `/correcciones/` (no publicar vacía)

Publicar solo cuando exista al menos una corrección material que merezca
registro público. Candidatas a evaluar: remediaciones del plan 115 (D17–D25).
La decisión de publicar y el texto de cada entrada son **humanos**.

Campos por entrada: fecha · página afectada · qué estaba incorrecto · qué se
corrigió · a quién podía afectar · periodo afectado · fuente usada para
corregir · control adoptado para evitar recurrencia.

Excluir erratas y cambios de estilo. Al publicarla: enlazar desde
`/metodologia/#correcciones` y footer; snapshot de rutas.

## NEXT

1. Auditoría factual externa (black-box) sobre un snapshot de producción.
2. Auditoría interna (white-box) sobre el mismo snapshot; consolidar por causa raíz.
3. Remediación sistémica + control de regresión por cada P0/P1.
4. Enlace discreto "Reportar un error" en contenido YMYL (hoy solo en
   `/autor/` y `/metodologia/`), prellenando la URL. **Hecho (#628).**
5. Bloque de verificación compacto en páginas YMYL críticas (autor, vigencia,
   fuentes, metodología, reportar error) sin badges ni revisiones inexistentes.
   **Hecho (#628):** bloque en artículos vía `PostDetails` y enlace de reporte
   en calculadoras vía `MethodologyBlock`.

## LATER

- Publicar `/correcciones/` (ver arriba).
- Métricas operativas internas (no "E-E-A-T score"): % claims de alto riesgo
  con fuente primaria, % parámetros con vigencia explícita, contradicciones
  activas, páginas con vigencia vencida, P0/P1 sin control de regresión.
- Revisores especializados en subconjuntos de alto riesgo cuando el
  costo/beneficio lo justifique.
