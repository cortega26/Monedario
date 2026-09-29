# PLAN — Reclutamiento de revisores expertos externos (E-E-A-T #1)

Fecha: 2026-09-29
Estado: propuesta para ejecución del mantenedor (lead time humano).
Origen: `docs/backlog/EEAT-STRATEGY-2026-09-28.md` (#1: "Revisión experta
externa en YMYL crítico"; hoy `ArticleJsonLd.reviewedBy` apunta al propio
autor = auto-revisión).

## 1. Qué se busca y por qué

Un revisor humano con credencial verificable que valide la exactitud de las
piezas YMYL antes de publicar/actualizar. Impacto esperado:

- señal de **Trust** (el componente principal de E-E-A-T en YMYL);
- `reviewedBy` real en el schema (hoy es auto-revisión);
- detección temprana de errores regulatorios;
- base para el bloque de verificación público (#2).

## 2. Perfiles por cluster (prioridad)

| Cluster | Perfil ideal | Credenciales típicas |
|---|---|---|
| `impuestos-personas` (Operación Renta, IGC, boletas) | Contador auditor o abogado tributario con práctica vigente | Colegio de Contadores; ex-SII (fiscalizador o normativa); magíster en tributación |
| `sueldo-remuneraciones` | Contador auditor especialista en remuneraciones o abogado laboral | Experiencia en liquidaciones y DT; docencia en remuneraciones |
| `pensiones-afp` (APV, PGU, reforma) | Asesor previsional certificado o actuario | Certificación de asesor previsional (SP); experiencia AFP/consultora |
| `deuda-credito` (CAE, DICOM, SuperIR) | Abogado o ingeniero comercial con experiencia regulatoria | Paso por CMF/SERNAC/SuperIR; docencia en educación financiera |
| `uf-costo-de-vida` (UF, IPC, UTM) | Economista o estadístico | Experiencia INE/BCCh o docencia macro |
| `ahorro-e-inversion` | CFA o asesor de inversiones certificado | CFA Society Chile; experiencia en industria |

Estrategia: **empezar con 2 perfiles** que cubran el mayor volumen YMYL
(impuestos + sueldos) y expandir por cluster.

## 3. A quién contactar (canales concretos)

**Individuos (recomendado como primer paso)**
- LinkedIn: búsquedas guardadas por cargo + credencial ("contador auditor
  remuneraciones", "abogado tributario ex SII", "asesor previsional
  certificado"). Filtrar por actividad de divulgación (posts, charlas).
- Académicos con vocación divulgadora: escuelas de Contador Auditor,
  Ingeniería Comercial y Derecho (U. de Chile, PUC, USACH, UDD, UAI).
- Ex-autoridades técnicas: ex-SII, ex-SP, ex-CMF (suelen asesorar y valorar
  visibilidad pública seria).
- Comunidades profesionales: r/ChileFinanzas (profesionales activos), grupos
  de LinkedIn de tributaria/remuneraciones, meetups fintech.

**Instituciones (para credibilidad y cantera)**
- **Colegio de Contadores de Chile**: comisión de educación/difusión; puede
  recomendar miembros o avalar el programa de revisión.
- **Colegio de Abogados** y asociaciones de tributarios: bolsa de profesionales
  con interés en divulgación.
- **CFA Society Chile** y asociaciones de asesores previsionales: perfiles de
  inversión/previsión.
- **CMF Educa / Fundación Chile / SERNAC Educa**: posibles alianzas de
  validación institucional (no revisor nominal, pero refuerzan Trust).

**¿Grandes bufetes?**
- **No como primer paso**: costo alto, tiempos lentos, riesgo de conflicto de
  interés (clientes) y de que la revisión la haga un junior sin crédito
  público. Útil solo si se busca un sello institucional ("revisado por la
  práctica tributaria de X"), y en ese caso conviene un convenio acotado
  (1–2 piezas/mes, revisor nombrado con nombre y apellido).

**¿Grupos/firmas contables medianas?**
- **Buena cantera**: firmas de 5–30 profesionales tienen práctica de
  remuneraciones/tributaria, interés en visibilidad y agilidad. Pedir un
  **revisor nombrado** (no "la firma"), con su credencial.

## 4. Qué se ofrece a cambio (paquete de valor)

Ordenado por atractivo real para un profesional chileno:

1. **Crédito visible**: "Revisado por <Nombre>, <credencial>" con enlace a su
   LinkedIn/sitio (link editorial normal, `rel="noopener"`; si hay pago,
   declararlo).
2. **`reviewedBy` en el schema** + mención en la página de revisores
   (sección en `/metodologia/` o `/autor/`; evitar URL nueva por FOCO ESTRICTO
   hasta 2026-11-02).
3. **Tráfico**: el enlace desde artículos con tráfico real (GSC W39: las
   calculadoras y guías de impuestos/sueldos concentran la demanda).
4. **Badge reutilizable**: "Revisor externo de Monedario" para su LinkedIn/web.
5. **Difusión**: mención en redes de Monedario, posible entrevista o pieza
   co-firmada.
6. **Honorarios** (si el perfil lo exige): por pieza o retainer. Referencia
   orientativa a validar caso a caso: revisión de un artículo técnico ≈ 1–3 UF;
   retainer mensual (4–8 piezas) ≈ 5–10 UF. Alternativa: honorario simbólico +
   visibilidad para perfiles que ya divulgan.

## 5. Guion de contacto (plantilla)

**Asunto:** Revisión experta de contenidos de <tema> en Monedario (crédito +
enlace)

> Hola <Nombre>:
>
> Soy <responsable> de Monedario (monedario.cl), sitio chileno de finanzas
> personales que recibe ~<X> visitas/mes. Publicamos guías sobre
> <tema> y queremos que la exactitud la valide un profesional con credencial
> verificable, no solo nuestro equipo.
>
> Me gustó <detalle concreto: su post, su charla, su columna>. Te propongo una
> prueba acotada: revisar **un artículo** (te envío el borrador y las fuentes
> primarias; tú marcas errores, matices y riesgos). Tiempo estimado: 30–45 min.
>
> A cambio: crédito visible "Revisado por <Nombre>" con enlace a tu perfil,
> `reviewedBy` en los datos estructurados, y difusión en nuestros canales.
> <Si aplica: honorario de X UF por pieza.>
>
> Sin compromiso de continuidad: si te acomoda, seguimos con un lote mensual.
> ¿Te parece si te envío el primer artículo esta semana?

**Reglas del mensaje**: corto, con una pieza concreta, sin pedir "asesoría
gratuita indefinida"; siempre ofrecer algo a cambio.

## 6. Acuerdo mínimo (1 página)

- Alcance: piezas a revisar, plazo (48–72 h), formato de observaciones.
- Crédito: cómo se le nombra y enlaza; uso del badge.
- Conflictos de interés: declarar productos/clientes; no promocionar.
- Exactitud: el revisor valida hechos/cálculos; no decide el enfoque editorial.
- Pago (si aplica) y disclosure público de la relación remunerada.
- Salida: cualquiera puede terminar con 30 días de aviso.

## 7. Integración técnica (cuando exista revisor)

1. `src/content.config.ts`: campos `reviewer` (nombre, credencial, URL,
   `reviewedAt`) opcionales; obligatorios solo en clusters endurecidos.
2. `ArticleJsonLd.astro`: `reviewedBy` con `Person` real (nombre + `sameAs`);
   dejar de usar al autor como revisor por defecto.
3. Sección "Revisores" en `/metodologia/` (URL existente) + enlace desde el
   bloque de verificación (#2).
4. Guarda: test que falle si `reviewedBy` referencia al autor en piezas con
   `reviewer` declarado; y que `reviewer.url` sea un perfil válido.
5. Sin cambios de URL (FOCO ESTRICTO).

## 8. Roadmap sugerido

| Semana | Acción |
|---|---|
| 1 | Lista de 15–20 candidatos (impuestos + sueldos); mensajes personalizados |
| 2–3 | Conversaciones; piloto con 1 artículo pagado; evaluar calidad y encaje |
| 4 | Acuerdo + integración técnica (schema + crédito) |
| Continuo | Lote mensual por cluster; medir % de piezas YMYL con revisor |

## 9. Métricas de éxito

- 1–2 revisores activos con credencial verificable en 6 semanas.
- ≥80 % de las piezas YMYL nuevas/actualizadas con `reviewedBy` real.
- 0 conflictos de interés no declarados; 0 claims sin fuente tras revisión.
- Feedback cualitativo de usuarios en el bloque de verificación.
