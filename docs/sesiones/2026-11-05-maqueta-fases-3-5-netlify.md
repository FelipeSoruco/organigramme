# 2026-11-05 · Maqueta fases 3–5 y preparación de Netlify

**Objetivo:** cerrar el feedback de las fases 1–2, programar las fases 3–5 y dejar la maqueta lista para mostrarla en Netlify.

## Trabajo realizado
- La sesión se cortó (reinicio del worker) y se retomó: el trabajo previo estaba en la rama `claude/youthful-hamilton-biv87u` y se trajo a `claude/epic-franklin-yhaimq`.
- Modelo: `Contrat` con `historique`, `proposePar` y `echelonId`; `Personne` con `infos` y `documents`; dossier de 10 piezas con % calculado (`data/dossier.ts`); persistencia `organigramme-demo-v2`.
- Circuito de contratos fijo (R-003) en `workflow.ts`; acciones en `store.ts` (proposer, valider, signer direction/collaborateur, renvoyer, refuser, corriger, relancer, inviter, documentos).
- Páginas nuevas: `pages/Postes.tsx`, `pages/Personnes.tsx` (lista + ficha), `pages/Contrats.tsx`, `pages/Portail.tsx`; componentes `Contrat.tsx` (pasos, historial, documento, firma Yousign simulada con código SMS, proposición/corrección), `Toasts.tsx`, Modal/Champ/Section/Puce en `ui.tsx`.
- Tableau de bord: «À traiter» según el rol (o «Contrats en cours» si no puede actuar), circuito por etapa, actividad reciente.
- Correcciones: el panel no tapa el puesto en el organigrama; las listas se angostan con el panel abierto; scroll arriba al cambiar de página; employeurs sin puestos ocultos en el tableau de bord.
- `netlify.toml` (base `maquette`, Node 22, noindex) + meta robots noindex.

## Decisiones
- D-007 Maqueta publicada en Netlify (reemplaza en parte D-006)
- D-008 Regla de «Préparer l’exercice suivant» confirmada

## Pruebas
- `npm run build` y `npm ci && npm run build` (como en Netlify) → OK.
- Recorrido Playwright (21 capturas): proponer embauche, inviter, valider compta, corriger, valider et signer direction, signer collaborateur, déposer document, organigramme como responsable → 0 errores de consola.
- No probado: el despliegue real en Netlify (lo hace Felipe), la subida de foto con una imagen real en el recorrido automático.

## Pendientes
- Nuevos: P-013 (Netlify), P-014 (supuestos del circuito), P-015 (estilo menos serio), P-016 (fusionar a main)
- Resueltos: P-011, P-012 · En curso: P-009 (faltan fases 6–7)

## Qué aprendió Felipe
- Netlify puede construir el sitio directamente desde GitHub: no hace falta instalar nada en el PC, y cada cambio subido actualiza el enlace.
- En esta maqueta los datos viven en el navegador de cada visitante: lo que prueben los responsables del festival no afecta a nadie más, y ↻ lo deja como nuevo.
