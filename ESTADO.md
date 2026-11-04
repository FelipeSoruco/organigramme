# Estado — actualizado 2026-11-04

**En curso:** maqueta navegable en `maquette/`. Fases 1 (base) y 2 (organigrama) hechas y subidas; esperando la validación visual de Felipe (P-011).
**Funciona y está verificado** (build OK + recorrido Playwright, 0 errores de consola):
- Layout, selector de rol (7) y de año, «Réinitialiser la démo», tableau de bord por rol.
- Organigrama 2026 (42 postes): zoom, plegar, búsqueda, filtro employeur, «Mon périmètre».
- Ficha de poste: titular, % dossier, etapa del circuito, salario oculto fuera del perímetro, affecter/libérer.
- «Préparer 2027» (conserva CDI, resto à pourvoir).
**Problemas conocidos:** al abrir la ficha de un poste en el borde derecho, el panel lo tapa; 3 avisos menores de oxlint.
**Próximo paso concreto:** feedback visual de Felipe → fase 3 (listas y fichas de Postes y Personnes, «Inviter au portail»).
**Archivos clave:** `maquette/src/pages/Organigramme.tsx`, `maquette/src/components/PosteDrawer.tsx`, `maquette/src/data/seed.ts`, `maquette/src/roles.ts`, `maquette/src/store.ts`

## Plan de la maqueta (aprobado 2026-11-04)
1. ✅ Base: menú, selector de rol y año, datos ficticios, réinitialiser.
2. ✅ Organigramme: árbol, ocupado/vacante, color por employeur, zoom, filtros, ficha, «Préparer 2027».
3. Postes y personnes (listas, fichas, % complétude, «Inviter au portail»).
4. Circuito de contratos (À corriger, historial) + tableau de bord por rol.
5. Portail collaborateur (Notes de frais / Congés «Bientôt»).
6. Transmissions simuladas Silae/POSI, BO en lectura, rapports CSV.
7. Pulido visual + recorrido demo completo.
