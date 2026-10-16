// Las 71 articulaciones del recuento articular completo (JADAS-71), con su
// posición en el dibujo. Vista anterior: el lado derecho del paciente queda a
// la izquierda de la pantalla.
//
// vista: "cuerpo" (viewBox 200x400), "manos" (240x150), "pies" (240x110).

const art = (id, grupo, numero, lado, vista, x, y) => ({ id, grupo, numero, lado, vista, x, y });

function cuerpo() {
  const pares = [
    ["atm", "ATM", 90, 36],
    ["ec", "esternoclavicular", 93, 78],
    ["ac", "acromioclavicular", 78, 76],
    ["hombro", "hombro", 68, 90],
    ["codo", "codo", 56, 140],
    ["muneca", "muñeca", 48, 188],
    ["cadera", "cadera", 84, 202],
    ["rodilla", "rodilla", 84, 282],
    ["tobillo", "tobillo", 84, 356],
  ];
  const lista = [art("cervical", "columna cervical", null, null, "cuerpo", 100, 60)];
  for (const [id, grupo, x, y] of pares) {
    lista.push(art(`${id}-D`, grupo, null, "D", "cuerpo", x, y));
    lista.push(art(`${id}-I`, grupo, null, "I", "cuerpo", 200 - x, y));
  }
  return lista;
}

// Mano derecha en la mitad izquierda (pulgar hacia afuera), mano izquierda espejada.
function manos() {
  const lista = [];
  const dedos = { 2: 36, 3: 54, 4: 72, 5: 90 };
  for (const lado of ["D", "I"]) {
    const x = (v) => (lado === "D" ? v : 240 - v);
    lista.push(art(`mcf1-${lado}`, "MCF", 1, lado, "manos", x(22), 98));
    lista.push(art(`ifp1-${lado}`, "IF pulgar", null, lado, "manos", x(10), 76));
    for (const [n, px] of Object.entries(dedos)) {
      lista.push(art(`mcf${n}-${lado}`, "MCF", Number(n), lado, "manos", x(px), 78));
      lista.push(art(`ifp${n}-${lado}`, "IFP", Number(n), lado, "manos", x(px), 52));
      lista.push(art(`ifd${n}-${lado}`, "IFD", Number(n), lado, "manos", x(px), 30));
    }
  }
  return lista;
}

// Pie derecho en la mitad izquierda (hallux hacia el medio), pie izquierdo espejado.
function pies() {
  const lista = [];
  const dedos = { 1: 100, 2: 84, 3: 68, 4: 52, 5: 36 };
  for (const lado of ["D", "I"]) {
    const x = (v) => (lado === "D" ? v : 240 - v);
    lista.push(art(`subastragalina-${lado}`, "subastragalina", null, lado, "pies", x(68), 96));
    lista.push(art(`tarso-${lado}`, "tarso medio", null, lado, "pies", x(68), 74));
    for (const [n, px] of Object.entries(dedos)) {
      lista.push(art(`mtf${n}-${lado}`, "MTF", Number(n), lado, "pies", x(px), 48));
      lista.push(art(`ifpie${n}-${lado}`, "IF pie", Number(n), lado, "pies", x(px), 24));
    }
  }
  return lista;
}

export const ARTICULACIONES = [...cuerpo(), ...manos(), ...pies()];

// Sitios de entesis del miembro inferior (artritis relacionada con entesitis),
// en la vista del cuerpo.
function entesis() {
  const sitios = [
    ["trocanter", "trocánter mayor", 72, 214],
    ["cuadriceps", "inserción del cuádriceps", 84, 266],
    ["rotula", "polo inferior de la rótula", 84, 296],
    ["tibia", "tuberosidad anterior de la tibia", 84, 310],
    ["aquiles", "inserción del tendón de Aquiles", 94, 364],
    ["plantar", "fascia plantar en el calcáneo", 82, 382],
  ];
  const lista = [];
  for (const [id, grupo, x, y] of sitios) {
    lista.push(art(`ent-${id}-D`, grupo, null, "D", "cuerpo", x, y));
    lista.push(art(`ent-${id}-I`, grupo, null, "I", "cuerpo", 200 - x, y));
  }
  return lista;
}

export const ENTESIS = entesis();
const ORDEN_ENTESIS = [...new Set(ENTESIS.map((e) => e.grupo))];

// Dedos para marcar dactilitis (1 = pulgar o hallux).
export const DEDOS = ["D", "I"].flatMap((lado) => [
  ...[1, 2, 3, 4, 5].map((n) => art(`dedo-mano${n}-${lado}`, "dedo de la mano", n, lado, "manos")),
  ...[1, 2, 3, 4, 5].map((n) => art(`dedo-pie${n}-${lado}`, "dedo del pie", n, lado, "pies")),
]);
const ORDEN_DEDOS = ["dedo de la mano", "dedo del pie"];

// Dedo al que pertenece una articulación de la mano o del pie, o null.
export function dedoDe(id) {
  const mano = /^(?:mcf|ifp|ifd)(\d)-([DI])$/.exec(id);
  if (mano) return `dedo-mano${mano[1]}-${mano[2]}`;
  const pie = /^(?:mtf|ifpie)(\d)-([DI])$/.exec(id);
  if (pie) return `dedo-pie${pie[1]}-${pie[2]}`;
  return null;
}

// Orden en que se describen los grupos.
const ORDEN = [
  "ATM", "columna cervical", "esternoclavicular", "acromioclavicular", "hombro", "codo",
  "muñeca", "MCF", "IF pulgar", "IFP", "IFD", "cadera", "rodilla", "tobillo",
  "subastragalina", "tarso medio", "MTF", "IF pie",
];

const LADO = { D: "der.", I: "izq." };

function unirNumeros(nums) {
  const n = [...nums].sort((a, b) => a - b);
  return n.length === 1 ? `${n[0]}` : `${n.slice(0, -1).join(", ")} y ${n[n.length - 1]}`;
}

// ids: Set o array de ids marcados. Devuelve un texto como
// "rodilla der., tobillos bilateral, MCF 2 y 3 der."
export function describir(ids, lista = ARTICULACIONES, orden = ORDEN) {
  const marcadas = lista.filter((a) => (ids.has ? ids.has(a.id) : ids.includes(a.id)));
  const partes = [];
  for (const grupo of orden) {
    const delGrupo = marcadas.filter((a) => a.grupo === grupo);
    if (!delGrupo.length) continue;
    if (delGrupo[0].lado === null) {
      partes.push(grupo);
      continue;
    }
    const conNumero = delGrupo[0].numero !== null;
    const porLado = { D: [], I: [] };
    for (const a of delGrupo) porLado[a.lado].push(a.numero);
    if (!conNumero) {
      partes.push(porLado.D.length && porLado.I.length
        ? `${grupo} bilateral`
        : `${grupo} ${LADO[porLado.D.length ? "D" : "I"]}`);
      continue;
    }
    const ambos = porLado.D.length && porLado.I.length;
    if (ambos && unirNumeros(porLado.D) === unirNumeros(porLado.I)) {
      partes.push(`${grupo} ${unirNumeros(porLado.D)} bilateral`);
    } else {
      for (const l of ["D", "I"]) {
        if (porLado[l].length) partes.push(`${grupo} ${unirNumeros(porLado[l])} ${LADO[l]}`);
      }
    }
  }
  return partes.join(", ");
}

export const describirEntesis = (ids) => describir(ids, ENTESIS, ORDEN_ENTESIS);
export const describirDactilitis = (ids) => describir(ids, DEDOS, ORDEN_DEDOS);

// marcas: { activas, limitadas, entesis, dactilitis }, cada una un Set.
// Devuelve los datos para la nota.
export function resumen({ activas, limitadas, entesis = new Set(), dactilitis = new Set() }) {
  return {
    activas: activas.size,
    limitadas: limitadas.size,
    detalleActivas: describir(activas),
    detalleLimitadas: describir(limitadas),
    entesitis: describirEntesis(entesis),
    dactilitis: describirDactilitis(dactilitis),
  };
}
