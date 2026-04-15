# Concerns

Inventario breve de riesgos y fricciones visibles desde la documentacion y el sistema de validacion actual.

## Legibilidad para agentes

- La capa de gobernanza y validacion es fuerte, pero la orientacion para nuevos agentes depende de leer varios documentos distintos antes de actuar.
- Los entry points principales existen, aunque estaban repartidos entre `README.md`, `START_HERE.md`, `context/` y runbooks operativos.

## Bootstrap y entorno

- El repositorio fija Node y pnpm, pero no expone una plantilla versionada de entorno local.
- Parte del comportamiento de datos economicos depende de modo `live` o `snapshot`, lo que conviene hacer mas explicito en bootstrap.

## Riesgos operativos

- El numero de gates es alto; si no se entra por los runbooks correctos, un contributor puede perder tiempo descubriendo validaciones por fallo y no por anticipacion.
- La calidad del sistema depende tanto de scripts de validacion como de la disciplina documental; cuando el indice local queda incompleto, baja la navegabilidad aunque las reglas existan.

## Deuda/documentacion a vigilar

- Mantener `docs/codebase/` completo y alineado con la implementacion real.
- Evitar que `README.md` y `START_HERE.md` diverjan de los runbooks activos.
- Revisar periodicamente si los docs de contexto siguen siendo suficientes para cold start sin lectura exploratoria adicional.

## Evidence

- `START_HERE.md`
- `README.md`
- `docs/codebase/README.md`
- `docs/operations/runbooks/task-cookbook.md`
- `package.json`
- `.github/workflows/ci.yml`