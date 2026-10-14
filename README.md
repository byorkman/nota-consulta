# Nota de consulta

Plantilla web para armar la evolución de una consulta de reumatología pediátrica y copiarla a la historia clínica. Pensada para usar desde el celular o la computadora del consultorio.

- Formulario por secciones: datos, examen, evaluaciones, tratamiento y plan.
- Calcula el JADAS-10 y el cJADAS-10 con los datos cargados.
- Arma el texto de la evolución con solo las líneas que tienen datos, listo para copiar con un botón.

**No guarda ni envía datos.** El texto se arma en el navegador y se pierde al cerrar la página. No pide el nombre del paciente.

## Ejemplo

```
EVOLUCIÓN REUMATOLOGÍA PEDIÁTRICA · 14/10/2026
Diagnóstico: AIJ poliarticular FR negativo (evolución: 2 años)
Motivo / evolución: Refiere mejoría del dolor matinal.
Rigidez matinal: 15 min
Examen articular: 3 articulaciones activas, 1 con limitación (rodilla derecha, tobillo izquierdo)
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

## Publicar en Vercel

En Vercel: **Add New → Project → Import** este repositorio, con Framework Preset **Other** y sin comando de build. Cada cambio que entre a `main` se publica solo.
