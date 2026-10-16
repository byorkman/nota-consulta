import { test } from "node:test";
import assert from "node:assert/strict";
import { codificar, decodificar, textoComparacion } from "../src/codigo.js";

const marcas = (a = [], l = [], e = [], d = []) => ({
  activas: new Set(a), limitadas: new Set(l), entesis: new Set(e), dactilitis: new Set(d),
});

test("el código ida y vuelta conserva las marcas, la fecha y el cJADAS", () => {
  const m = marcas(["rodilla-D", "mcf2-I", "ifpie5-I"], ["rodilla-D"], ["ent-aquiles-I"], ["dedo-pie2-D"]);
  const codigo = codificar({ marcas: m, fecha: "2026-10-14", cjadas: 7.5 });
  assert.match(codigo, /^RP1\.20261014\.[A-Za-z0-9_-]+\.75$/);
  const d = decodificar(`Código para comparar en la próxima consulta: ${codigo}`);
  assert.deepEqual([...d.marcas.activas].sort(), ["ifpie5-I", "mcf2-I", "rodilla-D"]);
  assert.deepEqual([...d.marcas.limitadas], ["rodilla-D"]);
  assert.deepEqual([...d.marcas.entesis], ["ent-aquiles-I"]);
  assert.deepEqual([...d.marcas.dactilitis], ["dedo-pie2-D"]);
  assert.equal(d.fecha, "2026-10-14");
  assert.equal(d.cjadas, 7.5);
});

test("código sin fecha ni cJADAS, y códigos inválidos", () => {
  const d = decodificar(codificar({ marcas: marcas(), fecha: "", cjadas: null }));
  assert.equal(d.fecha, "");
  assert.equal(d.cjadas, null);
  assert.equal(decodificar("cualquier cosa"), null);
  assert.equal(decodificar("RP1.20261014.abc.10"), null);
});

test("comparación con la consulta anterior", () => {
  const previa = decodificar(codificar({ marcas: marcas(["rodilla-D", "tobillo-I"]), fecha: "2026-07-01", cjadas: 10 }));
  assert.equal(
    textoComparacion(previa, marcas(["tobillo-I", "codo-D"]), 4),
    "Respecto a la consulta del 01/07/2026: articulaciones activas 2 → 2 (sin actividad: rodilla der.; nuevas: codo der.); cJADAS-10 10 → 4",
  );
});
