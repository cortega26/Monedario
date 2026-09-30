# Prompt — re-verificación adversarial TD-0108 (correcciones de la auditoría)

> Copia íntegra en una **sesión fresca**, de otra familia que el agente que
> corrigió. Rol: verificador editorial adversarial (YMYL).

---

Role: verificador editorial adversarial (YMYL).

Contexto: la verificación del `articleLead` de 7 artículos (TD-0108) devolvió
**NO PASS** (1 defecto alto + 2 medios). Las correcciones se aterrizaron en
`c4920bce` (PR #616). Re-verifica de forma independiente contra fuente primaria
y cuerpo; no confíes en el corrector.

Verifica (con `curl -sI/-sL`, `grep` y el gate):

1. **`como-cambiarse-de-afp`** (defecto alto):
   - El plazo del traspaso en `answer` **y** cuerpo debe estar respaldado por
     la fuente primaria SP «Traspaso a otra AFP»
     (`https://www.spensiones.cl/portal/institucional/594/w3-propertyvalue-9915.html`):
     «la afiliación en la nueva AFP se produce el primer día del mes siguiente
     a la fecha de suscripción de la Orden de Traspaso».
   - Sin contradicción interna entre answer y cuerpo; sin plazos no respaldados.
   - Etiquetas de fuentes correctas (9915 = Traspaso a otra AFP; 9585 =
     Rentabilidad) y ambas 200.
   - `validAsOf`, `updatedDate` y la prosa de revisión alineados (2026-09-30).
2. **`fraude-tarjeta-que-hacer`** (medio): CMF a la URL canónica
   (`.../623/w4-propertyvalue-48790.html`, 200) con rótulo «Reclamos contra
   entidades supervisadas»; SERNAC específica («Especial Ley de Fraude», 200).
3. **`ahorro-e-inversion-en-chile-...-2026`** (medio): rótulo de CMF-988 =
   «Fondos Mutuos» (título real de la página), consistente con el cuerpo.
4. **`fondos-mutuos-comisiones-rescate-impuestos`** (bajo): incluye SII-1428
   («Fondos mutuos no rescatados», 200) además de 8415.
5. **Invariantes del alcance**: los 3 sin `validAsOf`
   (`fraude-tarjeta-que-hacer`, `ahorro-e-inversion-...`,
   `fondos-mutuos-...`) siguen sin declararlo y el gate reporta
   `missingValidAsOf=3`; `stale=0` y `drift=0`; 7/7 `nextStepHref` existen;
   `que-es-el-ipc`, `que-es-la-uf` y `reajuste-arriendo` sin cambios respecto
   de la pasada anterior (OK).

Reglas: no arregles nada (reporta); evidencia ejecutable (comandos + salida);
veredicto por artículo y global — **PASS solo si quedan 0 defectos altos o
medios abiertos**; registra commit verificado y limitaciones.
