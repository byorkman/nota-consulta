import { test } from "node:test";
import assert from "node:assert/strict";
import { ARTICULACIONES, describir, resumen } from "../src/articulaciones.js";

test("son las 71 articulaciones del recuento completo, sin repetir", () => {
  assert.equal(ARTICULACIONES.length, 71);
  assert.equal(new Set(ARTICULACIONES.map((a) => a.id)).size, 71);
});

test("describe por lado y agrupa las bilaterales", () => {
  assert.equal(describir(["rodilla-D"]), "rodilla der.");
  assert.equal(describir(["tobillo-D", "tobillo-I"]), "tobillo bilateral");
  assert.equal(describir(["mcf2-D", "mcf3-D", "mcf2-I", "mcf3-I"]), "MCF 2 y 3 bilateral");
  assert.equal(describir(["mcf2-D", "mcf3-I"]), "MCF 2 der., MCF 3 izq.");
  assert.equal(describir(["cervical"]), "columna cervical");
});

test("ordena de proximal a distal", () => {
  assert.equal(describir(["mtf1-I", "rodilla-D", "codo-I"]), "codo izq., rodilla der., MTF 1 izq.");
});

test("resumen cuenta activas y limitadas por separado", () => {
  const r = resumen({ activas: new Set(["rodilla-D", "tobillo-I"]), limitadas: new Set(["rodilla-D"]) });
  assert.equal(r.activas, 2);
  assert.equal(r.limitadas, 1);
  assert.equal(r.detalleActivas, "rodilla der., tobillo izq.");
  assert.equal(r.detalleLimitadas, "rodilla der.");
});

test("entesis y dedos se describen por lado", async () => {
  const { ENTESIS, DEDOS, dedoDe, describirEntesis, describirDactilitis } = await import("../src/articulaciones.js");
  assert.equal(ENTESIS.length, 12);
  assert.equal(DEDOS.length, 20);
  assert.equal(describirEntesis(["ent-aquiles-D", "ent-aquiles-I"]), "inserción del tendón de Aquiles bilateral");
  assert.equal(describirDactilitis(["dedo-pie2-D", "dedo-mano3-I"]), "dedo de la mano 3 izq., dedo del pie 2 der.");
  assert.equal(dedoDe("ifp3-D"), "dedo-mano3-D");
  assert.equal(dedoDe("ifp1-I"), "dedo-mano1-I");
  assert.equal(dedoDe("mtf4-I"), "dedo-pie4-I");
  assert.equal(dedoDe("rodilla-D"), null);
});
