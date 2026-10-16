// Frecuencia sugerida de pesquisa de uveítis en AIJ, según subtipo, ANA, edad
// al inicio y años de evolución (AAP 2019, Angeles-Han y col.).
// A VALIDAR por la médica antes de usarlo en la práctica.

const SEGUN_RIESGO = [
  "AIJ oligoarticular persistente",
  "AIJ oligoarticular extendida",
  "AIJ poliarticular FR negativo",
  "Artritis psoriásica juvenil",
  "AIJ indiferenciada",
];
const ANUAL = ["AIJ poliarticular FR positivo", "AIJ sistémica", "Artritis relacionada con entesitis"];

// "2 años", "18 meses", "1 año y 6 meses", "2,5 años" -> años (número) o null.
export function aniosDeEvolucion(texto) {
  if (!texto) return null;
  const t = texto.toLowerCase().replace(",", ".");
  const anios = /(\d+(?:\.\d+)?)\s*a(?:ñ|n)o/.exec(t);
  const meses = /(\d+(?:\.\d+)?)\s*mes/.exec(t);
  if (!anios && !meses) return null;
  return (anios ? Number(anios[1]) : 0) + (meses ? Number(meses[1]) / 12 : 0);
}

// Devuelve { meses, motivo } o { falta } cuando faltan datos, o null si no aplica.
export function controlOftalmologico({ diagnostico, ana, edadInicio, tiempoEvolucion }) {
  if (ANUAL.includes(diagnostico)) return { meses: 12, motivo: "por el subtipo" };
  if (!SEGUN_RIESGO.includes(diagnostico)) return null;
  const anios = aniosDeEvolucion(tiempoEvolucion);
  const sinEdad = edadInicio === null || edadInicio === undefined || Number.isNaN(edadInicio);
  const faltan = [
    ana === "positivo" || ana === "negativo" ? null : "ANA",
    sinEdad ? "edad al inicio" : null,
    anios === null ? "tiempo de evolución" : null,
  ].filter(Boolean);
  if (faltan.length) return { falta: faltan };

  const temprano = edadInicio < 7;
  const positivo = ana === "positivo";
  let meses;
  if (positivo && temprano) meses = anios <= 4 ? 3 : anios <= 7 ? 6 : 12;
  else if (positivo || temprano) meses = anios <= 4 ? 6 : 12;
  else meses = 12;

  const motivo = [
    `ANA ${ana}`,
    temprano ? "inicio antes de los 7 años" : "inicio a los 7 años o más",
    anios <= 4 ? "hasta 4 años de evolución" : anios <= 7 ? "entre 4 y 7 años de evolución" : "más de 7 años de evolución",
  ].join(", ");
  return { meses, motivo };
}
