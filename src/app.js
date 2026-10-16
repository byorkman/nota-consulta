import { DIAGNOSTICOS, ESPECIFICOS, actividad, generarNota, jadas10 } from "./nota.js";
import { ENTESIS, DEDOS, dedoDe, resumen } from "./articulaciones.js";
import { codificar, decodificar, textoComparacion } from "./codigo.js";
import { controlOftalmologico } from "./uveitis.js";
import { dibujar } from "./figura.js";

const form = document.getElementById("form");
const nota = document.getElementById("nota");
const estado = document.getElementById("estado");
const NUMERICOS = ["articulaciones", "limitadas", "rigidez", "medico", "paciente", "vsg", "pcr", "peso", "talla", "edadInicio"];
const marcas = { activas: new Set(), limitadas: new Set(), entesis: new Set(), dactilitis: new Set() };
const ES_ENTESIS = new Set(ENTESIS.map((e) => e.id));
const ES_DEDO = new Set(DEDOS.map((d) => d.id));
let previa = null;

const AYUDA = {
  activas: "Tocar las articulaciones activas. Vista de frente: el lado derecho del paciente queda a la izquierda de la pantalla.",
  limitadas: "Tocar las articulaciones con limitación de la movilidad.",
  entesis: "Tocar los rombos de las entesis dolorosas o tumefactas.",
  dactilitis: "Tocar un dedo de la mano o del pie para marcar dactilitis.",
};

const FRASES = {
  subjetivo: ["Sin dolor ni rigidez.", "Sin fiebre.", "Buena tolerancia a la medicación.", "Concurre a la escuela con normalidad."],
  otrosHallazgos: ["Sin rash", "Sin adenopatías", "Sin hepatoesplenomegalia", "Marcha normal"],
  plan: ["Continuar con igual tratamiento.", "Laboratorio de control.", "Control oftalmológico.", "Kinesiología.", "Se explican pautas de alarma."],
};

const OTRO = "__otro";
const diagnostico = document.getElementById("diagnostico");
const diagnosticoOtro = document.getElementById("diagnosticoOtro");
diagnostico.innerHTML = [
  `<option value="">Seleccionar…</option>`,
  ...DIAGNOSTICOS.map((d) => `<option value="${d}">${d}</option>`),
  `<option value="${OTRO}">Otro…</option>`,
].join("");

function hoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function leer() {
  const datos = { tipo: form.querySelector('input[name="tipo"]:checked').value };
  for (const el of form.elements) {
    if (!el.id || el.type === "radio" || el.tagName === "BUTTON") continue;
    const v = el.value.trim();
    datos[el.id] = NUMERICOS.includes(el.id) ? (v === "" ? null : Number(v.replace(",", "."))) : v;
  }
  datos.diagnostico = datos.diagnostico === OTRO ? datos.diagnosticoOtro : datos.diagnostico;
  return datos;
}

const modoActual = () => form.querySelector('input[name="modo"]:checked').value;

function alternar(set, id) {
  if (set.has(id)) set.delete(id);
  else set.add(id);
}

const { puntos, anillos } = dibujar(
  {
    cuerpo: document.getElementById("svg-cuerpo"),
    manos: document.getElementById("svg-manos"),
    pies: document.getElementById("svg-pies"),
  },
  (id) => {
    const modo = modoActual();
    if (ES_ENTESIS.has(id)) alternar(marcas.entesis, id);
    else if (ES_DEDO.has(id)) alternar(marcas.dactilitis, id);
    else if (modo === "dactilitis") {
      const dedo = dedoDe(id);
      if (dedo) alternar(marcas.dactilitis, dedo);
    } else if (modo !== "entesis") alternar(marcas[modo], id);
    pintarYVolcar();
  },
);

// Pinta los puntos y vuelca el recuento y el detalle en los campos del examen.
function pintarYVolcar() {
  for (const [id, nodo] of puntos) {
    const marcada = ES_ENTESIS.has(id) ? marcas.entesis.has(id)
      : ES_DEDO.has(id) ? marcas.dactilitis.has(id)
      : marcas.activas.has(id) || marcas.limitadas.has(id);
    nodo.classList.toggle("activa", marcas.activas.has(id));
    nodo.classList.toggle("limitada", marcas.limitadas.has(id));
    nodo.classList.toggle("marcada", marcada);
    nodo.setAttribute("aria-pressed", marcada);
  }
  for (const [id, anillo] of anillos) anillo.classList.toggle("visible", Boolean(previa?.marcas.activas.has(id)));
  document.body.classList.toggle("con-previa", Boolean(previa));

  const r = resumen(marcas);
  const vacio = !r.activas && !r.limitadas;
  document.getElementById("articulaciones").value = vacio ? "" : r.activas;
  document.getElementById("limitadas").value = vacio ? "" : r.limitadas;
  document.getElementById("detalleActivas").value = r.detalleActivas;
  document.getElementById("detalleLimitadas").value = r.detalleLimitadas;
  document.getElementById("entesitis").value = r.entesitis;
  document.getElementById("dactilitis").value = r.dactilitis;
  actualizar();
}

// Muestra los campos propios del diagnóstico (LES, DMJ, vasculitis).
let especificoActual = null;
function mostrarEspecifico(diag) {
  if (diag === especificoActual) return;
  especificoActual = diag;
  const panel = document.getElementById("especifico");
  const e = ESPECIFICOS[diag];
  panel.hidden = !e;
  panel.innerHTML = e
    ? `<h2>${e.titulo}</h2>` + e.campos.map((c) => `<div class="campo"><label for="${c.id}">${c.etiqueta}</label>`
      + `<input type="${c.tipo === "number" ? "number" : "text"}" id="${c.id}"`
      + (c.tipo === "number" ? ` inputmode="decimal" min="0" step="any"` : "")
      + (c.ejemplo ? ` placeholder="${c.ejemplo}"` : "") + `></div>`).join("")
    : "";
}

function actualizar() {
  const datos = leer();
  const primera = datos.tipo === "primera";
  document.body.classList.toggle("primera", primera);
  diagnosticoOtro.hidden = diagnostico.value !== OTRO;
  mostrarEspecifico(datos.diagnostico);
  document.getElementById("subjetivoLabel").textContent = primera
    ? "Motivo de consulta"
    : "Motivo / evolución desde la última consulta";
  document.getElementById("ayudaModo").textContent = AYUDA[modoActual()];
  document.getElementById("munequito").dataset.modo = modoActual();

  const j = jadas10(datos);
  const nivel = j && actividad(j.cjadas, datos.diagnostico);
  document.getElementById("jadas").textContent = j
    ? [j.jadas !== null ? `JADAS-10: ${j.jadas.toLocaleString("es-AR")}` : null,
      `cJADAS-10: ${j.cjadas.toLocaleString("es-AR")}${nivel ? ` (${nivel})` : ""}`].filter(Boolean).join(" · ")
    : "";

  const u = controlOftalmologico(datos);
  document.getElementById("uveitis").textContent = !u ? ""
    : u.falta ? `Para sugerir la frecuencia de la pesquisa de uveítis falta: ${u.falta.join(", ")}.`
    : `Pesquisa de uveítis sugerida: cada ${u.meses} meses (${u.motivo}).`;

  const hayMarcas = Object.values(marcas).some((s) => s.size);
  if (!primera && previa) datos.comparacion = textoComparacion(previa, marcas, j ? j.cjadas : null);
  if (hayMarcas || j) datos.codigo = codificar({ marcas, fecha: datos.fecha, cjadas: j ? j.cjadas : null });

  nota.value = generarNota(datos);
  estado.textContent = "";
}

// Frases rápidas: agregan el texto al campo.
for (const caja of document.querySelectorAll(".frases")) {
  const campo = document.getElementById(caja.dataset.campo);
  for (const frase of FRASES[caja.dataset.campo]) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "frase";
    b.textContent = frase;
    b.addEventListener("click", () => {
      const actual = campo.value.trim();
      if (!actual) campo.value = frase;
      else if (frase.endsWith(".")) campo.value = `${/[.!?]$/.test(actual) ? actual : `${actual}.`} ${frase}`;
      else campo.value = `${actual}, ${frase.charAt(0).toLowerCase()}${frase.slice(1)}`;
      actualizar();
    });
    caja.append(b);
  }
}

document.getElementById("codigoPrevio").addEventListener("input", (e) => {
  const texto = e.target.value.trim();
  previa = texto ? decodificar(texto) : null;
  document.getElementById("previaEstado").textContent = !texto ? ""
    : previa ? "Se muestran con un anillo las articulaciones activas de la consulta anterior."
    : "El código no es válido. Copiarlo completo desde la nota anterior.";
  pintarYVolcar();
});

document.getElementById("copiar").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(nota.value);
    estado.textContent = "Copiado. Ya se puede pegar en la historia clínica.";
  } catch {
    nota.select();
    estado.textContent = "No se pudo copiar automáticamente: el texto quedó seleccionado para copiarlo a mano.";
  }
});

// Copia el dibujo como imagen PNG; si el navegador no lo permite, lo descarga.
const PROPIEDADES = ["fill", "stroke", "stroke-width", "stroke-opacity", "stroke-dasharray", "stroke-linecap", "opacity", "display", "font-size", "font-family"];

function svgAImagen(svg, ancho) {
  const copia = svg.cloneNode(true);
  const originales = [svg, ...svg.querySelectorAll("*")];
  const copias = [copia, ...copia.querySelectorAll("*")];
  originales.forEach((o, i) => {
    const cs = getComputedStyle(o);
    for (const p of PROPIEDADES) copias[i].style.setProperty(p, cs.getPropertyValue(p));
  });
  copia.querySelectorAll("title").forEach((t) => t.remove());
  const vb = svg.viewBox.baseVal;
  const alto = Math.round((ancho * vb.height) / vb.width);
  copia.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  copia.setAttribute("width", ancho);
  copia.setAttribute("height", alto);
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copia))}`;
  return img.decode().then(() => ({ img, alto }));
}

async function dibujoPNG() {
  const escala = 2;
  const ancho = 480;
  const partes = await Promise.all([
    svgAImagen(document.getElementById("svg-cuerpo"), 260),
    svgAImagen(document.getElementById("svg-manos"), ancho),
    svgAImagen(document.getElementById("svg-pies"), ancho),
  ]);
  const r = resumen(marcas);
  const leyenda = [
    r.activas ? `Activas: ${r.activas}` : null,
    r.limitadas ? `Con limitación: ${r.limitadas}` : null,
    marcas.entesis.size ? `Entesitis: ${marcas.entesis.size}` : null,
    marcas.dactilitis.size ? `Dactilitis: ${marcas.dactilitis.size}` : null,
  ].filter(Boolean).join(" · ") || "Sin marcas";
  const alto = 40 + partes.reduce((n, p) => n + p.alto + 10, 0);
  const canvas = document.createElement("canvas");
  canvas.width = ancho * escala;
  canvas.height = alto * escala;
  const ctx = canvas.getContext("2d");
  ctx.scale(escala, escala);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ancho, alto);
  ctx.fillStyle = "#1c2430";
  ctx.font = "600 15px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(leyenda, ancho / 2, 24);
  let y = 40;
  for (const p of partes) {
    ctx.drawImage(p.img, (ancho - p.img.width) / 2, y, p.img.width, p.alto);
    y += p.alto + 10;
  }
  return new Promise((ok) => canvas.toBlob(ok, "image/png"));
}

const dibujoEstado = document.getElementById("dibujoEstado");
document.getElementById("copiarDibujo").addEventListener("click", async () => {
  const blob = dibujoPNG();
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    dibujoEstado.textContent = "Dibujo copiado como imagen.";
  } catch {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(await blob);
    a.download = "articulaciones.png";
    a.click();
    URL.revokeObjectURL(a.href);
    dibujoEstado.textContent = "Este navegador no permite copiar imágenes: se descargó el dibujo.";
  }
});

function borrarMarcas() {
  for (const s of Object.values(marcas)) s.clear();
  dibujoEstado.textContent = "";
}

document.getElementById("borrarArticulaciones").addEventListener("click", () => {
  borrarMarcas();
  pintarYVolcar();
});

document.getElementById("limpiar").addEventListener("click", () => {
  if (!confirm("¿Borrar todos los campos?")) return;
  form.reset();
  borrarMarcas();
  previa = null;
  document.getElementById("previaEstado").textContent = "";
  document.getElementById("fecha").value = hoy();
  pintarYVolcar();
});

document.getElementById("fecha").value = hoy();
diagnostico.addEventListener("change", () => {
  if (diagnostico.value === OTRO) {
    diagnosticoOtro.hidden = false;
    diagnosticoOtro.focus();
  }
});
form.addEventListener("input", actualizar);
form.addEventListener("change", actualizar);
pintarYVolcar();
