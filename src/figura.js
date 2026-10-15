// Dibuja las siluetas y los puntos de las articulaciones en los SVG.
import { ARTICULACIONES, describir } from "./articulaciones.js";

const NS = "http://www.w3.org/2000/svg";

function el(nombre, attrs) {
  const e = document.createElementNS(NS, nombre);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

function texto(svg, contenido, attrs) {
  const t = el("text", { class: "lado", ...attrs });
  t.textContent = contenido;
  svg.append(t);
}

function linea(svg, puntos, ancho) {
  svg.append(el("polyline", {
    points: puntos.map((p) => p.join(",")).join(" "),
    class: "silueta", "stroke-width": ancho, fill: "none",
  }));
}

function cuerpo(svg) {
  svg.append(el("circle", { cx: 100, cy: 28, r: 17, class: "silueta-relleno" }));
  linea(svg, [[100, 45], [100, 72]], 12);
  svg.append(el("rect", { x: 70, y: 72, width: 60, height: 132, rx: 18, class: "silueta-relleno" }));
  for (const s of [1, -1]) {
    const x = (v) => (s === 1 ? v : 200 - v);
    linea(svg, [[x(72), 86], [x(56), 140], [x(48), 188], [x(44), 208]], 13);
    linea(svg, [[x(86), 196], [x(84), 282], [x(84), 356], [x(76), 372]], 16);
  }
  texto(svg, "Derecha", { x: 22, y: 395 });
  texto(svg, "Izquierda", { x: 178, y: 395, "text-anchor": "end" });
}

function manos(svg) {
  for (const lado of ["D", "I"]) {
    const x = (v) => (lado === "D" ? v : 240 - v);
    svg.append(el("rect", { x: Math.min(x(26), x(98)), y: 76, width: 72, height: 58, rx: 14, class: "silueta-relleno" }));
    for (const px of [36, 54, 72, 90]) linea(svg, [[x(px), 80], [x(px), 16]], 12);
    linea(svg, [[x(28), 104], [x(10), 76], [x(4), 62]], 12);
    texto(svg, lado === "D" ? "Mano der." : "Mano izq.", { x: x(60), y: 147, "text-anchor": "middle" });
  }
}

function pies(svg) {
  for (const lado of ["D", "I"]) {
    const x = (v) => (lado === "D" ? v : 240 - v);
    svg.append(el("rect", { x: Math.min(x(28), x(108)), y: 42, width: 80, height: 62, rx: 18, class: "silueta-relleno" }));
    for (const px of [100, 84, 68, 52, 36]) linea(svg, [[x(px), 46], [x(px), 14]], px === 100 ? 14 : 10);
    texto(svg, lado === "D" ? "Pie der." : "Pie izq.", { x: x(68), y: 117, "text-anchor": "middle" });
  }
}

// Devuelve un mapa id -> <circle> para poder pintarlos.
export function dibujar(svgs, alTocar) {
  cuerpo(svgs.cuerpo);
  manos(svgs.manos);
  pies(svgs.pies);
  const puntos = new Map();
  for (const a of ARTICULACIONES) {
    const r = a.vista === "cuerpo" ? 7 : 6;
    const c = el("circle", { cx: a.x, cy: a.y, r, class: "articulacion", tabindex: 0, role: "button" });
    const titulo = el("title", {});
    titulo.textContent = describir([a.id]);
    c.append(titulo);
    c.addEventListener("click", () => alTocar(a.id));
    c.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        alTocar(a.id);
      }
    });
    svgs[a.vista].append(c);
    puntos.set(a.id, c);
  }
  return puntos;
}
