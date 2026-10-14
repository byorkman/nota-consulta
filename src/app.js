import { DIAGNOSTICOS, generarNota, jadas10 } from "./nota.js";

const form = document.getElementById("form");
const nota = document.getElementById("nota");
const estado = document.getElementById("estado");
const NUMERICOS = ["articulaciones", "limitadas", "rigidez", "medico", "paciente", "vsg", "pcr"];

document.getElementById("diagnosticos").innerHTML = DIAGNOSTICOS.map((d) => `<option value="${d}">`).join("");

function hoy() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function leer() {
  const datos = {};
  for (const el of form.elements) {
    if (!el.id) continue;
    const v = el.value.trim();
    datos[el.id] = NUMERICOS.includes(el.id) ? (v === "" ? null : Number(v.replace(",", "."))) : v;
  }
  return datos;
}

function actualizar() {
  const datos = leer();
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
    estado.textContent = "Copiado. Ya lo podés pegar en la historia clínica.";
  } catch {
    nota.select();
    estado.textContent = "No se pudo copiar automáticamente: el texto quedó seleccionado para copiarlo a mano.";
  }
});

document.getElementById("limpiar").addEventListener("click", () => {
  if (!confirm("¿Borrar todos los campos?")) return;
  form.reset();
  document.getElementById("fecha").value = hoy();
  actualizar();
});

document.getElementById("fecha").value = hoy();
form.addEventListener("input", actualizar);
form.addEventListener("change", actualizar);
actualizar();
