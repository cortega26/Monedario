# Prompt — auditoría independiente de `articleLead` (TD-0108)

> Copia íntegra en una **sesión fresca** (sin historial de la autoría), de otra
> familia que el agente que redactó. Rol: verificador editorial adversarial.

---

Role: verificador editorial adversarial (YMYL).

Contexto: se agregó el bloque `articleLead` (answer + covers + limits + fuentes
oficiales + `validAsOf`) a **7 artículos** de Monedario (TD-0108). Verifica de
forma independiente, contra el cuerpo del artículo y **fuentes primarias**; no
confíes en el autor ni en sus resúmenes.

Alcance (7 slugs):

1. `como-cambiarse-de-afp`
2. `fraude-tarjeta-que-hacer`
3. `ahorro-e-inversion-en-chile-instrumentos-costos-impuestos-2026`
4. `fondos-mutuos-comisiones-rescate-impuestos`
5. `que-es-el-ipc-chile-como-se-calcula`
6. `que-es-la-uf`
7. `reajuste-arriendo-uf-ipc-chile`

Para cada uno verifica:

- **`answer`**: respuesta directa, correcta y consistente con el cuerpo del
  artículo; sin afirmaciones no respaldadas ni promesas.
- **`covers` / `limits`**: cubren y limitan lo que el artículo realmente hace.
- **`officialSources`**: URL vigente (resuelve 200), dominio oficial y
  pertinente al contenido citado.
- **`validAsOf`** (solo `como-cambiarse-de-afp`, `que-es-el-ipc-chile-como-se-calcula`,
  `que-es-la-uf`, `reajuste-arriendo-uf-ipc-chile`): el dato debe estar
  respaldado por la fuente/dataset citado; los otros 3 **deben seguir en cola
  de auditoría** (sin `validAsOf`) y el gate debe reportarlos como
  `missingValidAsOf=3`.
- **`nextStepHref`**: enlace interno existente y pertinente.

Fuentes primarias sugeridas: Superintendencia de Pensiones, CMF Educa, SERNAC,
SII, INE, Banco Central (`si3.bcentral.cl`), BCN/leychile.

Reglas:

- **No arregles nada**: reporta hallazgos; no modifiques `src/`.
- Evidencia ejecutable: `curl -sI` a cada URL oficial, `grep` del cuerpo para
  contrastar cada afirmación del `answer`, y salida del gate de timeliness.
- Veredicto por artículo (OK / observación con severidad alta-media-baja) y
  veredicto global; si hay observaciones, lista el texto exacto y la corrección
  propuesta (sin aplicarla).
- Registra commit verificado, comandos y salida. Evidencia en el mensaje o en
  `docs/reports/` (a tu criterio), sin tocar `docs/editorial/audits/`.
