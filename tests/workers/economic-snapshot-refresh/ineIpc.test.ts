import { describe, expect, it } from "vitest";
import { parseIneIpc } from "../../../workers/economic-snapshot-refresh/src/sources/ineIpc";

// Real fixture observed 2026-05-16 on https://www.ine.gob.cl/.../indice-de-precios-al-consumidor
// Includes the IPC card plus its siblings (ICT, IPP) to verify the parser
// correctly anchors on the IPC heading and doesn't accidentally pick a sibling.
const REAL_FIXTURE = `
  <div class="indicador">
    <h1>Índice de Precios al Consumidor - IPC</h1>
    <p class="cifraV3">1,3%</p>
    <p class="periodoCifraV3">Variación mensual abril 2026<br>Base anual 2023=100</p>
  </div>
  <div class="indicador">
    <h1>Índice de Costos del Transporte - ICT</h1>
    <p class="cifraV3">11,3%</p>
    <p class="periodoCifraV3">Variación mensual abril 2026<br>Base anual 2023=100</p>
  </div>
  <div class="indicador">
    <h1>Índice de Precios de Productor Industrias - IPP</h1>
    <p class="cifraV3">2,1%</p>
    <p class="periodoCifraV3">Variación mensual marzo 2026<br>Base anual 2019=100</p>
  </div>
`;

describe("parseIneIpc", () => {
  it("extracts the latest monthly IPC from the real fixture", () => {
    const result = parseIneIpc(REAL_FIXTURE);
    expect(result).toEqual({ value: 1.3, dateIso: "2026-04-01" });
  });

  it("ignores sibling indicators (ICT/IPP) even when listed first", () => {
    const reordered = `
      <h1>Índice de Costos del Transporte - ICT</h1>
      <p class="cifraV3">11,3%</p>
      <p class="periodoCifraV3">Variación mensual abril 2026<br>Base anual 2023=100</p>
      <h1>Índice de Precios al Consumidor - IPC</h1>
      <p class="cifraV3">0,4%</p>
      <p class="periodoCifraV3">Variación mensual mayo 2026<br>Base anual 2023=100</p>
    `;
    const result = parseIneIpc(reordered);
    expect(result).toEqual({ value: 0.4, dateIso: "2026-05-01" });
  });

  it("parses negative variations correctly", () => {
    const html = `
      <h1>Índice de Precios al Consumidor - IPC</h1>
      <p class="cifraV3">-0,2%</p>
      <p class="periodoCifraV3">Variación mensual diciembre 2025<br>Base anual 2023=100</p>
    `;
    const result = parseIneIpc(html);
    expect(result).toEqual({ value: -0.2, dateIso: "2025-12-01" });
  });

  it("tolerates the unaccented form 'Indice de Precios'", () => {
    const html = `
      <h1>Indice de Precios al Consumidor - IPC</h1>
      <p class="cifraV3">0,5%</p>
      <p class="periodoCifraV3">Variacion mensual junio 2026<br>Base anual 2023=100</p>
    `;
    const result = parseIneIpc(html);
    expect(result).toEqual({ value: 0.5, dateIso: "2026-06-01" });
  });

  it("handles attribute order variations and extra classes", () => {
    const html = `
      <h1 id="ipc-h1" class="card-title">Índice de Precios al Consumidor - IPC</h1>
      <p data-index="ipc" class="cifraV3 highlight">2,7%</p>
      <p class="periodoCifraV3 small">Variación mensual julio 2026</p>
    `;
    const result = parseIneIpc(html);
    expect(result).toEqual({ value: 2.7, dateIso: "2026-07-01" });
  });

  it("returns null when IPC card is absent", () => {
    const html = `
      <h1>Índice de Costos del Transporte - ICT</h1>
      <p class="cifraV3">11,3%</p>
      <p class="periodoCifraV3">Variación mensual abril 2026</p>
    `;
    expect(parseIneIpc(html)).toBeNull();
  });

  it("returns null when the period label is not the monthly variation", () => {
    const html = `
      <h1>Índice de Precios al Consumidor - IPC</h1>
      <p class="cifraV3">11,3%</p>
      <p class="periodoCifraV3">Variación 12 meses abril 2026</p>
    `;
    expect(parseIneIpc(html)).toBeNull();
  });

  it("returns null when the month name is unknown", () => {
    const html = `
      <h1>Índice de Precios al Consumidor - IPC</h1>
      <p class="cifraV3">1,1%</p>
      <p class="periodoCifraV3">Variación mensual smarch 2026</p>
    `;
    expect(parseIneIpc(html)).toBeNull();
  });
});
