# Domain Invariants - Article

Fecha: 2026-02-28  
Contexto: `Content`  
Aggregate: `Article`

## 1) Identidad y SEO

### INV-001: `slug` obligatorio y único en artículos publicables

Regla:
- Todo `Article` publicable (`draft=false`) debe tener `slug`.
- No puede existir más de un artículo publicable con el mismo `slug`.

Válido:
```yaml
---
title: "..."
description: "..."
slug: deposito-a-plazo-uf-vs-pesos
pubDate: 2026-02-28T16:10:00Z
tags: [deposito-a-plazo, uf]
category: ahorro-inversion
draft: false
featured: false
---
```

Falla:
```yaml
---
title: "..."
description: "..."
pubDate: 2026-02-28T16:10:00Z
tags: [deposito-a-plazo, uf]
category: ahorro-inversion
draft: false
---
```

Error esperado:
- `Missing required field "slug" for publishable article`

### INV-002: estabilidad de identidad post-publicación

Regla:
- Un artículo ya publicado no puede cambiar `slug` sin declarar alias/redirect/canonical de compatibilidad.

Falla esperada:
- `Slug changed for published article without compatibility mapping`

### INV-003: `draft=true` excluye publicación

Regla:
- Si `draft=true`, el artículo no debe aparecer en listados, RSS ni sitemap.

Falla esperada:
- `Draft article leaked into publication outputs (list/rss/sitemap)`

## 2) Fechas

### INV-004: una sola semántica de fechas editoriales

Regla:
- Campos válidos: `pubDate`, `updatedDate`.
- Campos legacy (`pubDatetime`, `modDatetime`) prohibidos después de normalización.

Falla esperada:
- `Deprecated date field detected: pubDatetime`

### INV-005: fecha de publicación parseable con zona explícita

Regla:
- `pubDate` debe ser fecha ISO 8601 parseable, con `Z` u offset.

Falla:
```yaml
pubDate: 2026-02-28 16:10:00
```

Error esperado:
- `Invalid pubDate: must be ISO 8601 with timezone`

### INV-006: `updatedDate >= pubDate` cuando exista

Válido:
```yaml
pubDate: 2026-02-28T15:00:00Z
updatedDate: 2026-03-01T12:00:00Z
```

Falla:
```yaml
pubDate: 2026-03-01T12:00:00Z
updatedDate: 2026-02-28T15:00:00Z
```

Error esperado:
- `updatedDate must be greater than or equal to pubDate`

## 3) Tipos y defaults

### INV-007: `draft` y `featured` son boolean reales

Falla:
```yaml
draft: "false"
featured: "true"
```

Error esperado:
- `Invalid type for "draft": expected boolean`
- `Invalid type for "featured": expected boolean`

### INV-008: `tags` siempre array (default `[]`)

Regla:
- `tags` debe existir y ser array.
- Elementos no vacíos, trim, deduplicados case-insensitive.

Falla:
```yaml
tags: ahorro, inversion
```

Error esperado:
- `Invalid type for "tags": expected string[]`

### INV-009: `category` obligatoria y controlada

Regla:
- `category` debe existir en vocabulario permitido:
  - `ahorro-inversion`
  - `impuestos`
  - `prevision`
  - `deuda-credito`
  - `seguridad-financiera`
  - `empleo-ingresos`
  - `general`

Error esperado:
- `Invalid category value: "<valor>"`

## 4) Calidad mínima editorial/SEO

### INV-010: `title` no vacío y rango de longitud

Regla:
- Longitud: `20..110` caracteres.

Falla esperada:
- `title length out of range (20..110)`

### INV-011: `description` no vacía y rango de longitud

Regla:
- Longitud: `120..200` caracteres.

Falla esperada:
- `description length out of range (120..200)`

### INV-012: canonical válida cuando exista

Regla:
- `canonical` debe ser URL absoluta `https://`.

Falla esperada:
- `Invalid canonical URL: must be absolute https URL`

## 5) Visual identity (hero image)

### INV-015: `prompt` único por artículo en `prompts.json`

Regla:
- Cada entrada de `scripts/hero-images/prompts.json` debe tener un `prompt` distinto.
- Dos artículos no pueden compartir el mismo texto de prompt exacto.
- La `sceneId` de cada entrada debe ser única (refleja la escena visual específica del artículo).

Por qué importa:
- El router automático (`build-prompts.mjs`) asigna la misma plantilla de escena a artículos del mismo cluster. Sin corrección manual, artículos distintos sobre el mismo tema (ej. dos artículos de cesantía) terminan con prompts idénticos y, por tanto, imágenes visualmente indistinguibles.
- Hero images duplicadas no ayudan al lector a reconocer de qué trata el artículo antes de leer el título — objetivo central del sistema visual.

Falla esperada:
- `Duplicate prompt detected in prompts.json: ["slug-a", "slug-b"]`
- `Duplicate sceneId detected in prompts.json: ["slug-a", "slug-b"]`

Cómo detectar (antes de generar imágenes):
```bash
python3 -c "
import json
from collections import defaultdict
with open('scripts/hero-images/prompts.json') as f:
    data = json.load(f)
by_prompt = defaultdict(list)
for e in data['entries']:
    by_prompt[e['prompt']].append(e['slug'])
dupes = {p: slugs for p, slugs in by_prompt.items() if len(slugs) > 1}
print(f'Duplicate groups: {len(dupes)}')
for p, slugs in dupes.items():
    print('  DUPLICATES:', slugs)
    print('  Prompt:', p[:80])
"
```

Cómo corregir:
1. Identifica el grupo duplicado (slugs que comparten prompt).
2. Para cada artículo del grupo, edita su entrada en `prompts.json` directamente.
3. Elige props visuales únicos (objetos, postura, composición) que reflejen el tema específico del artículo. Ver guía en `docs/operations/runbooks/hero-images-runbook.md` § Prompt Uniqueness.
4. Actualiza `sceneId` al nuevo identificador (formato `Template:topic-escena`).
5. Recalcula `promptHash`: `echo -n "<prompt>" | sha256sum`.
6. Verifica cero duplicados antes de crear o actualizar hero images manualmente.

## 6) Compatibilidad runtime y deprecaciones

### INV-013: campos runtime no pueden ser "a veces"

Regla:
- Todo campo consumido por runtime debe existir o tener default explícito de schema.

Falla esperada:
- `Runtime-required field missing without default: <field>`

### INV-014: campos deprecados bloqueados tras normalización

Regla:
- Prohibidos: `pubDatetime`, `modDatetime`, `canonicalURL`.

Falla esperada:
- `Deprecated field not allowed: <field>`

