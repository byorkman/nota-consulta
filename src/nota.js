// Arma el texto de la evolución a partir de los datos del formulario.
// Solo incluye las líneas que tienen datos.

export const DIAGNOSTICOS = [
  "AIJ oligoarticular persistente",
  "AIJ oligoarticular extendida",
  "AIJ poliarticular FR negativo",
  "AIJ poliarticular FR positivo",
  "AIJ sistémica",
  "Artritis relacionada con entesitis",
  "Artritis psoriásica juvenil",
  "AIJ indiferenciada",
  "Lupus eritematoso sistémico",
  "Dermatomiositis juvenil",
  "Vasculitis",
];

const fmt = (n) => n.toLocaleString("es-AR", { maximumFractionDigits: 1 });

function vacio(v) {
  return v === undefined || v === null || (typeof v === "string" && v.trim() === "") || Number.isNaN(v);
}

export function fechaCorta(iso) {
  if (vacio(iso)) return "";
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

// JADAS-10: articulaciones topeadas en 10; VSG normalizada (VSG-20)/10 entre 0 y 10.
export function jadas10({ medico, paciente, articulaciones, vsg }) {
  if ([medico, paciente, articulaciones].some(vacio)) return null;
  const cjadas = Math.round((medico + paciente + Math.min(articulaciones, 10)) * 10) / 10;
  const jadas = vacio(vsg)
    ? null
    : Math.round((cjadas + (Math.min(Math.max(vsg, 20), 120) - 20) / 10) * 10) / 10;
  return { cjadas, jadas };
}

export function generarNota(d) {
  const lineas = [];
  const agregar = (etiqueta, valor) => {
    if (!vacio(valor)) lineas.push(etiqueta ? `${etiqueta}: ${String(valor).trim()}` : String(valor).trim());
  };

  lineas.push(`EVOLUCIÓN REUMATOLOGÍA PEDIÁTRICA${vacio(d.fecha) ? "" : ` · ${fechaCorta(d.fecha)}`}`);

  if (!vacio(d.diagnostico)) {
    agregar("Diagnóstico", d.diagnostico + (vacio(d.tiempoEvolucion) ? "" : ` (evolución: ${d.tiempoEvolucion.trim()})`));
  }
  agregar("Motivo / evolución", d.subjetivo);
  if (!vacio(d.rigidez)) agregar("Rigidez matinal", `${fmt(d.rigidez)} min`);

  const examen = [];
  if (!vacio(d.articulaciones)) examen.push(`${d.articulaciones} ${d.articulaciones === 1 ? "articulación activa" : "articulaciones activas"}`);
  if (!vacio(d.limitadas)) examen.push(`${d.limitadas} con limitación`);
  if (examen.length || !vacio(d.detalleArticular)) {
    const detalle = vacio(d.detalleArticular) ? "" : d.detalleArticular.trim();
    agregar("Examen articular", examen.length ? examen.join(", ") + (detalle ? ` (${detalle})` : "") : detalle);
  }
  agregar("Otros hallazgos", d.otrosHallazgos);

  const evaluaciones = [];
  if (!vacio(d.medico)) evaluaciones.push(`EGM ${fmt(d.medico)}/10`);
  if (!vacio(d.paciente)) evaluaciones.push(`EGP ${fmt(d.paciente)}/10`);
  if (!vacio(d.vsg)) evaluaciones.push(`VSG ${fmt(d.vsg)} mm/h`);
  if (!vacio(d.pcr)) evaluaciones.push(`PCR ${fmt(d.pcr)} mg/L`);
  if (evaluaciones.length) agregar("", evaluaciones.join(" · "));

  const j = jadas10(d);
  if (j) agregar("", [j.jadas !== null ? `JADAS-10: ${fmt(j.jadas)}` : null, `cJADAS-10: ${fmt(j.cjadas)}`].filter(Boolean).join(" · "));

  agregar("Último control oftalmológico", d.oftalmologia);
  agregar("Medicación", d.medicacion);
  const tolerancia = [
    vacio(d.tolerancia) ? null : `tolerancia ${d.tolerancia}`,
    vacio(d.adherencia) ? null : `adherencia ${d.adherencia}`,
  ].filter(Boolean).join(", ");
  if (tolerancia) agregar("", tolerancia.charAt(0).toUpperCase() + tolerancia.slice(1) + ".");
  agregar("Laboratorio", d.laboratorio);
  agregar("Plan", d.plan);
  agregar("Próximo control", d.proximoControl);

  return lineas.join("\n");
}
