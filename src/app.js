import { DIAGNOSTICOS, generarNota, jadas10 } from "./nota.js";
import { resumen } from "./articulaciones.js";
import { dibujar } from "./figura.js";

const form = document.getElementById("form");
const nota = document.getElementById("nota");
const estado = document.getElementById("estado");
const NUMERICOS = ["articulaciones", "limitadas", "rigidez", "medico", "paciente", "vsg", "pcr", "peso", "talla"];
const marcas = { activas: new Set(), limitadas: new Set() };

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
    if (!el.id || el.type === "radio") continue;
    const v = el.value.trim();
    datos[el.id] = NUMERICOS.includes(el.id) ? (v === "" ? null : Number(v.replace(",", "."))) : v;
  }
  datos.diagnostico = datos.diagnostico === OTRO ? datos.diagnosticoOtro : datos.diagnostico;
  return datos;
}

const puntos = dibujar(
  {
    cuerpo: document.getElementById("svg-cuerpo"),
    manos: document.getElementById("svg-manos"),
    pies: document.getElementById("svg-pies"),
  },
  (id) => {
    const modo = form.querySelector('input[name="modo"]:checked').value;
    const set = marcas[modo];
    if (set.has(id)) set.delete(id);
    else set.add(id);
    pintarYVolcar();
  },
);

// Pinta los puntos y vuelca el recuento y el detalle en los campos del examen.
function pintarYVolcar() {
  for (const [id, c] of puntos) {
    c.classList.toggle("activa", marcas.activas.has(id));
    c.classList.toggle("limitada", marcas.limitadas.has(id));
    c.setAttribute("aria-pressed", marcas.activas.has(id) || marcas.limitadas.has(id));
  }
  const r = resumen(marcas);
  const vacio = !r.activas && !r.limitadas;
  document.getElementById("articulaciones").value = vacio ? "" : r.activas;
  document.getElementById("limitadas").value = vacio ? "" : r.limitadas;
  document.getElementById("detalleActivas").value = r.detalleActivas;
  document.getElementById("detalleLimitadas").value = r.detalleLimitadas;
  actualizar();
}

function actualizar() {
  const datos = leer();
  const primera = datos.tipo === "primera";
  document.body.classList.toggle("primera", primera);
  diagnosticoOtro.hidden = diagnostico.value !== OTRO;
  document.getElementById("subjetivoLabel").textContent = primera
    ? "Motivo de consulta"
    : "Motivo / evolución desde la última consulta";
  nota.value = generarNota(datos);
  const j = jadas10(datos);
  document.getElementById("jadas").textContent = j
    ? [j.jadas !== null ? `JADAS-10: ${j.jadas.toLocaleString("es-AR")}` : null, `cJADAS-10: ${j.cjadas.toLocaleString("es-AR")}`].filter(Boolean).join(" · ")
    : "";
  estado.textContent = "";
}

document.getElementById("copiar").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(nota.value);
    estado.textContent = "Copiado. Ya se puede pegar en la historia clínica.";
  } catch {
    nota.select();
    estado.textContent = "No se pudo copiar automáticamente: el texto quedó seleccionado para copiarlo a mano.";
  }
});

document.getElementById("borrarArticulaciones").addEventListener("click", () => {
  marcas.activas.clear();
  marcas.limitadas.clear();
  pintarYVolcar();
});

document.getElementById("limpiar").addEventListener("click", () => {
  if (!confirm("¿Borrar todos los campos?")) return;
  form.reset();
  marcas.activas.clear();
  marcas.limitadas.clear();
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
actualizar();
