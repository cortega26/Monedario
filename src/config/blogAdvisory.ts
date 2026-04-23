const DEFAULT_BLOG_ARTICLE_ADVISORY_HTML =
  "Contenido informativo; no reemplaza asesoría profesional personalizada.";

const BLOG_ARTICLE_ADVISORY_BY_SLUG: Partial<Record<string, string>> = {
  "cae-costo-real-credito-chile":
    "Esta guía es educativa y no reemplaza la revisión de tu contrato específico ni asesoría profesional cuando el monto o la complejidad del crédito lo requieran.",
  "como-cambiarse-de-afp":
    'La información de este artículo está basada en la normativa vigente con fecha de corte 2026-04-22, incluyendo la Ley N°21.735 de Reforma Previsional. Para asesoría personalizada consulta con un profesional o visita la <a href="https://www.spensiones.cl">Superintendencia de Pensiones</a>.',
  "como-hacer-presupuesto-mensual-chile":
    "Este artículo es educativo. Las cifras y proporciones mencionadas son ejemplos orientativos; adapta siempre a tu situación concreta.",
  "como-salir-boletin-comercial-chile":
    'Contenido educativo con fecha de corte 2026-04-09. Este artículo no constituye asesoría legal. Para situaciones de cobranza judicial o deudas complejas, consulta a un abogado. Fuentes principales: <a href="https://www.bcn.cl/leychile/navegar?idNorma=1037366">Ley 20.575</a>, <a href="https://www.bcn.cl/leychile/navegar?idNorma=1209272">Ley 21.719</a>, <a href="https://www.cmfchile.cl/portal/principal/613/w3-article-27659">CMF Chile — Boletín Comercial</a>.',
  "credito-hipotecario-chile-guia-completa":
    "Esta guía es educativa y no reemplaza la asesoría de un profesional financiero o legal para tu operación específica.",
  "descuentos-de-sueldo":
    'Contenido educativo con fecha de corte 2026-04-22. Las comisiones AFP y la tabla del impuesto único se actualizan regularmente; verifica los valores vigentes en la <a href="https://www.spensiones.cl">Superintendencia de Pensiones</a> y el <a href="https://www.sii.cl">SII</a> antes de tomar decisiones.',
  "donde-ver-si-estoy-en-dicom-gratis":
    'Contenido educativo con fecha de corte 2026-03-12. Antes de pagar por un informe privado, revisa si tu duda ya queda resuelta con el <a href="https://conocetudeuda.cmfchile.cl/informe-deudas/">Informe de Deudas CMF</a> gratuito.',
  "el-poder-del-interes-compuesto":
    'Simulación educativa con fecha de corte 2025-12-31. Los retornos pasados no garantizan retornos futuros. Para el detalle metodológico completo, supuestos y fuentes, abre la <a href="/posts/interes-compuesto-nota-metodologica/">nota metodológica</a>.',
  "fonasa-vs-isapre-comparativa":
    'Última actualización de esta guía: 2026-04-08. Fonasa actualiza sus tramos e instrucciones periódicamente; verifica siempre en <a href="https://www.fonasa.cl">fonasa.cl</a> y <a href="https://www.supersalud.gob.cl">supersalud.gob.cl</a> antes de tomar una decisión de salud.',
  "indemnizacion-anos-de-servicio-chile":
    "Contenido educativo con fecha de corte 2026-03-12. Si la causal está discutida o el cálculo involucra remuneración variable compleja, la asesoría de un abogado laboral es el paso correcto antes de firmar.",
  "liquidacion-de-sueldo":
    "Contenido educativo con fecha de corte 2026-03-12. Si tu caso involucra remuneración variable compleja o descuentos discutidos formalmente, la revisión con respaldo documental y asesoría es el paso correcto antes de firmar conforme.",
  "que-es-el-ipc-chile-como-se-calcula":
    'La información de este artículo es educativa. Los datos de inflación cambian mes a mes; consulta siempre el último informe en <a href="https://www.ine.gob.cl">ine.gob.cl</a>.',
  "reajuste-arriendo-uf-ipc-chile":
    'Contenido educativo con fecha de corte 2026-03-12. Para interpretación de cláusulas específicas, consulta a un abogado o la <a href="https://www.cajmetro.cl/">Corporación de Asistencia Judicial</a>.',
  "reforma-previsional-2025-que-cambia-y-como-te-afecta":
    'Esta guía es educativa. El cronograma de implementación y las tablas de porcentajes específicos por año pueden ajustarse por reglamento. Verifica siempre la información más reciente en la <a href="https://www.spensiones.cl">Superintendencia de Pensiones</a> antes de tomar decisiones previsionales.',
  "seguro-cesantia-cuenta-individual-vs-fondo-solidario":
    'Contenido educativo con fecha de corte 2026-04-12. Los porcentajes y topes del FCS se actualizan anualmente; verifica los valores vigentes en <a href="https://www.chileatiende.gob.cl/fichas/36646-fondo-de-cesantia-solidario">ChileAtiende</a> y la <a href="https://www.spensiones.cl">Superintendencia de Pensiones</a> antes de calcular tu cobertura.',
  "utm-chile-que-es-como-funciona":
    "La información de este artículo es educativa. Los valores de UTM y tramos de impuesto cambian mes a mes; consulta siempre las fuentes oficiales antes de aplicar cualquier cálculo.",
};

export function getBlogArticleAdvisoryHtml(slug: string): string {
  return (
    BLOG_ARTICLE_ADVISORY_BY_SLUG[slug] ?? DEFAULT_BLOG_ARTICLE_ADVISORY_HTML
  );
}
