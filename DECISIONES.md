# Decisiones

## D-009 · 2026-11-05 · Reglas del circuito de contratos
- **Decisión:** (1) un responsable de servicio propone solo en su servicio; comptabilité (y admin) en todos; (2) un contrato «À corriger» vuelve a quien lo propuso; (3) un contrato refusé deja el puesto «à pourvoir».
- **Motivo:** confirmado por Felipe (P-014); ya implementado en `maquette/src/workflow.ts`, `roles.ts` y `store.ts`.
- **Origen:** conversación 2026-11-05

## D-008 · 2026-11-05 · Regla de «Préparer l’exercice suivant»
- **Decisión:** al preparar el año siguiente se copian todos los puestos; los CDI conservan a su titular, los CDD, stages y prestations quedan «à pourvoir».
- **Motivo:** confirmado por Felipe (P-012).
- **Origen:** docs/sesiones/2026-11-05-maqueta-fases-3-5-netlify.md

## D-007 · 2026-11-05 · Maqueta publicada en Netlify (reemplaza en parte D-006)
- **Decisión:** la maqueta se publica en Netlify desde GitHub (`netlify.toml` en la raíz, construye `maquette/`, marcada noindex). Sigue sin servidor: cada visitante tiene sus datos en su navegador.
- **Motivo:** Felipe no logró instalarla en su PC y quiere mostrarla a los responsables del festival con un enlace.
- **Descartado:** solo en local — difícil de mostrar; Netlify CLI con token — innecesario, la importación desde GitHub se actualiza sola en cada push.
- **Origen:** docs/sesiones/2026-11-05-maqueta-fases-3-5-netlify.md

## D-006 · 2026-11-04 · Maqueta primero, en local (en parte reemplazada por D-007)
- **Decisión:** antes del producto real, una maqueta navegable en local (Vite + React + TS + Tailwind, datos ficticios en el navegador, selector de rol y de año).
- **Motivo:** vender la solución y cerrar el alcance; el cliente valora sobre todo lo visual.
- **Descartado:** producto real directo — demasiado riesgo sin alcance validado. Netlify + Neon queda para la versión real.
- **Origen:** conversación 2026-11-04

## D-005 · 2026-11-04 · Estados del circuito fijos en código
- **Decisión:** estados fijos; el BO solo permite renombrarlos.
- **Motivo:** un circuito configurable rompe firmas y transmisiones.
- **Descartado:** statuts configurables como en Organigram.
- **Origen:** conversación 2026-11-04

## D-004 · 2026-11-04 · Circuito de contratación
- **Decisión:** responsable de servicio propone → comptabilité valida → direction valida y firma (Yousign) → collaborateur firma → contrato vigente → envío a Silae; sincronización anual hacia POSI.
- **Motivo:** proceso real descrito por Felipe. Cada paso puede devolver «À corriger».
- **Origen:** conversación 2026-11-04

## D-003 · 2026-11-04 · Un puesto = una persona por año
- **Decisión:** cada puesto anual lo ocupa una sola persona; el organigrama muestra ocupado/vacante.
- **Motivo:** confirmado por Felipe.
- **Descartado:** puestos con capacidad (8/12).
- **Origen:** conversación 2026-11-04

## D-002 · 2026-11-04 · Organigrama y asignación en el FO
- **Decisión:** crear los puestos del año, su jerarquía y asignar personas se hace en el Espace de travail (solo RH/admin editan). El BO es solo para catálogos y reglas.
- **Motivo:** es la tarea principal del año; no obligar a saltar entre espacios.
- **Descartado:** ponerlo en el BO.
- **Origen:** conversación 2026-11-04

## D-001 · 2026-11-04 · Tres espacios, sin «blocks»
- **Decisión:** Espace de travail (FO), Administration (BO), Portail collaborateur. No se replican los «blocks» configurables por usuario de Organigram.
- **Motivo:** los blocks añaden complejidad sin beneficio.
- **Origen:** conversación 2026-11-04
