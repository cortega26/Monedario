// Indicadores económicos diarios de Chile (UF, dólar, IPC, TPM, etc.)
// Fuente: Banco Central de Chile y organismos oficiales
// Este archivo es generado y actualizado automáticamente por scripts/data-signals/indicadores-diarios-refresh.mjs

export interface IndicadorDiario {
  codigo: string; // ej: UF, USD, IPC, TPM
  nombre: string; // Nombre descriptivo
  valor: number;
  unidad: string; // CLP, %, etc.
  fecha: string; // ISO (YYYY-MM-DD)
  fuente: string; // URL oficial
}

// Carga el dataset generado automáticamente
import data from "./indicadoresDiarios.data.json";

export const indicadoresDiarios: IndicadorDiario[] = data;
