# Reglas vigentes

| ID | Regla | Motivo | Prueba |
|---|---|---|---|
| R-001 | Toda la interfaz en francés | El cliente es francés | manual |
| R-002 | Nunca usar datos personales reales (ni en maqueta ni en repo) | RGPD: salarios, NIR, IBAN | manual / revisión de `maquette/src/data` |
| R-003 | Los estados del circuito de contratos son fijos en el código; solo sus nombres son configurables | Un circuito editable rompe firmas y envíos a Silae/POSI | revisión de código |
| R-004 | En la versión real, los permisos se aplican en el servidor y la base de datos, no solo ocultando botones | Un responsable no debe ver salarios fuera de su perímetro | tests de permisos (versión real) |
| R-005 | Diseño para PC (≥1280 px); el aspecto visual es prioritario | Es lo que el cliente más valora | capturas en cada fase |
| R-006 | Las fusiones en `main` las hace Felipe desde GitHub con la cuenta FelipeSoruco; Claude solo crea el PR | El plan gratuito de Netlify solo publica commits de esa cuenta (rechaza DaniSoruco) | revisar el autor del último commit de `main` antes de esperar un deploy |
