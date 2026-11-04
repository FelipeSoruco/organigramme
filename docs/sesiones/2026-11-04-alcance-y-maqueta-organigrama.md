# 2026-11-04 · Alcance de la plataforma RH y maqueta (fases 1–2)

**Objetivo:** pasar de la conversación con GPT (presupuesto, módulos) a una visión clara del producto y empezar la maqueta navegable.

## Trabajo realizado
- Visión del producto: 3 espacios (Espace de travail / Administration / Portail collaborateur), módulos y modelo de datos (employeur, service, emploi, échelon, type de contrat, poste anual con `parentId`, personne + datos sensibles aparte, compte/rôle/périmètre, contrat + historial, signature, document, transmission).
- Memoria del proyecto creada: `CLAUDE.md`, `ESTADO.md`, `REGLAS.md` (R-001…R-005), `DECISIONES.md` (D-001…D-006), `PENDIENTES.md`.
- Maqueta `maquette/` (Vite + React + TS + Tailwind, zustand con persistencia en el navegador):
  - Layout con menú lateral, selector de exercice y de rol (7 roles), botón «Réinitialiser la démo».
  - Tableau de bord por rol (KPIs, «À traiter», répartition par employeur).
  - Organigramme 2026 (42 postes ficticios): zoom/desplazamiento, plegar ramas, búsqueda, filtro por employeur, «Mon périmètre».
  - Ficha de poste (`PosteDrawer.tsx`): titular, % dossier, etapas del circuito, salario oculto fuera del perímetro, affecter/libérer.
  - «Préparer 2027»: copia jerarquía, conserva CDI, el resto queda à pourvoir.
  - Pantallas futuras con «Bientôt · phase N»; portal collaborateur provisional.
- Commits `ba15b2a` (memoria) y `6177a56` (maqueta), subidos a `claude/youthful-hamilton-biv87u`.

## Decisiones
- D-001 Tres espacios, sin «blocks»
- D-002 Organigrama y asignación en el FO
- D-003 Un puesto = una persona por año
- D-004 Circuito: responsable → comptabilité → direction (valida y firma) → collaborateur → Silae / POSI
- D-005 Estados del circuito fijos en código
- D-006 Maqueta primero, en local

## Pruebas
- `npm run build` → OK, sin errores de TypeScript.
- Recorrido automático con Playwright (1440×900): organigrama, ficha, affecter (37 pourvus tras asignar), cambio a Resp. Accueil + «Mon périmètre» (salario oculto fuera del perímetro), tablero de Lecteur Stagiaires (5 postes), préparer 2027 (42 postes, 15 pourvus), portal de Marie → todo OK, 0 errores de consola.
- Errores encontrados y corregidos durante la prueba: menú de roles tapado por el encabezado y por la ficha; ficha que tapaba los botones superiores; encabezado por encima de la ventana modal.
- `oxlint` → 3 avisos menores, sin errores.
- No probado: en otros navegadores ni a otras resoluciones que 1440×900.

## Pendientes
- Nuevos: P-001…P-012 · Resueltos: P-008 (fases 1–2)

## Qué aprendió Felipe
- Separar «módulo que compra el cliente» de «socle técnico» (una sola línea visible en el devis) y del ingreso recurrente (hosting + mantenimiento).
- Un modelo con «1 puesto = 1 persona por año» y `parentId` en el puesto basta para generar el organigrama de cada año y prepararlo copiando el anterior.
- Las pruebas automáticas del recorrido encontraron 3 errores de interfaz (menús tapados) que a simple vista en capturas no se veían.
