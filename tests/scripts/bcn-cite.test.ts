import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  checkNoteResidue,
  cite,
  citeFromData,
  normalizePart,
  parseOrdinalEs,
  resolveRelativeDate,
  selectBlock,
  stripNotes,
} from "../../scripts/bcn-cite.mjs";

const SCRIPT_PATH = path.resolve("scripts/bcn-cite.mjs");
const GOLDEN_PATH = path.resolve("tests/bcn-cite.golden.json");

interface GoldenQuote {
  id: string;
  locatorLabel: string;
  idNorma: string;
  idVersion?: string;
  idParte: number | string;
  locator: {
    idParte?: number | string;
    art?: string;
    inciso?: number;
    numeral?: string;
    final?: boolean;
    transitorio?: string;
  };
  expected: string;
  expectDate?: string;
}

const golden: { quotes: GoldenQuote[] } = JSON.parse(
  readFileSync(GOLDEN_PATH, "utf8")
);

// Fixtures: HTML verbatim de get_norma_json (sept 2026, Ultima Version).
// Hojas chicas van completas; hojas grandes (CT-168, art. 264, art. 260)
// van recortadas a los bloques necesarios con el bloque objetivo verbatim
// (documentado en cada caso). Suficiente porque el locator indexa sobre
// bloques no vacios y el target conserva sus notas marginales reales.
const F_8642702 = `<div><div class="p">&nbsp; &nbsp;  Art&#xED;culo 18.- En ning&#xFA;n caso pueden comunicarse<span class="n" id="n_10">LEY 19812<br>Art. 1&#xBA; N&#xBA; 4<br>D.O. 13.06.2002</span> los datos a que se refiere el art&#xED;culo anterior, que se relacionen con una persona identificada o identificable, luego de transcurridos cinco a&#xF1;os desde que la respectiva obligaci&#xF3;n se hizo exigible.</div><div class="p">&nbsp; &nbsp;  Tampoco se podr&#xE1; continuar comunicando los datos relativos a dicha obligaci&#xF3;n despu&#xE9;s de haber sido pagada o haberse extinguido por otro modo legal.</div><div class="p">&nbsp; &nbsp;  Con todo, se comunicar&#xE1; a los tribunales de Justicia la informaci&#xF3;n que requieran con motivo de juicios pendientes.</div><br><br></div>`;

const F_8642703 = `<div><div class="p">&nbsp; &nbsp;  Art&#xED;culo 19.- El pago o la extinci&#xF3;n de estas obligaciones por cualquier otro modo no produce la caducidad o la p&#xE9;rdida de fundamento legal de los datos respectivos para los efectos del art&#xED;culo 12, mientras est&#xE9;n pendientes los plazos que establece el art&#xED;culo precedente.</div><div class="p">&nbsp; &nbsp;  Al efectuarse el pago o extinguirse la obligaci&#xF3;n por otro modo en que intervenga directamente el acreedor, &#xE9;ste avisar&#xE1; tal hecho, a m&#xE1;s tardar dentro de los siguientes siete d&#xED;as h&#xE1;biles, al responsable del registro o banco de datos accesible al p&#xFA;blico que en su oportunidad comunic&#xF3; el protesto o la morosidad, a fin de que consigne el nuevo dato que corresponda, previo pago de la tarifa si fuere procedente, con cargo al deudor. El deudor podr&#xE1; optar por requerir directamente la modificaci&#xF3;n al banco de datos y liberar del cumplimiento de esa obligaci&#xF3;n al acreedor que le entregue constancia suficiente del pago; decisiones que deber&#xE1; expresar por escrito.</div><div class="p">&nbsp; &nbsp;  Quienes efect&#xFA;en el tratamiento de datos personales provenientes o recolectados de la aludida fuente accesible al p&#xFA;blico deber&#xE1;n modificar los datos en el mismo sentido tan pronto aqu&#xE9;lla comunique el pago o la extinci&#xF3;n de la obligaci&#xF3;n, o dentro de los tres d&#xED;as siguientes. Si no les fuera posible, bloquear&#xE1;n los datos del respectivo titular hasta que est&#xE9; actualizada la informaci&#xF3;n.</div><div class="p">&nbsp; &nbsp;  La infracci&#xF3;n de cualquiera de estas obligaciones se conocer&#xE1; y sancionar&#xE1; de acuerdo a lo previsto en el art&#xED;culo 16.</div><br></div>`;

// CT art. 163: solo bloque 1 (objetivo inciso 1, con notas reales n_578/579).
const F_8512021 = `<div><div class="p">&nbsp; &nbsp; Art. 163. Si el contrato hubiere estado<span class="n" id="n_578">L. 19.010<br>Art. 5&#xBA;</span> vigente un a&#xF1;o o m&#xE1;s y el empleador le pusiere t&#xE9;rmino en conformidad al art&#xED;culo 161, deber&#xE1; pagar al trabajador, la indemnizaci&#xF3;n <span class="n" id="n_579"><a href="navegar?idNorma=1053719&amp;idParte=9371049&amp;idVersion=2013-08-23">Ley 20684<br>Art. &#xDA;NICO N&#xBA; 1<br>D.O. 23.08.2013</a></span>por a&#xF1;os de servicio que las partes hayan convenido individual o colectivamente, siempre que &#xE9;sta fuere de un monto superior a la establecida en el inciso siguiente.</div></div>`;

// CT art. 172: bloques 1-3 completos (objetivo inc. final = bloque 3).
const F_8512030 =
  `<div><div class="p">&nbsp; &nbsp;  Art. 172. Para los efectos del pago de las<span class="n" id="n_599">L. 19.010<br>Art. 14</span> indemnizaciones a que se refieren los art&#xED;culos 163, 163 bis, 168, 169, 170 y 171, la &#xFA;ltima remuneraci&#xF3;n mensual <span class="n" id="n_600"><a href="navegar?idNorma=1125900&amp;idParte=9971034&amp;idVersion=2018-11-28">Ley 21122<br>Art. 1 N&#xB0; 7<br>D.O. 28.11.2018</a></span>comprender&#xE1; toda cantidad que estuviere percibiendo el trabajador por la prestaci&#xF3;n de sus servicios al momento de terminar el contrato, incluidas las imposiciones y cotizaciones de previsi&#xF3;n o seguridad social de cargo del <span class="n" id="n_601"><a href="navegar?idNorma=1058072&amp;idParte=9399089&amp;idVersion=2014-01-09">Ley 20720<br>Art. 350 N&#xBA; 3<br>D.O. 09.01.2014</a></span>trabajador y las regal&#xED;as o especies avaluadas en dinero, con exclusi&#xF3;n de la asignaci&#xF3;n familiar legal, pagos por sobretiempo y beneficios o asignaciones que se otorguen en forma espor&#xE1;dica o por una sola vez al a&#xF1;o, tales como gratificaciones y aguinaldos de navidad.</div>` +
  `<div class="p">&nbsp; &nbsp;  Si se tratare de remuneraciones variables, la indemnizaci&#xF3;n se calcular&#xE1; sobre la base del promedio percibido por el trabajador en los &#xFA;ltimos tres meses calendario.</div>` +
  `<div class="p">&nbsp; &nbsp;  Con todo, para los efectos de las indemnizaciones establecidas en este t&#xED;tulo, no se considerar&#xE1; una remuneraci&#xF3;n mensual superior a 90 unidades de fomento del &#xFA;ltimo d&#xED;a del mes anterior al pago, limit&#xE1;ndose a dicho monto la base de c&#xE1;lculo.</div></div>`;

// CT art. 168: bloques 1-8 completos (objetivos inc. 1 y final = bloque 8).
const F_8512026 =
  `<div><div class="p">&nbsp; &nbsp;  Art. 168. El trabajador cuyo contrato<span class="n" id="n_587">L. 19.759<br>Art. &#xDA;nico, N&#xBA; 26</span> termine por aplicaci&#xF3;n de una o m&#xE1;s de las causales establecidas en los art&#xED;culos 159, 160 y 161, y que considere que dicha aplicaci&#xF3;n es injustificada, indebida o improcedente, o que no se haya invocado ninguna causal legal, podr&#xE1; recurrir al juzgado competente, dentro del plazo de sesenta d&#xED;as h&#xE1;biles, contado desde la separaci&#xF3;n, a fin de que &#xE9;ste as&#xED; lo declare. En este caso, el juez ordenar&#xE1; el pago de la indemnizaci&#xF3;n a que se refiere el inciso cuarto del art&#xED;culo 162 y la de los incisos primero o segundo del art&#xED;culo 163, seg&#xFA;n correspondiere, aumentada esta &#xFA;ltima de acuerdo a las siguientes reglas:</div>` +
  `<div class="p">a)&nbsp;  En un treinta por ciento, si se hubiere dado t&#xE9;rmino por aplicaci&#xF3;n improcedente del art&#xED;culo 161;</div>` +
  `<div class="p">b)&nbsp;  En un cincuenta por ciento, si se hubiere dado t&#xE9;rmino por aplicaci&#xF3;n injustificada de las causales del art&#xED;culo 159 o no se hubiere invocado ninguna causa legal para dicho t&#xE9;rmino;</div>` +
  `<div class="p">c)&nbsp;  En un ochenta por ciento, si se hubiere dado t&#xE9;rmino por aplicaci&#xF3;n indebida de las causales del art&#xED;culo 160.</div>` +
  `<div class="p">&nbsp; &nbsp;  Si el empleador hubiese invocado las causales se&#xF1;aladas en los n&#xFA;meros 1, 5 y 6 del art&#xED;culo 160 y el despido fuere adem&#xE1;s declarado carente de motivo plausible por el tribunal, la indemnizaci&#xF3;n establecida en los incisos primero o segundo del art&#xED;culo 163, seg&#xFA;n correspondiere, se incrementar&#xE1; en un cien por ciento.</div>` +
  `<div class="p">&nbsp; &nbsp; &nbsp; En el caso de las denuncias de acoso sexual,<span class="n" id="n_588">LEY 20005<br>Art. 1&#xBA; N&#xBA; 5<br>D.O. 18.03.2005</span> el empleador que haya cumplido con su obligaci&#xF3;n en los t&#xE9;rminos que se&#xF1;alan el art&#xED;culo 153, inciso segundo, y el T&#xED;tulo IV del Libro II, no estar&#xE1; afecto al recargo de la indemnizaci&#xF3;n a que hubiere lugar, en caso de que el despido sea declarado injusto, indebido o improcedente.</div>` +
  `<div class="p">&nbsp; &nbsp;  Si el juez estableciere que la aplicaci&#xF3;n de una o m&#xE1;s de las causales de terminaci&#xF3;n del contrato establecidas en los art&#xED;culos 159 y 160 no ha sido acreditada, de conformidad a lo dispuesto en este art&#xED;culo, se entender&#xE1; que el t&#xE9;rmino del contrato se ha producido por alguna de las causales se&#xF1;aladas en el art&#xED;culo 161, en la fecha en que se invoc&#xF3; la causal, y habr&#xE1; derecho a los incrementos legales que corresponda en conformidad a lo dispuesto en los incisos anteriores.</div>` +
  `<div class="p">&nbsp; &nbsp;  El plazo contemplado en el inciso primero se suspender&#xE1; cuando, dentro de &#xE9;ste, el trabajador interponga un reclamo por cualquiera de las causales indicadas, ante la Inspecci&#xF3;n del Trabajo respectiva. Dicho plazo seguir&#xE1; corriendo una vez concluido este tr&#xE1;mite ante dicha Inspecci&#xF3;n. No obstante lo anterior, en ning&#xFA;n caso podr&#xE1; recurrirse al tribunal transcurridos noventa d&#xED;as h&#xE1;biles desde la separaci&#xF3;n del trabajador.</div></div>`;

const F_8720591 = `<div><div class="p">&nbsp; &nbsp;  Art. 2515. Este tiempo es en general de tres a&#xF1;os<span class="n" id="n_771">L. 16.952<br>Art. 1&#xBA;</span> para las acciones ejecutivas y de cinco para las ordinarias.</div><div class="p">&nbsp; &nbsp;  La acci&#xF3;n ejecutiva se convierte en ordinaria por el lapso de tres a&#xF1;os, y convertida en ordinaria durar&#xE1; solamente otros dos.</div><br></div>`;

const F_10542939 = `<div><div class="p">&nbsp; &nbsp;  Art&#xED;culo primero.- Las normas de la presente ley entrar&#xE1;n en vigencia el primer d&#xED;a del vig&#xE9;simo quinto mes siguiente a su publicaci&#xF3;n en el Diario Oficial. Lo anterior es sin perjuicio de lo dispuesto en los art&#xED;culos siguientes.</div></div>`;

// Ley 20.720 art. 260: bloques 1-3 (b1 vacio -> descarta; objetivo inc. 2).
const F_9398983 =
  `<div><div class="p">&nbsp; &nbsp; </div>` +
  `<div class="p">&nbsp; &nbsp;  Art&#xED;culo 260.- &#xC1;mbito de aplicaci&#xF3;n y requisitos. El Procedimiento Concursal de Renegociaci&#xF3;n ser&#xE1; aplicable s&#xF3;lo a la Persona Deudora, que para efectos de este <span class="n" id="n_110"><a href="navegar?idNorma=1191960&amp;idParte=10428826&amp;idVersion=2023-08-11">Ley 21563<br>Art. 1 N&#xB0; 66 a)<br>D.O. 10.05.2023</a></span>T&#xED;tulo se denominar&#xE1; indistintamente Persona Deudora o Deudor.</div>` +
  `<div class="p">&nbsp; &nbsp;  La Persona Deudora podr&#xE1; someterse a un Procedimiento Concursal de Renegociaci&#xF3;n si tuviere dos o m&#xE1;s obligaciones vencidas por m&#xE1;s de 90 d&#xED;as corridos, actualmente exigibles, provenientes de obligaciones diversas, cuyo monto total sea superior a 80 unidades de fomento, <span class="n" id="n_111"><a href="navegar?idNorma=1191960&amp;idParte=10428826&amp;idVersion=2023-08-11">Ley 21563<br>Art. 1 N&#xB0; 66 b) i y ii<br>D.O. 10.05.2023</a></span>siempre y cuando no haya sido notificada de una demanda que solicite el inicio de un Procedimiento Concursal de Liquidaci&#xF3;n Simplificada.</div></div>`;

// Ley 20.720 art. 264: bloques 1-8 (objetivos N°4 y N°6).
const F_9398987 =
  `<div><div class="p">&nbsp; &nbsp;  Art&#xED;culo 264.- Efectos de la Resoluci&#xF3;n de Admisibilidad. Desde la publicaci&#xF3;n de la Resoluci&#xF3;n de Admisibilidad y hasta el t&#xE9;rmino del Procedimiento Concursal de Renegociaci&#xF3;n se producir&#xE1;n los siguientes efectos:</div>` +
  `<div class="p">&nbsp; &nbsp;  1) No podr&#xE1; solicitarse la Liquidaci&#xF3;n Forzosa ni Voluntaria de la Persona Deudora, ni iniciarse en su contra juicios ejecutivos o ejecuciones de cualquier clase o restituciones en juicios de arrendamiento durante el t&#xE9;rmino se&#xF1;alado en el encabezado de este art&#xED;culo.</div>` +
  `<div class="p">&nbsp; &nbsp;  Para los efectos de hacer valer la oposici&#xF3;n al inicio de las ejecuciones a que se refiere este n&#xFA;mero, la Persona Deudora acompa&#xF1;ar&#xE1; al tribunal competente copia autorizada de la Resoluci&#xF3;n de Admisibilidad, pudiendo hacerse valer solamente como excepci&#xF3;n. Para ello, la Persona Deudora podr&#xE1; comparecer personalmente sin necesidad de patrocinio de abogado.</div>` +
  `<div class="p">&nbsp; &nbsp;  2) Se suspender&#xE1;n los plazos de prescripci&#xF3;n extintiva de las obligaciones del Deudor.</div>` +
  `<div class="p">&nbsp; &nbsp;  3) No se continuar&#xE1;n devengando los intereses moratorios que se hayan pactado en los respectivos actos o contratos vigentes suscritos por la Persona Deudora.</div>` +
  `<div class="p">&nbsp; &nbsp;  4) Todos los contratos suscritos por la Persona Deudora mantendr&#xE1;n su vigencia y condiciones de pago, en su caso, y no ser&#xE1; posible hacer efectivas cl&#xE1;usulas de resoluci&#xF3;n o caducidad fundadas en el inicio del Procedimiento Concursal de Renegociaci&#xF3;n, con la sola excepci&#xF3;n de suspender las l&#xED;neas de cr&#xE9;dito o sobregiro que se hubieren pactado. Sin perjuicio de lo anterior, las obligaciones ya contra&#xED;das mantendr&#xE1;n sus condiciones de pago, sin que se pueda acelerar o aplicarles multas fundadas en el inicio del referido procedimiento. Si la contraparte de estos contratos realizare cualquier acci&#xF3;n que importe el t&#xE9;rmino de los mismos o exigiera anticipadamente el pago de su cr&#xE9;dito, dicho cr&#xE9;dito quedar&#xE1; pospuesto en su pago hasta que se paguen la totalidad de los acreedores a quienes afectar&#xE1; el Acuerdo de Renegociaci&#xF3;n.</div>` +
  `<div class="p">&nbsp; &nbsp;  5)<span class="n" id="n_117"><a href="navegar?idNorma=1191960&amp;idParte=10428826&amp;idVersion=2023-08-11">Ley 21563<br>Art. 1 N&#xB0; 70 a)<br>D.O. 10.05.2023</a></span> Cualquier interesado podr&#xE1; observar u objetar los cr&#xE9;ditos de la n&#xF3;mina se&#xF1;alada en el n&#xFA;mero 2) del art&#xED;culo 263, y verificar adem&#xE1;s las preferencias de todos sus cr&#xE9;ditos, as&#xED; como el listado de bienes se&#xF1;alado en el n&#xFA;mero 3) del mismo art&#xED;culo, hasta tres d&#xED;as h&#xE1;biles administrativos antes de la celebraci&#xF3;n de la audiencia de determinaci&#xF3;n del pasivo regulada en el art&#xED;culo siguiente. Tambi&#xE9;n podr&#xE1; concurrir a ella con derecho a voz y voto. La Superintendencia dictar&#xE1; una norma de car&#xE1;cter general que regule, en todo lo no establecido en la presente ley, la presentaci&#xF3;n y tramitaci&#xF3;n de las observaciones u objeciones.</div>` +
  `<div class="p">&nbsp; &nbsp;  6) La Persona Deudora no podr&#xE1; ejecutar actos ni celebrar contratos relativos a sus bienes embargables que sean parte de Procedimiento Concursal de Renegociaci&#xF3;n, bajo el apercibimiento de ser tenido por depositario alzado en los t&#xE9;rminos del art&#xED;culo 444 del C&#xF3;digo de Procedimiento Civil.</div></div>`;

// DL 3500 art. 19: solo bloque 1 (objetivo inciso 1; pega mid-word "medic|a").
const F_8674774 = `<div><div class="p">&nbsp; &nbsp;  Art&#xED;culo 19&#xBA; Las cotizaciones establecidas en<span class="n" id="n_97">LEY 18646<br>Art. 1&#xBA; N&#xBA; 9<br>D.O. 29.08.1987</span> este T&#xED;tulo deber&#xE1;n ser declaradas y pagadas por el empleador, el trabajador independiente a que se refiere el inciso tercero del art&#xED;culo 90, el afiliado voluntario a que se refiere el T&#xED;tulo IX o la entidad pagadora de subsidios, seg&#xFA;n corresponda, en la Administradora de Fondos de Pensiones a que se encuentre afiliado el trabajador, dentro de los diez primeros d&#xED;as del mes siguiente a aqu&#xE9;l en que se devengaron las remuneraciones y rentas afectas a aqu&#xE9;llas, o aquel en que se autoriz&#xF3; la licencia m&#xE9;dic<span class="n" id="n_98"><a href="navegar?idNorma=269892&amp;idParte=8655477&amp;idVersion=2008-03-17">LEY 20255<br>Art. 86 N&#xBA; 3 a)<br>D.O. 17.03.2008</a></span>a por la entidad correspondiente, en su caso, t&#xE9;rmino que se prorrogar&#xE1; hasta el primer d&#xED;a h&#xE1;bil siguiente si dicho plazo expirare en d&#xED;a s&#xE1;bado, domingo o festivo. El trabajador independiente a que se refiere el inciso primero del art&#xED;culo 90 pagar&#xE1; las cotizaciones a que se refiere este T&#xED;tulo, en la forma y oportunidad que establece el art&#xED;culo 92 F.</div></div>`;

const FIXTURES = {
  8642702: { html: F_8642702, meta: {} },
  8642703: { html: F_8642703, meta: {} },
  8512021: { html: F_8512021, meta: {} },
  8512030: { html: F_8512030, meta: {} },
  8512026: { html: F_8512026, meta: {} },
  8720591: { html: F_8720591, meta: {} },
  10542939: { html: F_10542939, meta: { fecha_publicacion: "2025-03-26" } },
  9398983: { html: F_9398983, meta: {} },
  9398987: { html: F_9398987, meta: {} },
  8674774: { html: F_8674774, meta: {} },
};

function fixtureNorma(idParte: number | string) {
  const f = FIXTURES[idParte as unknown as keyof typeof FIXTURES];
  return {
    html: [{ i: String(idParte), t: f.html }],
    estructura: [],
    metadatos: f.meta,
  };
}

const tempRoots: string[] = [];

afterEach(() => {
  for (const root of tempRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("bcn-cite golden EXACT en fixture (sin red)", () => {
  it.each(golden.quotes)("$id — $locatorLabel", q => {
    const idP = q.idParte ?? q.locator.idParte;
    const data = fixtureNorma(idP);
    const result = citeFromData(
      data,
      { idParte: String(idP), ...q.locator },
      {
        idNorma: q.idNorma,
        idVersion: q.idVersion || "",
        resolveDates: Boolean(q.expectDate),
      }
    );
    expect(result.literal).toBe(q.expected);
    if (q.expectDate) expect(result.resolvedDate?.iso).toBe(q.expectDate);
    expect(result.notes.length).toBeGreaterThanOrEqual(0);
  });
});

describe("bcn-cite fail-closed ante residuos de nota", () => {
  it("rechaza literal con modificatoria en texto plano sin devolver cita", () => {
    const data = {
      html: [
        {
          i: "1",
          t: `<div><div class="p">Texto con LEY 19812 Art. 1º Nº 4 D.O. 13.06.2002 pegado</div></div>`,
        },
      ],
      estructura: [],
      metadatos: {},
    };
    expect(() => citeFromData(data, { idParte: "1", inciso: 1 })).toThrow(
      expect.objectContaining({ code: "RESIDUE" })
    );
    expect(checkNoteResidue("comuniquese LEY 19812 sin filtrar")).toContain(
      "modificatoria"
    );
  });

  it("rechaza restos NOTA: y tags HTML", () => {
    expect(checkNoteResidue("ver NOTA: al pie")).toContain("nota-ref");
    expect(checkNoteResidue("texto <span>con tag</span>")).toContain("html");
  });

  it("acepta cuerpo legitimo con 'ley' minuscula y 'Diario Oficial'", () => {
    const legit =
      "Las normas de la presente ley entrarán en vigencia el primer día del " +
      "vigésimo quinto mes siguiente a su publicación en el Diario Oficial.";
    expect(checkNoteResidue(legit)).toBeNull();
  });

  it("falla NOT_FOUND en parte y bloque inexistentes sin devolver literal", () => {
    const data = fixtureNorma(8642702);
    expect(() => citeFromData(data, { idParte: "9999999" })).toThrow(
      expect.objectContaining({ code: "NOT_FOUND" })
    );
    expect(() =>
      citeFromData(data, { idParte: "8642702", inciso: 99 })
    ).toThrow(expect.objectContaining({ code: "NOT_FOUND" }));
    expect(() =>
      citeFromData(data, { art: "18", inciso: 1 })
    ).toThrow(expect.objectContaining({ code: "NOT_FOUND" }));
  });
});

describe("bcn-cite unidades puras", () => {
  it("stripNotes separa la modificatoria y conserva el cuerpo (CT-163)", () => {
    const inner =
      F_8512021.replace(/^<div>/, "").replace(/<\/div>$/, "");
    const { notes } = stripNotes(inner);
    expect(notes.length).toBe(2);
    expect(notes[0].kind).toBe("modificatoria");
    const art = normalizePart({ idParte: "8512021", name: "x", html: F_8512021 });
    expect(art.blocks[0].text).toContain("Si el contrato hubiere estado vigente");
    expect(checkNoteResidue(art.blocks[0].text)).toBeNull();
  });

  it("selectBlock resuelve inciso, numeral y final", () => {
    const art = normalizePart({ idParte: "9398987", name: "x", html: F_9398987 });
    expect(selectBlock(art, { numeral: "4" })?.text.startsWith("4) Todos")).toBe(
      true
    );
    expect(selectBlock(art, { numeral: "6" })?.text.startsWith("6) La Persona")).toBe(
      true
    );
    expect(selectBlock(art, { final: true })?.text.startsWith("6) La Persona")).toBe(
      true
    );
    expect(selectBlock(art, { inciso: 2 })?.text.startsWith("1) No podrá")).toBe(
      true
    );
  });

  it("parseOrdinalEs compone 'vigésimo quinto' = 25", () => {
    expect(parseOrdinalEs("vigésimo quinto")).toBe(25);
    expect(parseOrdinalEs("primer día del vigésimo quinto")).toBe(25);
  });

  it("resolveRelativeDate publica 2025-03-26 + 25 meses = 2027-04-01", () => {
    const art = normalizePart({
      idParte: "10542939",
      name: "x",
      html: F_10542939,
    });
    const info = resolveRelativeDate(art.fullText, "2025-03-26");
    expect(info.iso).toBe("2027-04-01");
  });
});

describe("bcn-cite CLI validacion de args (sin red)", () => {
  const run = (args: string[]) =>
    spawnSync("node", [SCRIPT_PATH, ...args], { encoding: "utf8" });

  it("exige idNorma y selector (exit 2)", () => {
    expect(run([]).status).toBe(2);
    expect(run(["abc"]).status).toBe(2);
    expect(run(["141599"]).status).toBe(2);
  });

  it("rechaza --art invalido, --inciso 0 y flags desconocidos (exit 2)", () => {
    expect(run(["141599", "--art", "18x"]).status).toBe(2);
    expect(run(["141599", "--art", "18", "--inciso", "0"]).status).toBe(2);
    expect(run(["141599", "--art", "18", "--nope"]).status).toBe(2);
    const both = run(["141599", "--art", "18", "--inciso", "1", "--final"]);
    expect(both.status).toBe(2);
    expect(run(["141599", "--art", "18", "--idVersion", "ayer"]).status).toBe(2);
  });

  it("--help sale 0 con uso", () => {
    const r = run(["--help"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("Uso:");
  });

  it("cita end-to-end desde fixture local sin red (exit 0, literal EXACT)", () => {
    const root = mkdtempSync(path.join(tmpdir(), "bcn-cite-"));
    tempRoots.push(root);
    const file = path.join(root, "norma.json");
    writeFileSync(
      file,
      JSON.stringify({
        html: [{ i: "8642702", t: F_8642702 }],
        estructura: [{ i: "8642702", n: "Artículo 18" }],
        metadatos: {},
      }),
      "utf8"
    );
    const r = run([file, "--idParte", "8642702", "--inciso", "2"]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain(
      "Tampoco se podrá continuar comunicando los datos relativos a dicha obligación"
    );
  });

  it("fail-closed via CLI: residuo en fixture sale 1 sin cita sucia", () => {
    const root = mkdtempSync(path.join(tmpdir(), "bcn-cite-"));
    tempRoots.push(root);
    const file = path.join(root, "dirty.json");
    writeFileSync(
      file,
      JSON.stringify({
        html: [
          {
            i: "1",
            t: `<div><div class="p">Cita con LEY 19812 D.O. 13.06.2002 sin filtrar</div></div>`,
          },
        ],
        estructura: [],
        metadatos: {},
      }),
      "utf8"
    );
    const r = run([file, "--idParte", "1"]);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("RESIDUE");
    expect(r.stdout).not.toContain("LEY 19812");
  });
});

const describeLive = process.env.BCN_LIVE === "1" ? describe : describe.skip;

describeLive("bcn-cite live opt-in (con red, omitido por defecto)", () => {
  it(
    "cita Ley 19.628 art. 18 inc. 2 EXACT contra LeyChile",
    async () => {
      const r = await cite(
        "141599",
        { art: "18", inciso: 2 },
        { noCache: true }
      );
      expect(r.literal).toBe(
        "Tampoco se podrá continuar comunicando los datos relativos a dicha obligación después de haber sido pagada o haberse extinguido por otro modo legal."
      );
    },
    60000
  );
});
