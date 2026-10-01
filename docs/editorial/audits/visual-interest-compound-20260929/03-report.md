# Paquete pendiente — gráficos de interés compuesto

Estado: PENDING_EXECUTION. No se ha realizado auditoría independiente.
Autor del candidato: DraftAgent/implementación, familia GPT.
Veredicto: sin emitir. Revisión humana: pendiente.

El candidato representa siete hitos transcritos de la tabla del artículo,
mediante barras con origen cero. Se omitió cualquier trayectoria entre hitos,
crisis intermedia y secuencia de aportes: no existe una serie mensual original
localizada que permita reproducirlas. La conversión de cierre deriva del mismo
archivo de datos en ambas variantes.

El pass del 17-09 confirmó conversiones de moneda, con un alcance que dejó
expresamente series/lagunas y otros supuestos sin auditar. Sus conclusiones no
certifican USD 129.495 ni los seis hitos anteriores. El dataset los conserva con
procedencia editorial, estado pendiente y límites explícitos.

Candidatos: `output/hero-images/compound-review/` (no publicados). Incluye PNG y
SVG para hero e imagen interior, CSV, descripción textual y manifiesto con
hashes. Generador: `scripts/render_compound_interest_charts.py`.

## Bloqueos de publicación

- Auditoría matemática independiente del origen de los checkpoints y del alcance
  permitido para la presentación; protocolo v1, sesión fresca y distinta familia.
- Revisión de cumplimiento editorial y firma humana, aún pendientes.
- Reemplazo coordinado de la leyenda actual del artículo: describe una curva y
  aportes mensuales que las barras no representan. Incluir tabla accesible.
- No cambiar `public/` hasta completar ese ciclo. El renderer solo genera
  borradores rotulados y rechaza destinos bajo `public/` o `src/`.

Las pruebas técnicas de reproducción y formato no satisfacen esos bloqueos.
