# 2026-11-05 · Maqueta fases 6–7 y fusión en main

**Objetivo:** terminar la maqueta: transmissions Silae/POSI, rapports, BO en lectura (fase 6), estilo más ligero y guion de demo (fase 7).

## Trabajo realizado
- La rama de la sesión (`claude/youthful-brahmagupta-4v1bfg`) partía del commit inicial; se reinició desde `main` (fases 1–5 ya fusionadas en PR #2).
- Fase 6:
  - Modelo `Transmission` (`types.ts`) y lógica en `maquette/src/transmissions.ts` (requisitos por sistema, envío, journal inicial). La firma del collaborateur genera los envíos (`store.ts`), con `renvoyerTransmission` para relanzar.
  - `pages/Transmissions.tsx`: KPIs, filtros, detalle de tentativas, «Relancer l’envoi», «Relancer la personne», «Compléter le dossier». Errores de ejemplo: Chloé Mercier (POSI, falta pieza de identidad; dossier bajado a 60 %) y Karim Benali (Silae, error técnico).
  - `pages/Rapports.tsx`: 5 informes, filtros empleador/tipo, export CSV (punto y coma + BOM, se abre en Excel FR). Salarios visibles según el perímetro, igual que en Postes.
  - `pages/Admin.tsx` (lectura): Référentiels (8 listas, incluido el circuito con sus estados fijos, R-003), Utilisateurs & droits (matriz de permisos), Connecteurs (Yousign, Silae, POSI). Acceso solo compta/admin.
  - Ficha persona: la compta puede depositar piezas que faltan; sección Transmissions. Tableau de bord: alerta de envíos en error.
  - Almacenamiento del navegador pasa a `organigramme-demo-v3`; se eliminó `pages/Placeholder.tsx`.
- Fase 7: estilo más ligero (`index.css`, `Layout.tsx`, `ui.tsx`, `Dashboard.tsx`, `Portail.tsx`, `Organigramme.tsx`) y `docs/guion-demo.md` (recorrido de 12 min por roles).
- PR FelipeSoruco/organigramme#3 creado y fusionado en `main` a pedido de Felipe.

## Decisiones
- D-010 Reglas de los envíos Silae / POSI (supuesto de la maqueta)
- D-011 La compta puede depositar piezas en nombre de la persona
- D-012 Estilo visual más ligero sin color nuevo

## Pruebas
- `npm ci && npm run build` → OK. oxlint: solo avisos previos (fast refresh, `Date` en el render del tableau de bord).
- Playwright: 11 pantallas × 5 roles → 0 errores de consola. Ciclo Mercier: relanzar sin completar → sigue en error; depositar pieza → relanzar → OK. Benali → relanzar → OK. Marie Dupont firma → 2 envíos (Silae + POSI) «Envoyé». Export CSV descargado y revisado. Responsable en `/admin/droits` → «Accès réservé».
- No probado: la publicación real en Netlify tras la fusión (P-017).

## Pendientes
- Nuevos: P-017 (comprobar Netlify), P-018 (Formules en Référentiels)
- Resueltos: P-009 (maqueta completa), P-015 (estilo)

## Qué aprendió Felipe
- Una sesión nueva puede arrancar en una rama vieja o vacía: la referencia del trabajo vigente es `main`, y conviene empezar desde ahí.
- Fusionar mediante un PR deja registro de qué cambió y cuándo, y Netlify publica `main` solo.
- Al cambiar el nombre del almacenamiento de la demo (`-v3`), quien ya la había probado empieza con los datos nuevos sin tener que pulsar nada (↻ sigue sirviendo para reiniciar).

## Después del cierre
- El deploy de Netlify falló: «unrecognized Git contributor». El plan gratuito solo acepta commits de FelipeSoruco y la fusión del PR #3 salió a nombre de DaniSoruco. Felipe fusionó el PR #4 desde FelipeSoruco y la publicación funcionó.
- Nueva regla R-006 (fusiones en `main` por Felipe). P-017 cerrado.
