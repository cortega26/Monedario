# Gráficos reproducibles de interés compuesto — candidatos

Estado: implementación de revisión; publicación pendiente.
Preparado el 2026-09-30 con fuentes consultadas el 2026-09-29.
Plan: `docs/backlog/PLAN-renovacion-visual-editorial-2026-09-29.md`.

## Cambio y evidencia

Una fuente JSON contiene los siete checkpoints USD declarados por el artículo,
su procedencia y el FX final obtenido de la tabla SII. Un renderer matplotlib
fijado genera las dos variantes desde esa fuente. No reproduce una serie mensual
ni certifica el origen de los checkpoints. El dato final CLP usa aritmética
Decimal; los redondeos a peso entero y a millones son explícitos.

Se usan barras desde cero, etiquetas directas, unidades nominales y límites
visibles. Ambas piezas permanecen rotuladas como borradores. Los candidatos
incluyen CSV y descripción accesible para la futura integración; los artículos,
las URLs y los assets publicados no se modifican en este scope.

Matplotlib se instala en el entorno aislado del script mediante uv/PEP 723,
fijado a 3.10.6, con Python 3.13. Esto permite usar un motor de gráficos estándar
sin añadir dependencias al runtime web ni modificar manifests/lockfiles.
Tipografía: Inter local, con DejaVu Sans de matplotlib para glifos ausentes.

## Reproducción

```bash
uv run --python 3.13 --script scripts/render_compound_interest_charts.py
uv run --no-sync pytest tests/test_compound_interest_charts.py --no-cov
uv run --no-project --python 3.13 --with matplotlib==3.10.6 --with pytest==8.4.2 pytest tests/test_compound_interest_charts.py -o addopts=
uv run --no-sync ruff check scripts/render_compound_interest_charts.py tests/test_compound_interest_charts.py
pnpm run check:audit-artifacts
```

Salidas en `output/hero-images/compound-review/`. El manifiesto conserva hashes
de datos, renderer y cuatro imágenes; las salidas de verificación se conservan
en `docs/editorial/audits/visual-interest-compound-20260929/evidence/`.

## Verificación ejecutada

- Suite focalizada completa: 15 tests pasan en entorno aislado con matplotlib.
  El entorno base pasa 14 y omite únicamente la prueba gráfica opcional.
- Ruff y formato Python: correctos. Prettier de JSON/Markdown: correcto.
- `check:audit-artifacts`: plantilla nueva válida, `verdict=null`.
- `check:docs`: correcto.
- Dos renders con idénticos inputs produjeron los mismos cuatro hashes PNG/SVG.
- Inspección visual de ambas piezas: etiquetas y límites legibles, sin recortes.

Matplotlib emite una advertencia de deprecación de pyparsing en sus internals;
no afecta los resultados. No se ejecutó auditoría financiera independiente.

## Riesgo, revisión y rollback

Riesgo principal: confundir datos transcritos con una simulación auditada. El
estado pendiente, las etiquetas y el paquete independiente mantienen explícita
esa diferencia. La leyenda publicada actualmente no sirve para el nuevo gráfico
porque describe una curva y aportes mensuales: su sustitución forma parte de la
posterior integración editorial auditada.

Protocolo: `docs/editorial/AI_AUDIT_PROTOCOL.md`; paquete
`docs/editorial/audits/visual-interest-compound-20260929/`. El autor no emitió un
veredicto sobre su trabajo ni firmó gates. Rollback de esta preparación: retirar
sus archivos nuevos y candidatos; no requiere reversión de assets públicos.
