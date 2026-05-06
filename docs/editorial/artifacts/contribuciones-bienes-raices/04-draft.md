# Gate 04 — Draft: contribuciones-bienes-raices-chile

Status: DRAFT — pending MathAuditAgent (ChatGPT) and ComplianceAgent (fresh Claude Code session)
Role: DraftAgent (Claude Code — Sprint 2B)
Fecha de corte: 2026-05-03
requires_calculation: true
regulatory_sensitivity: media-alta

> **SoD NOTICE**: DraftAgent = Claude Code Sprint 2B. Gate 05 → ChatGPT. Gate 06 → nueva sesión Claude Code.
> **TODO:SOURCE activos**: tasas (1,2%/1,0%), fechas cuotas TGR 2026, topes de exención primera vivienda y adultos mayores, condiciones DFL-2, deducibilidad F22 para arrendadores.

---

## TODO:SOURCE pendientes para MathAuditAgent

| # | Claim | Valor placeholder | Fuente a verificar | Estado post-remediación |
|---|---|---|---|---|
| C1 | Tasa general 1,2% | "~1,2%" | SII vigente | ELIMINADO — no verificable; artículo omite tasas |
| C2 | Tasa DFL-2 1,0% | "~1,0%" | SII/BCN DFL-2 | ELIMINADO — no verificable; artículo omite tasas |
| C3 | Calendario cuotas 2026 | "abril, junio, septiembre, noviembre (aprox.)" | TGR calendario 2026 | RESUELTO — 30 abril, 30 junio, 30 sept, 30 nov |
| C4 | Tope avalúo exención primera vivienda | No especificado | SII exenciones vigentes | DIFERIDO a SII (no verificado) |
| C5 | Condiciones exención adultos mayores | No especificadas | SII | DIFERIDO a SII (no verificado) |
| C6 | Deducibilidad en F22 para arrendadores | Descrito conceptualmente | Instrucción SII F22 | SUAVIZADO a condicional con deferred al SII |

---

## Cuerpo del artículo (body para src/data/blog/contribuciones-bienes-raices-chile.md)

> **Información vigente al 2026-05-03.** Las tasas de contribuciones, los montos de exención y las fechas exactas de pago se actualizan periódicamente. Verifica los valores vigentes en el [SII](https://www.sii.cl/) y la [TGR](https://www.tgr.cl/) antes de realizar cualquier pago o trámite.

Si tienes una propiedad en Chile, puede corresponder el pago de contribuciones de bienes raíces. Es un impuesto territorial anual que se cobra hasta en cuatro cuotas, aunque muchos propietarios de primera vivienda tienen exención total o parcial sin saberlo — conviene verificar en el SII antes de asumir que el cobro aplica.

## ¿Qué son las contribuciones de bienes raíces?

Las contribuciones de bienes raíces son el impuesto territorial que grava la propiedad inmueble en Chile. Lo administra el SII (determina el avalúo y las tasas) y lo recauda la TGR (Tesorería General de la República). No se cobra sobre el valor de mercado de la propiedad, sino sobre el **avalúo fiscal** — un valor oficial fijado por el SII, generalmente inferior al precio de mercado.

## ¿Cómo se calcula el monto?

La base de cálculo es el **avalúo fiscal** de tu propiedad — un valor oficial fijado por el SII, generalmente inferior al precio de mercado. La tasa exacta que aplica depende de la clasificación de tu propiedad y del régimen tributario correspondiente.

La tasa vigente se consulta directamente en el [SII](https://www.sii.cl/), donde también puedes verificar el avalúo fiscal y el monto de contribuciones determinado para tu propiedad.

**Para conocer el monto que te corresponde**: si ya recibiste un aviso de pago de la TGR, ese es el monto oficial para el período. Si no has recibido aviso o quieres verificar el avalúo, ingresa al portal del [SII](https://www.sii.cl/).

## Cuotas y calendario de pago

Las contribuciones se pagan en **4 cuotas anuales**, con vencimientos el **30 de abril**, **30 de junio**, **30 de septiembre** y **30 de noviembre**. Las fechas exactas de cada año se publican en el portal de la [TGR](https://www.tgr.cl/) — verifica el calendario vigente para 2026 antes del primer vencimiento.

**Canales de pago habilitados:**

- Portal en línea del SII o TGR.
- App TGR.
- Bancos y casas comerciales habilitadas.
- Caja vecina y ServiEstado.

## Exenciones: quiénes pagan menos o nada

### Primera vivienda

Los propietarios cuya única propiedad es su vivienda habitual pueden acceder a exención total o parcial si el avalúo fiscal no supera el tope legal vigente. Las condiciones exactas (tope de avalúo, porcentaje de exención) se verifican en el SII — el sistema aplica la exención automáticamente si el SII tiene los datos actualizados. Si crees tener derecho y no aparece aplicada, inicia el trámite en el SII.

### Adultos mayores (65 años o más)

Propietarios de 65 años o más con propiedad de avalúo bajo cierto umbral pueden solicitar una reducción de contribuciones. Las condiciones exactas (avalúo máximo, situación socioeconómica) se verifican directamente en el [SII](https://www.sii.cl/).

### DFL-2 — Vivienda económica

Las propiedades acogidas al régimen conocido popularmente como DFL-2 o vivienda económica, actualmente regido por el [Decreto 1101](https://www.bcn.cl/leychile/navegar?i=16842), acceden a beneficios tributarios, incluyendo tasas diferenciadas. El beneficio tiene restricciones: **superficie edificada máxima de 140 m²**, uso habitacional, restringido a **personas naturales** y a un máximo de **dos propiedades** por beneficiario. Verifica si tu propiedad está acogida a este régimen en el [SII](https://www.sii.cl/).

## ¿Qué pasa si no pagas?

La deuda de contribuciones genera intereses y reajuste fiscal desde la fecha de vencimiento. La deuda queda registrada ante la TGR como deuda fiscal, lo que puede afectar créditos hipotecarios o licitaciones. La TGR puede iniciar gestión de cobro, incluyendo embargo.

## Cómo reclamar un avalúo incorrecto

Si crees que el SII sobrevaluó tu propiedad, tienes derecho a reclamar el avalúo. El proceso se inicia en el SII dentro del plazo que define cada proceso de reevaluación masiva. Requiere presentar antecedentes técnicos que justifiquen un valor inferior. El reclamo tiene plazos estrictos — consulta en el SII si hay un período de reevaluación vigente para tu propiedad.

## Contribuciones y F22: cuándo son gasto deducible

Para propietarios que arriendan el bien raíz, las contribuciones pueden ser consideradas gasto tributario al declarar la renta de arrendamiento en el F22. Las condiciones exactas dependen de las instrucciones SII vigentes para el año tributario correspondiente — verifica en el [SII](https://www.sii.cl/) o con un contador la aplicación específica a tu caso.

Si habitas tu propiedad como vivienda principal, las contribuciones habitualmente no son gasto deducible en el F22 — consulta las instrucciones SII del año tributario correspondiente o a un contador para tu situación específica.

Para el proceso de Operación Renta, revisa la [guía del F22](/posts/operacion-renta-f22-checklist/).

---

> **Fecha de corte: 2026-05-03.** Las tasas de contribuciones, los topes de exención y las fechas exactas de vencimiento se actualizan. Verifica en el [SII](https://www.sii.cl/) y la [TGR](https://www.tgr.cl/) los valores vigentes antes de pagar, reclamar o calcular.
