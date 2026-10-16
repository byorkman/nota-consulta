// Código corto que resume el dibujo de una consulta para compararlo en la
// siguiente. No lleva datos del paciente: solo qué sitios se marcaron, la
// fecha y el cJADAS-10. Formato: RP1.<aaaammdd>.<marcas>.<cJADAS x 10>
import { ARTICULACIONES, ENTESIS, DEDOS, describir } from "./articulaciones.js";

const VERSION = "RP1";
const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const BLOQUES = [
  ["activas", ARTICULACIONES],
  ["limitadas", ARTICULACIONES],
  ["entesis", ENTESIS],
  ["dactilitis", DEDOS],
];
const TOTAL_BITS = BLOQUES.reduce((n, [, lista]) => n + lista.length, 0);
const LARGO = Math.ceil(TOTAL_BITS / 6);

export function codificar({ marcas, fecha, cjadas }) {
  const bits = [];
  for (const [clave, lista] of BLOQUES) {
    for (const s of lista) bits.push(marcas[clave]?.has(s.id) ? 1 : 0);
  }
  while (bits.length % 6) bits.push(0);
  let texto = "";
  for (let i = 0; i < bits.length; i += 6) {
    texto += ALFABETO[bits.slice(i, i + 6).reduce((v, b) => v * 2 + b, 0)];
  }
  const f = fecha ? fecha.replaceAll("-", "") : "";
  const c = cjadas === null || cjadas === undefined ? "" : String(Math.round(cjadas * 10));
  return [VERSION, f, texto, c].join(".");
}

// Acepta el código solo o la línea completa copiada de la nota.
export function decodificar(entrada) {
  const m = new RegExp(`${VERSION}\\.(\\d{8})?\\.([A-Za-z0-9_-]{${LARGO}})\\.(\\d*)`).exec(entrada ?? "");
  if (!m) return null;
  const [, f, texto, c] = m;
  const bits = [];
  for (const ch of texto) {
    const v = ALFABETO.indexOf(ch);
    for (let j = 5; j >= 0; j--) bits.push((v >> j) & 1);
  }
  const marcas = {};
  let i = 0;
  for (const [clave, lista] of BLOQUES) {
    marcas[clave] = new Set(lista.filter(() => bits[i++]).map((s) => s.id));
  }
  return {
    marcas,
    fecha: f ? `${f.slice(0, 4)}-${f.slice(4, 6)}-${f.slice(6)}` : "",
    cjadas: c === "" ? null : Number(c) / 10,
  };
}

const fmt = (n) => n.toLocaleString("es-AR", { maximumFractionDigits: 1 });
const menos = (a, b) => new Set([...a].filter((x) => !b.has(x)));

// Texto de la comparación entre la consulta anterior (decodificada) y la actual.
export function textoComparacion(previa, marcas, cjadas) {
  const antes = previa.marcas.activas;
  const ahora = marcas.activas;
  const partes = [`articulaciones activas ${antes.size} → ${ahora.size}`];
  const detalle = [];
  const resolvieron = describir(menos(antes, ahora));
  const nuevas = describir(menos(ahora, antes));
  if (resolvieron) detalle.push(`sin actividad: ${resolvieron}`);
  if (nuevas) detalle.push(`nuevas: ${nuevas}`);
  if (detalle.length) partes[0] += ` (${detalle.join("; ")})`;
  if (previa.cjadas !== null && cjadas !== null && cjadas !== undefined) {
    partes.push(`cJADAS-10 ${fmt(previa.cjadas)} → ${fmt(cjadas)}`);
  }
  const [a, m, d] = previa.fecha ? previa.fecha.split("-") : [];
  const cuando = previa.fecha ? `la consulta del ${d}/${m}/${a}` : "la consulta anterior";
  return `Respecto a ${cuando}: ${partes.join("; ")}`;
}
