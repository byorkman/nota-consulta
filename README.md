# Nota de consulta

Plantilla web para armar la evolución de una consulta de reumatología pediátrica y copiarla a la historia clínica. Pensada para usar desde el celular o la computadora del consultorio.

- Modo **control** o **primera consulta** (agrega anamnesis: inicio de síntomas, síntomas sistémicos, antecedentes perinatales, personales y familiares, vacunas).
- **Muñequito articular** con las 71 articulaciones del recuento completo: se tocan para marcarlas como activas o con limitación, y la app las cuenta y arma el detalle. También marca **entesitis** (12 sitios del miembro inferior) y **dactilitis** (por dedo).
- **Copiar dibujo** como imagen, para pegarlo en la historia clínica (si el navegador no lo permite, lo descarga).
- **Comparación con la consulta anterior:** la nota termina con un código corto (`RP1.…`) que resume el dibujo, la fecha y el cJADAS-10, sin datos del paciente. Al pegarlo en la consulta siguiente se ven con un anillo las articulaciones activas de antes, y la nota agrega qué mejoró y qué es nuevo.
- Formulario por secciones: datos, examen, evaluaciones, tratamiento y plan, con **frases rápidas** en motivo, hallazgos y plan.
- Campos propios para **LES** (SLEDAI-2K), **dermatomiositis juvenil** (CMAS, MMT8) y **vasculitis** (PVAS) al elegir ese diagnóstico.
- Calcula el JADAS-10 y el cJADAS-10 con los datos cargados, y el **nivel de actividad** con los puntos de corte del ACR 2021 para oligo y poliartritis.
- Sugiere la **frecuencia de la pesquisa de uveítis** según subtipo, ANA, edad al inicio y años de evolución (AAP 2019).

Los puntos de corte del cJADAS, la frecuencia de pesquisa de uveítis, los sitios de entesis y los campos de LES, DMJ y vasculitis están en `src/nota.js`, `src/uveitis.js` y `src/articulaciones.js`, y deben validarse clínicamente.
- Arma el texto de la evolución con solo las líneas que tienen datos, listo para copiar con un botón.

**No guarda ni envía datos.** El texto se arma en el navegador y se pierde al cerrar la página. No pide el nombre del paciente.

## Ejemplo

```
EVOLUCIÓN REUMATOLOGÍA PEDIÁTRICA · 14/10/2026
Diagnóstico: AIJ poliarticular FR negativo (evolución: 2 años)
Motivo / evolución: Refiere mejoría del dolor matinal.
Rigidez matinal: 15 min
Articulaciones activas: 3 (MCF 2 der., rodilla der., tobillo izq.)
Con limitación: 1 (rodilla der.)
EGM 3/10 · EGP 4/10 · VSG 25 mm/h
JADAS-10: 10,5 · cJADAS-10: 10
Medicación: MTX 15 mg/sem SC + ácido fólico
Tolerancia buena.
Plan: Continuar igual. Laboratorio en 3 meses.
```

El formato del texto está en `src/nota.js` (`generarNota`); para cambiar el orden o los títulos se edita esa función.

## Desarrollo

Sitio estático, sin dependencias ni compilación.

```sh
npm test               # pruebas
npx serve .            # o cualquier servidor estático para verlo localmente
```

## Versión

La versión se ve al pie de la página. En cada cambio:

1. Agregar arriba en [`CHANGELOG.md`](CHANGELOG.md) una entrada `## X.Y.Z · día mes año` con lo que cambió.
2. Poner el mismo número en `package.json` y el mismo texto (`vX.Y.Z · día mes año`) en el pie de `index.html`.

Se sube el último número para arreglos y textos, el del medio para funciones nuevas y el primero para cambios grandes. `npm test` avisa si los tres lugares no coinciden.

## Publicar en Vercel

En Vercel: **Add New → Project → Import** este repositorio, con Framework Preset **Other** y sin comando de build. Cada cambio que entre a `main` se publica solo.
