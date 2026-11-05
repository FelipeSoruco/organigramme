# Organigramme — plataforma RH en la nube

Plataforma RH a medida para 3 empleadores (AFFIF, CINÉFONDATION, SOGOFIF) que reemplaza el software local «Organigram»: puestos anualizados, organigrama, personas, circuito de contratación con firma Yousign, envíos a Silae (nómina) y POSI (acreditaciones). Producto para vender a ese cliente.
**Plataforma:** PC (escritorio, ≥1280 px). Móvil no es objetivo.

## Cómo trabajamos
- Felipe propone y decide; Claude critica, propone y programa lo aprobado.
- Al empezar una conversación: `/metodo-feli`. Al terminar: `/metodo-feli cerrar`.
- Ideas grandes: alcance aprobado antes de programar.

## Dónde buscar
- Estado actual: ESTADO.md
- Decisiones: DECISIONES.md · Pendientes: PENDIENTES.md
- Bitácoras: docs/sesiones/ (solo si hace falta un detalle histórico)
- Código: `maquette/` — maqueta navegable (Vite + React + TS + Tailwind, sin servidor, datos ficticios en el navegador)
- Comandos (desde `maquette/`): `npm install` · `npm run dev` · `npm run build`
- Despliegue: `netlify.toml` → https://organigramme-demo.netlify.app/ (Netlify construye `maquette/` en cada push a `main`; D-007)

## Arquitectura funcional (resumen)
- **Espace de travail (FO):** tableau de bord, organigramme, postes, personnes, contrats, transmissions, rapports.
- **Administration (BO):** catálogos (employeurs, services, emplois, échelons, types de contrat, formules, modèles, accréditations POSI), usuarios y permisos, conectores.
- **Portail collaborateur:** sus datos, foto, documentos, contratos (firma). Futuro: notes de frais, congés, mensajes.

## Reglas
@REGLAS.md
