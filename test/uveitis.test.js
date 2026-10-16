import { test } from "node:test";
import assert from "node:assert/strict";
import { aniosDeEvolucion, controlOftalmologico } from "../src/uveitis.js";

test("lee el tiempo de evolución", () => {
  assert.equal(aniosDeEvolucion("2 años"), 2);
  assert.equal(aniosDeEvolucion("18 meses"), 1.5);
  assert.equal(aniosDeEvolucion("1 año y 6 meses"), 1.5);
  assert.equal(aniosDeEvolucion("2,5 años"), 2.5);
  assert.equal(aniosDeEvolucion("desde chico"), null);
});

test("frecuencia según ANA, edad al inicio y evolución", () => {
  const f = (ana, edadInicio, tiempoEvolucion, diagnostico = "AIJ oligoarticular persistente") =>
    controlOftalmologico({ diagnostico, ana, edadInicio, tiempoEvolucion })?.meses;
  assert.equal(f("positivo", 3, "2 años"), 3);
  assert.equal(f("positivo", 3, "5 años"), 6);
  assert.equal(f("positivo", 3, "8 años"), 12);
  assert.equal(f("positivo", 9, "2 años"), 6);
  assert.equal(f("negativo", 4, "2 años"), 6);
  assert.equal(f("negativo", 4, "5 años"), 12);
  assert.equal(f("negativo", 9, "1 año"), 12);
  assert.equal(f("", null, "", "AIJ sistémica"), 12);
  assert.equal(controlOftalmologico({ diagnostico: "Vasculitis" }), null);
  assert.deepEqual(controlOftalmologico({ diagnostico: "AIJ indiferenciada", ana: "", edadInicio: null, tiempoEvolucion: "" }).falta,
    ["ANA", "edad al inicio", "tiempo de evolución"]);
});
