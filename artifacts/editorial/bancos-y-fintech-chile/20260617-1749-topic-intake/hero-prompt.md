# Hero image prompt — bancos-y-fintech-chile

> Prompt manual para crear el hero del nuevo artículo en tu app de generación
> (la "App de React" / gpt-image-1). El sitio es Astro: la creación del hero es
> **manual** (el pipeline generó `scripts/hero-images/prompts.json` para los 50
> posts publicados, pero el blog file de este pilar aún no existe). Cuando se
> publique, `prompts.json` se regenerará; este prompt está alineado con esa casa
> de estilo para que el resultado coincida.

## Metadata (alineada con scripts/hero-images)

| Campo | Valor | Por qué |
|---|---|---|
| slug | `bancos-y-fintech-chile` | — |
| targetImagePath | `/images/hero/bancos-y-fintech-chile.avif` | destino del hero (G9 del publish-packet) |
| palette | **#475569** — "Banca / Instituciones / Referencia técnica" | la paleta de `config.mjs` más on-theme para bancos/fintech |
| primaryIntent | `explicar` | pilar educativo que explica tipos de cuenta y banco vs. fintech |
| toneClass | `educativo` | — |
| template / promptTrack | `A` — Human Editorial Scene | track humano por defecto |
| readerSituation | Persona eligiendo dónde tener su dinero / abriendo una cuenta básica | — |
| canvas | 1200x630, landscape | igual que el resto de heros |
| paleta alternativa | #4f46e5 "Educativo / Conceptos / Guías" | si prefieres encuadre educativo en vez de institucional |

## Prompt para pegar en la app de imagen

```
Create a flat editorial vector illustration for a trusted personal finance publication.
Use simple controlled shapes, a minimal but expressive scene, and a calm human tone. Keep it unmistakably editorial, not photoreal, not stock-finance, and not app-marketing art.
Background: solid color #475569. Mostly flat color background with room for one gentle grounding shape or tonal separation if it improves hierarchy. No gradients, no glow, no texture noise, and no glossy effects.
Scene: one simplified human figure standing and calmly considering a choice, in a recognizable everyday banking moment — deciding where to keep their money.
Place one dominant financial object near the figure: a debit/bank card held in the hand. Add at most one supporting contextual cue if it strengthens the moment: a simple institutional building facade shape suggesting a bank, set back in the scene.
Include one simplified human figure or visible hands performing a readable gesture so the image feels like an everyday financial moment, not a sterile diagram.
Allow one controlled depth cue through overlap, scale contrast, or a simple grounding shape. Keep the illustration flat but not sterile.
Lighting: soft and even. One simple shadow block or grounding shape is allowed if it helps hierarchy. No cinematic lighting, no photoreal depth, and no glossy rendering.
Keep shapes crisp, controlled, and simplified, with enough variation in scale and overlap to feel editorial rather than diagrammatic clipart.
Color palette: 4 to 5 flat colors maximum. Keep the palette restrained, with one softer accent allowed for warmth or hierarchy.
Composition: build the main action in the left or center-left area, with asymmetry, clear focal hierarchy, and breathing room on the right. Keep key elements inside the safe area.
No text, no letters, no numbers, no logos, no brand marks, and no symbols that read like UI labels anywhere in the image. Do not render any bank or fintech logo, app screen, or fake user interface.
Canvas: 1200x630 pixels, landscape.
Avoid photorealism, 3D rendering, CGI, neon, fake UI, clutter, golden-coin finance clichés, credit-card-logo clichés, and malformed interfaces.
```

## Notas

- **Sin logos ni UI falsa**: en un tema de bancos/fintech el modelo tiende a inventar
  logos de bancos y pantallas de app — el prompt lo prohíbe explícitamente (clave para
  neutralidad: el artículo NO recomienda marcas).
- Tras generar la imagen: exportar a AVIF y dejarla en `public/images/hero/bancos-y-fintech-chile.avif`
  (base .avif = desktop; no hay sufijo `@desktop`). Eso cierra la gate G9 del publish-packet.
- `heroImage: /images/hero/bancos-y-fintech-chile.avif` irá en el frontmatter del blog file
  al crearlo (paso posterior al sign-off).
