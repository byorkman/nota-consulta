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
    detalleActivas: "rodilla der., tobillo izq., MCF 2 der.",
    detalleLimitadas: "rodilla der.",
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
    "Articulaciones activas: 3 (rodilla der., tobillo izq., MCF 2 der.)",
    "Con limitación: 1 (rodilla der.)",
    "EGM 3/10 · EGP 4/10 · VSG 25 mm/h · PCR 2,5 mg/L",
    "JADAS-10: 10,5 · cJADAS-10: 10 (actividad moderada)",
    "Último control oftalmológico: 08/2026, sin uveítis",
    "Medicación: MTX 15 mg/sem SC",
    "Tolerancia buena, adherencia buena.",
    "Plan: Continuar igual.",
    "Próximo control: 3 meses",
  ].join("\n"));
});

test("cero articulaciones activas se muestra", () => {
  assert.match(generarNota({ articulaciones: 0 }), /Articulaciones activas: 0/);
});

test("primera consulta cambia el título e incluye la anamnesis", () => {
  const texto = generarNota({
    tipo: "primera",
    diagnostico: "AIJ oligoarticular persistente",
    peso: 24.5,
    talla: 125,
    subjetivo: "Tumefacción de rodilla.",
    inicioSintomas: "Hace 2 meses.",
    antFamiliares: "Madre con psoriasis.",
    vacunas: "Completas.",
  });
  assert.equal(texto, [
    "PRIMERA CONSULTA REUMATOLOGÍA PEDIÁTRICA",
    "Diagnóstico presuntivo: AIJ oligoarticular persistente",
    "Peso 24,5 kg · Talla 125 cm",
    "Motivo de consulta: Tumefacción de rodilla.",
    "Inicio de los síntomas: Hace 2 meses.",
    "Antecedentes familiares: Madre con psoriasis.",
    "Vacunas: Completas.",
  ].join("\n"));
});

test("en control no aparece la anamnesis aunque haya datos", () => {
  assert.doesNotMatch(generarNota({ tipo: "control", antFamiliares: "x" }), /Antecedentes/);
});

test("nivel de actividad según el curso oligo o poli", async () => {
  const { actividad } = await import("../src/nota.js");
  assert.equal(actividad(1, "AIJ oligoarticular persistente"), "enfermedad inactiva");
  assert.equal(actividad(3, "AIJ oligoarticular persistente"), "actividad moderada");
  assert.equal(actividad(3, "AIJ poliarticular FR negativo"), "actividad baja");
  assert.equal(actividad(16, "AIJ poliarticular FR positivo"), "actividad alta");
  assert.equal(actividad(3, "AIJ sistémica"), null);
});

test("entesitis, dactilitis, campos de LES y pesquisa de uveítis en la nota", () => {
  const texto = generarNota({
    diagnostico: "Lupus eritematoso sistémico",
    entesitis: "inserción del tendón de Aquiles bilateral",
    dactilitis: "dedo del pie 2 der.",
    les_sledai: "4",
    les_pa: "105/65",
  });
  assert.match(texto, /Entesitis: inserción del tendón de Aquiles bilateral/);
  assert.match(texto, /Dactilitis: dedo del pie 2 der\./);
  assert.match(texto, /SLEDAI-2K: 4\nPresión arterial: 105\/65/);
  const aij = generarNota({ diagnostico: "AIJ oligoarticular persistente", ana: "positivo", edadInicio: 3, tiempoEvolucion: "1 año" });
  assert.match(aij, /Pesquisa de uveítis sugerida: cada 3 meses \(ANA positivo, inicio antes de los 7 años, hasta 4 años de evolución\)/);
});
