# Estado — actualizado 2026-11-04

**En curso:** maqueta navegable en `maquette/`. Fases 1 (base) y 2 (organigrama) hechas; esperando la validación visual de Felipe.
**Funciona y está verificado** (build OK + recorrido Playwright, sin errores de consola):
- Layout (menú lateral, selector de rol y de año, réinitialiser), tableau de bord por rol.
- Organigrama 2026: 42 postes, zoom/desplazamiento, plegar ramas, búsqueda, filtro por employeur, «Mon périmètre» para roles restringidos.
- Ficha de poste: titular, % de dossier, etapa del circuito, salario oculto fuera del perímetro, affecter/libérer (compta/admin).
- «Préparer 2027»: copia la jerarquía, conserva los CDI y deja el resto à pourvoir.
- El rol Collaborateur muestra un portal provisional (fase 5). Las demás pantallas muestran «Bientôt» con su fase.
**Problemas conocidos:** avisos de oxlint menores (sin errores). Al abrir la ficha de un poste del borde derecho, el panel lo tapa (no centra la vista).
**Próximo paso concreto:** feedback visual de Felipe → fase 3 (postes y personnes).
**Archivos clave:** `maquette/src/pages/Organigramme.tsx`, `maquette/src/components/PosteDrawer.tsx`, `maquette/src/data/seed.ts`, `maquette/src/roles.ts`, `maquette/src/store.ts`

## Plan de la maqueta (aprobado 2026-11-04)
1. Base: menú lateral, selector de rol (Resp. Accueil, Resp. Presse, Comptabilité, Direction, Lecteur Stagiaires, Collaborateur, Admin) y de año; ~3 employeurs, ~8 services, ~40 postes/año, ~35 personnes; botón «Réinitialiser la démo».
2. Organigramme: árbol, ocupado/vacante, color por employeur, zoom, filtros, ficha de poste, «Préparer 2027 à partir de 2026».
3. Postes y personnes (listas, fichas, % complétude, «Inviter au portail»).
4. Circuito de contratos (À corriger, historial) + tableau de bord por rol.
5. Portail collaborateur (Notes de frais / Congés «Bientôt»).
6. Transmissions simuladas Silae/POSI, BO en lectura, rapports CSV.
7. Pulido visual + recorrido demo completo.
