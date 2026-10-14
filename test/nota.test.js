import { test } from "node:test";
import assert from "node:assert/strict";
import { generarNota, jadas10, fechaCorta } from "../src/nota.js";

test("fecha en formato argentino", () => {
  assert.equal(fechaCorta("2026-10-14"), "14/10/2026");
  assert.equal(fechaCorta(""), "");
});

test("JADAS-10 y cJADAS-10", () => {
  assert.deepEqual(jadas10({ medico: 3, paciente: 4, articulaciones: 12, vsg: 45 }), { cjadas: 17, jadas: 19.5 });
  assert.deepEqual(jadas10({ medico: 1, paciente: 0, articulaciones: 0, vsg: null }), { cjadas: 1, jadas: null });
  assert.equal(jadas10({ medico: 1, paciente: null, articulaciones: 0 }), null);
});

test("nota vacía tiene solo el encabezado", () => {
  assert.equal(generarNota({}), "EVOLUCIÓN REUMATOLOGÍA PEDIÁTRICA");
});

test("nota completa incluye todas las secciones en orden", () => {
  const texto = generarNota({
    fecha: "2026-10-14",
    diagnostico: "AIJ poliarticular FR negativo",
    tiempoEvolucion: "2 años",
    subjetivo: "Mejoría del dolor.",
    rigidez: 15,
    articulaciones: 3,
    limitadas: 1,
    detalleArticular: "rodilla derecha",
    medico: 3,
    paciente: 4,
    vsg: 25,
    pcr: 2.5,
    oftalmologia: "08/2026, sin uveítis",
    medicacion: "MTX 15 mg/sem SC",
    tolerancia: "buena",
    adherencia: "buena",
    plan: "Continuar igual.",
    proximoControl: "3 meses",
  });
  assert.equal(texto, [
    "EVOLUCIÓN REUMATOLOGÍA PEDIÁTRICA · 14/10/2026",
    "Diagnóstico: AIJ poliarticular FR negativo (evolución: 2 años)",
    "Motivo / evolución: Mejoría del dolor.",
    "Rigidez matinal: 15 min",
    "Examen articular: 3 articulaciones activas, 1 con limitación (rodilla derecha)",
    "EGM 3/10 · EGP 4/10 · VSG 25 mm/h · PCR 2,5 mg/L",
    "JADAS-10: 10,5 · cJADAS-10: 10",
    "Último control oftalmológico: 08/2026, sin uveítis",
    "Medicación: MTX 15 mg/sem SC",
    "Tolerancia buena, adherencia buena.",
    "Plan: Continuar igual.",
    "Próximo control: 3 meses",
  ].join("\n"));
});

test("singular para una articulación y cero articulaciones se muestra", () => {
  assert.match(generarNota({ articulaciones: 1 }), /1 articulación activa/);
  assert.match(generarNota({ articulaciones: 0 }), /0 articulaciones activas/);
});
