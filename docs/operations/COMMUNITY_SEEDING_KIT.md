# Kit de siembra en comunidades — Monedario

**Estado:** Activo · **Creado:** 2026-05-30 · **Tipo:** playbook operativo (trabajo humano)

Este kit es munición para participar en comunidades (Reddit, grupos de Facebook, foros, Quora)
**aportando valor primero**, con el enlace a Monedario como cierre opcional. No es para automatizar:
la siembra funciona porque la hace una persona real con criterio. Automatizarla = spam.

---

## Principio rector

> **Spam = empujas tu link. Siembra = resuelves el problema; el link es secundario.**
> Test: si borras la URL y tu respuesta **igual le sirve** a la persona, no es spam.

### Las 5 reglas

1. **Responde completo en el comentario.** Da el dato real. El link va al final, como "si quieres el monto exacto".
2. **Ratio ~10:1** aporte:promoción. Participa 9-10 veces sin link por cada vez que dejas uno.
3. **Solo en hilos donde la pregunta calza exacto.** No fuerces relevancia.
4. **Transparencia de autoría.** "Lo hice yo / soy de Monedario". Nunca link disfrazado de recomendación neutral.
5. **Vende el diferencial honesto:** gratis, sin registro, sin publicidad, no guarda datos. Eso desarma el escepticismo.

### Cadencia
2-3 respuestas útiles por semana, repartidas. Las ráfagas gatillan filtros de spam. Lee las reglas de
autopromoción de **cada** subreddit antes de postear (varios exigen el 9:1 y banean por menos).

---

## Datos verificados (a 2026-05) — usa estos, no inventes

- **Comisiones AFP** (cargo trabajador dependiente; sobre el imponible, aparte del 10% que va a tu fondo):
  Uno 0,46% · Modelo 0,58% · PlanVital 1,16% · Habitat 1,27% · Capital 1,44% · Cuprum 1,44% · ProVida 1,45%.
  El 10% de cotización es **igual en todas**; lo único que cambia es la comisión.
  *(Fuente de verdad en repo: `src/config/afpCommissions.ts`, validado mensual vs Previred.)*
- **UF:** cambia a diario; el valor del día lo publica el Banco Central. La calculadora usa el vigente.
- **Operación Renta 2026:** se declara en abril 2026 por rentas de 2025; el F22 del SII llega prellenado.
- **Regla de oro:** si el dato es volátil (UF, monto exacto), di "verifica el valor del día" y deja que la
  calculadora dé la cifra. Nunca afirmes un monto volátil como fijo.

---

## Respuestas-tipo (adapta al hilo real, no copies literal)

> Cada plantilla: **(1) dato útil que resuelve** → **(2) matiz que demuestra que sabes** → **(3) link opcional**.
> Reescribe con tus palabras y al tono del hilo; pegar literal se nota y se castiga.

### A. AFP / "¿cuánto me descuenta?" / "¿cuál es la más barata?"
> El 10% de tu imponible va siempre a **tu** fondo, sea cual sea la AFP — eso no se pierde. Lo único que
> cambia entre AFP es la **comisión**: hoy va desde 0,46% (Uno) hasta 1,45% (ProVida). O sea, en la más
> cara pagas casi 1% más de tu sueldo *solo en comisión*, por el mismo servicio. En sueldos altos o a
> largo plazo la diferencia pesa.
> *(cierre opcional)* Si quieres ver cuánto es en tu caso exacto, hice una calculadora gratis que compara
> las 7 AFP con tu sueldo, sin registro ni ads: monedario.cl/calculadoras/comisiones-afp/

**Calza con:** comisiones-afp · simulador-jubilacion · "cambiarse de AFP".

### B. Operación Renta / "¿me devuelven o pago?" / "simulador renta"
> Depende de si lo que te retuvieron en el año fue más o menos que tu impuesto final. Si te retuvieron de
> más (típico si tuviste honorarios o cambiaste de trabajo), hay devolución; si de menos, pagas la
> diferencia. El F22 del SII llega prellenado en abril, pero conviene estimarlo antes para no llevarte
> sorpresas.
> *(cierre opcional)* Armé un simulador gratis que estima si te devuelven o debes, con sueldos +
> honorarios + arriendos y descuentos de APV/retenciones: monedario.cl/calculadoras/operacion-renta/

**Calza con:** operacion-renta · boleta-honorarios-liquido · impuesto-segunda-categoria · apv.

### C. UF / "cuánto es X UF en pesos" / "por qué sube la UF"
> La UF se reajusta **todos los días** repartiendo la inflación (IPC) del mes anterior, por eso sube de a
> poco a diario. El valor del día lo publica el Banco Central. Para convertir, multiplicas los UF por el
> valor de hoy (ojo: cambia mañana).
> *(cierre opcional)* Si quieres la conversión al valor del día sin buscarlo a mano: monedario.cl/calculadoras/conversor-uf/

**Calza con:** conversor-uf · reajuste-arriendo · dividendo-hipotecario.

### D. Finiquito / despido / "¿cuánto me corresponde?"
> Depende de la causal y tus años: por años de servicio normalmente es un mes de remuneración por año
> (con tope), más aviso previo si no te avisaron con 30 días, más vacaciones proporcionales. La causal
> (necesidades de la empresa vs renuncia vs despido) cambia mucho el resultado.
> *(cierre opcional)* Hice una calculadora de finiquito gratis que separa indemnización, aviso previo y
> vacaciones según la causal: monedario.cl/calculadoras/finiquito-indemnizacion/

**Calza con:** finiquito-indemnizacion · seguro-cesantia · sueldo-liquido.

### E. Sueldo líquido / "de bruto a líquido" / "qué me descuentan"
> Del bruto te bajan: AFP (~10% + comisión), salud (7% o tu plan Isapre), seguro de cesantía (0,6% si
> tienes contrato indefinido) e impuesto único si superas el tramo exento. Lo que queda es el líquido.
> *(cierre opcional)* Calculadora gratis que hace el desglose completo: monedario.cl/calculadoras/sueldo-liquido/

**Calza con:** sueldo-liquido · descuentos-de-sueldo · sueldo-imponible-chile.

### F. Fonasa / "cómo paso de tramo A" / "qué letra me corresponde"

> El tramo no se elige: se calcula por tu ingreso imponible y tus cargas. Con 3
> o más cargas subes un tramo (de D a C, por ejemplo). Desde 2022 hay Copago
> Cero en la red pública para todos los tramos, así que "letra mejor" no
> siempre significa pagar menos en CESFAM/hospitales. Los umbrales cambian:
> confírmalos en fonasa.cl.
> *(cierre opcional)* Comparativa Fonasa vs Isapre con fuentes y copagos:
> monedario.cl/posts/fonasa-vs-isapre-comparativa/

**Calza con:** fonasa-vs-isapre-comparativa · sueldo-liquido (cotización salud).

### G. Tarjeta de crédito / "pago mínimo" / "me llegó el cupo"

> La trampa es el pago mínimo: desde junio de 2026 el piso es 100% del monto no
> financiable (intereses, comisiones) + 5% del monto financiable. Si te quedas
> ahí, la deuda dura años. Paga el total facturado o bastante más que el
> mínimo, y compara créditos por CAE, no por tasa.
> *(cierre opcional)* Calculadora gratis que muestra cuánto se estira la deuda
> según lo que pagues: monedario.cl/calculadoras/tarjeta-credito/

**Calza con:** tarjeta-credito · tarjeta-credito-costo-real-chile · cae-costo-real-credito-chile.

---

## Dónde sembrar (Chile)

| Canal | Notas |
|---|---|
| **Reddit** (subs que escucha el monitor: r/chile, r/Santiago, r/RepublicadeChile, r/FinanzasChile, r/AskChile, r/ChileInversiones, r/derechoenchile, r/ChileStartup) | Lee reglas de autopromo de cada sub; construye karma antes; ratio 9:1 estricto |
| **Grupos Facebook** finanzas personales Chile / emprendimiento | Más tolerantes; igual responde primero, link después |
| **Quora español** | Preguntas perennes ("cómo calcular finiquito") que rankean solas con el tiempo |
| **Foros** (p.ej. comunidades de inversión CL) | Alta intención; presencia sostenida > ráfaga |

## Qué NO hacer
- Pegar la misma respuesta literal en varios hilos (huella de spam).
- Dejar link sin responder la pregunta.
- Ocultar que eres el autor.
- Postear en hilos donde el tema no calza exacto.
- Afirmar montos volátiles (UF, montos AFP futuros) como fijos.

## Escuchar dónde sembrar (automático)

El monitor de Reddit (`reddit-monitor/`, ver `docs/operations/reddit-monitor/PLAYBOOK.md` y
`docs/adr/ADR-20260919-reddit-single-monitor.md`) revisa las comunidades cada hora, filtra por
intención, avisa por ntfy y deja los hilos en una cola web (`reddit.monedario.cl`) con la
calculadora sugerida cuando aplica. Flujo: **llega el aviso o abres la cola → abres este kit →
respondes con valor**. El monitor solo escucha; nunca postea por ti.

## Medir si funciona
Tras 2-3 semanas de siembra, re-corre `pnpm run data-signals:gsc:local` y mira si suben **clicks** e
**impresiones de marca** ("monedario") en `output/operations/data-signals/gsc/`. La siembra debería
mover clicks directos antes que rankings.
