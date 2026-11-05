# Estado — actualizado 2026-11-05

**En curso:** maqueta navegable **completa** (fases 1–7) en `maquette/`, fusionada en `main` (PR #3) y publicada por Netlify en https://organigramme-demo.netlify.app/ (D-007). Lista para mostrar al cliente con `docs/guion-demo.md`.
**Funciona y está verificado** (build OK, recorrido Playwright de 11 pantallas × 5 roles, 0 errores de consola):
- Fases 1–5: layout, 7 roles, años, organigrama, «Préparer 2027» (D-008), postes, personnes, circuito de contratos con firma Yousign simulada (D-009), tableau de bord por rol, portail collaborateur.
- Fase 6: Transmissions Silae/POSI con errores y relance (D-010); la compta deposita piezas que faltan (D-011); Rapports con export CSV; Administration en lectura (Référentiels, Utilisateurs & droits, Connecteurs).
- Fase 7: estilo más ligero (D-012) y guion de demo.
**Publicación:** Netlify publica `main`. Trabajar en la rama de la sesión y fusionar en `main` solo cuando Felipe lo apruebe (la demo cambia en cuanto se fusiona).
**Problemas conocidos:** avisos menores de oxlint (fast refresh, `Date` en el render). La publicación en Netlify tras PR #3 no se comprobó (P-017). «Formules» no está en Référentiels (P-018, depende de P-003).
**Próximo paso concreto:** comprobar la demo en Netlify (P-017) y mostrarla al cliente; después, devis y cahier des charges en francés (P-010).
**Archivos clave:** `maquette/src/store.ts` (acciones), `maquette/src/workflow.ts` (circuito), `maquette/src/transmissions.ts` (envíos), `maquette/src/pages/` (Transmissions, Rapports, Admin, Contrats, Personnes, Portail…), `maquette/src/data/seed.ts` + `dossier.ts`, `maquette/src/index.css` (estilo), `docs/guion-demo.md`
