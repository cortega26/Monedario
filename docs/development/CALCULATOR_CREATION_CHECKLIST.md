# Calculator Creation Checklist

Procedimiento de cierre para una calculadora nueva o recién publicada. Complementa `CHANGE_CONTROL_PROTOCOL.md` y no reemplaza el pipeline editorial YMYL cuando corresponda.

## Antes de implementar

- Declarar scope, owner/intent y no canibalización para la nueva superficie.
- Identificar fórmula, redondeo, vigencia, exclusiones y fuentes primarias oficiales.
- Citar los invariantes/contratos afectados y crear ADR si cambia ruta, contrato, capa o semántica CI.

## Implementación mínima

- Motor puro con tests de ambas direcciones/casos límite y errores de entrada.
- Página con las superficies estándar de confianza, metodología, exclusiones y fecha de fuente.
- Registro en `CALCULATOR_PORTFOLIO` y test de descubrimiento, sin contadores manuales frágiles cuando exista una aserción estructural equivalente.
- Fuentes externas específicas: enlazar la página que respalda la afirmación, no una portada temática inferida.

## Cierre antes de publicar

1. Ejecutar `pnpm run test` y `pnpm run check`.
2. Ejecutar `pnpm run build:ci` para validar el HTML que realmente se publicará.
3. Ejecutar `pnpm run check:urls:external:ci`; cualquier `blocking=true` impide publicar.
4. Para cambios de ruta/RSS/canonical, ejecutar además `pnpm run check:no-postid-urls`, `pnpm run check:routes` y `pnpm run check:rss`.
5. Revisar manualmente que nombre, artículo/norma, tasa, fórmula y URL describan la misma fuente; un HTTP 200 no valida la exactitud jurídica.
6. Registrar evidencia, riesgo y rollback en el plan/change-control record y actualizar el artefacto de seguimiento.

El gate externo de PR es la red de seguridad final. La revisión de la URL específica durante el desarrollo evita esperar al job de sitio completo para descubrir un 404.
