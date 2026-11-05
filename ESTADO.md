# Estado — actualizado 2026-11-05

**En curso:** maqueta navegable en `maquette/`, publicada en https://organigramme-demo.netlify.app/ (D-007). Fases 1–5 hechas y fusionadas en `main`; faltan las fases 6–7.
**Funciona y está verificado** (build OK, `npm ci` limpio, recorrido Playwright de punta a punta, 0 errores de consola):
- Fases 1–2: layout, 7 roles, años, organigrama 2026, ficha de poste, «Préparer 2027» (D-008).
- Fase 3: Postes (lista, filtros, «Nouveau poste»), Personnes (lista, % dossier, «Inviter au portail», relances, ficha con 10 piezas, NIR/IBAN enmascarados solo para compta/admin).
- Fase 4: Contrats (circuito responsable → compta → direction con firma Yousign simulada → collaborateur; renvoyer, refuser, corriger; historial; aperçu del documento) + tableau de bord por rol (circuito, actividad reciente).
- Fase 5: Portail collaborateur (Marie Dupont): accueil, mes informations con foto, mes documents, mes contrats con firma; Notes de frais y Congés «Bientôt».
- El panel lateral ya no tapa el puesto en el organigrama ni los filtros de las listas.
**Publicación:** Netlify publica la rama `main` (configurado por Felipe 2026-11-05). Trabajar las fases nuevas en la rama de la sesión y fusionar en `main` solo cuando Felipe apruebe, para no cambiar la demo que ve el festival.
**Problemas conocidos:** avisos menores de oxlint (fast refresh). Netlify publica cada push de la rama de producción: el sitio que ve el festival cambia en cuanto se fusiona algo en ella.
**Próximo paso concreto:** fase 6 — Transmissions (journal Silae/POSI con errores y relance), BO en lectura (référentiels, droits, connecteurs), rapports CSV.
**Archivos clave:** `maquette/src/store.ts` (acciones), `maquette/src/workflow.ts` (circuito), `maquette/src/components/Contrat.tsx`, `maquette/src/pages/` (Postes, Personnes, Contrats, Portail), `maquette/src/data/seed.ts` + `dossier.ts`, `netlify.toml`

## Plan de la maqueta (aprobado 2026-11-04)
1. ✅ Base · 2. ✅ Organigramme · 3. ✅ Postes y personnes · 4. ✅ Circuito de contratos + tableau de bord · 5. ✅ Portail collaborateur
6. Transmissions simuladas Silae/POSI, BO en lectura, rapports CSV.
7. Pulido visual (estilo menos serio, P-015) + recorrido demo completo.
