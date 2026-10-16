// Arma el texto de la evolución a partir de los datos del formulario.
// Solo incluye las líneas que tienen datos.
import { controlOftalmologico } from "./uveitis.js";

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

// Campos propios de cada diagnóstico que no es AIJ. A VALIDAR por la médica.
export const ESPECIFICOS = {
  "Lupus eritematoso sistémico": {
    titulo: "Evaluación de LES",
    campos: [
      { id: "les_sledai", etiqueta: "SLEDAI-2K", tipo: "number" },
      { id: "les_manif", etiqueta: "Manifestaciones actuales", ejemplo: "Ej.: artralgias, rash malar, úlceras orales" },
      { id: "les_pa", etiqueta: "Presión arterial", ejemplo: "Ej.: 105/65" },
      { id: "les_orina", etiqueta: "Orina", ejemplo: "Ej.: sin proteinuria, sedimento normal" },
      { id: "les_inmuno", etiqueta: "C3 / C4 / anti-DNA", ejemplo: "Ej.: C3 85, C4 12, anti-DNA 40" },
    ],
  },
  "Dermatomiositis juvenil": {
    titulo: "Evaluación de DMJ",
    campos: [
      { id: "dmj_cmas", etiqueta: "CMAS (0-52)", tipo: "number" },
      { id: "dmj_mmt8", etiqueta: "MMT8 (0-80)", tipo: "number" },
      { id: "dmj_piel", etiqueta: "Piel", ejemplo: "Ej.: Gottron, heliotropo, calcinosis" },
      { id: "dmj_deglucion", etiqueta: "Deglución / voz", ejemplo: "Ej.: sin disfagia ni disfonía" },
      { id: "dmj_enzimas", etiqueta: "Enzimas musculares", ejemplo: "Ej.: CK 150, aldolasa 6" },
    ],
  },
  Vasculitis: {
    titulo: "Evaluación de vasculitis",
    campos: [
      { id: "vas_pvas", etiqueta: "PVAS", tipo: "number" },
      { id: "vas_manif", etiqueta: "Manifestaciones actuales", ejemplo: "Ej.: púrpura, dolor abdominal" },
      { id: "vas_pa", etiqueta: "Presión arterial", ejemplo: "Ej.: 105/65" },
      { id: "vas_orina", etiqueta: "Orina", ejemplo: "Ej.: sin hematuria ni proteinuria" },
    ],
  },
};

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

// Nivel de actividad según el cJADAS-10, con los puntos de corte del ACR 2021
// (Trincianti y col.) para oligoartritis y poliartritis. A VALIDAR por la médica.
const CORTES = { oligo: [1, 2, 4], poli: [1, 5, 15] };
const TIPO_CURSO = {
  "AIJ oligoarticular persistente": "oligo",
  "AIJ oligoarticular extendida": "poli",
  "AIJ poliarticular FR negativo": "poli",
  "AIJ poliarticular FR positivo": "poli",
};
export function actividad(cjadas, diagnostico) {
  const curso = TIPO_CURSO[diagnostico];
  if (!curso || vacio(cjadas)) return null;
  const [inactiva, baja, moderada] = CORTES[curso];
  if (cjadas <= inactiva) return "enfermedad inactiva";
  if (cjadas <= baja) return "actividad baja";
  if (cjadas <= moderada) return "actividad moderada";
  return "actividad alta";
}

export function textoUveitis(d) {
  const u = controlOftalmologico(d);
  if (!u || u.falta) return "";
  return `cada ${u.meses} meses (${u.motivo})`;
}

export function generarNota(d) {
  const lineas = [];
  const agregar = (etiqueta, valor) => {
    if (!vacio(valor)) lineas.push(etiqueta ? `${etiqueta}: ${String(valor).trim()}` : String(valor).trim());
  };

  const primera = d.tipo === "primera";
  const titulo = primera ? "PRIMERA CONSULTA REUMATOLOGÍA PEDIÁTRICA" : "EVOLUCIÓN REUMATOLOGÍA PEDIÁTRICA";
  lineas.push(`${titulo}${vacio(d.fecha) ? "" : ` · ${fechaCorta(d.fecha)}`}`);

  if (!vacio(d.diagnostico)) {
    agregar(primera ? "Diagnóstico presuntivo" : "Diagnóstico",
      d.diagnostico.trim() + (vacio(d.tiempoEvolucion) ? "" : ` (evolución: ${d.tiempoEvolucion.trim()})`));
  }
  const antropometria = [
    vacio(d.peso) ? null : `Peso ${fmt(d.peso)} kg`,
    vacio(d.talla) ? null : `Talla ${fmt(d.talla)} cm`,
  ].filter(Boolean).join(" · ");
  if (antropometria) agregar("", antropometria);
  agregar(primera ? "Motivo de consulta" : "Motivo / evolución", d.subjetivo);
  if (primera) {
    agregar("Inicio de los síntomas", d.inicioSintomas);
    agregar("Síntomas sistémicos", d.sintomasSistemicos);
    agregar("Antecedentes perinatales", d.antPerinatales);
    agregar("Antecedentes personales", d.antPersonales);
    agregar("Antecedentes familiares", d.antFamiliares);
    agregar("Vacunas", d.vacunas);
  }
  if (!vacio(d.rigidez)) agregar("Rigidez matinal", `${fmt(d.rigidez)} min`);

  const conDetalle = (n, detalle) =>
    [vacio(n) ? null : `${n}`, vacio(detalle) ? null : `(${detalle.trim()})`].filter(Boolean).join(" ");
  agregar("Articulaciones activas", conDetalle(d.articulaciones, d.detalleActivas));
  agregar("Con limitación", conDetalle(d.limitadas, d.detalleLimitadas));
  agregar("Entesitis", d.entesitis);
  agregar("Dactilitis", d.dactilitis);
  agregar("Otros hallazgos", d.otrosHallazgos);

  const especifico = ESPECIFICOS[d.diagnostico];
  if (especifico) for (const c of especifico.campos) agregar(c.etiqueta, d[c.id]);

  const evaluaciones = [];
  if (!vacio(d.medico)) evaluaciones.push(`EGM ${fmt(d.medico)}/10`);
  if (!vacio(d.paciente)) evaluaciones.push(`EGP ${fmt(d.paciente)}/10`);
  if (!vacio(d.vsg)) evaluaciones.push(`VSG ${fmt(d.vsg)} mm/h`);
  if (!vacio(d.pcr)) evaluaciones.push(`PCR ${fmt(d.pcr)} mg/L`);
  if (evaluaciones.length) agregar("", evaluaciones.join(" · "));

  const j = jadas10(d);
  if (j) {
    const nivel = actividad(j.cjadas, d.diagnostico);
    agregar("", [
      j.jadas !== null ? `JADAS-10: ${fmt(j.jadas)}` : null,
      `cJADAS-10: ${fmt(j.cjadas)}${nivel ? ` (${nivel})` : ""}`,
    ].filter(Boolean).join(" · "));
  }
  agregar("", d.comparacion);

  agregar("Último control oftalmológico", d.oftalmologia);
  agregar("Pesquisa de uveítis sugerida", textoUveitis(d));
  agregar("Medicación", d.medicacion);
  const tolerancia = [
    vacio(d.tolerancia) ? null : `tolerancia ${d.tolerancia}`,
    vacio(d.adherencia) ? null : `adherencia ${d.adherencia}`,
  ].filter(Boolean).join(", ");
  if (tolerancia) agregar("", tolerancia.charAt(0).toUpperCase() + tolerancia.slice(1) + ".");
  agregar("Laboratorio", d.laboratorio);
  agregar("Plan", d.plan);
  agregar("Próximo control", d.proximoControl);
  agregar("Código para comparar en la próxima consulta", d.codigo);

  return lineas.join("\n");
}
