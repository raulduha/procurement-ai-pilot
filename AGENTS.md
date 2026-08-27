# AGENTS.md

## Objetivo

Construir un piloto privado de Procurement AI para una sola empresa. La aplicación envuelve y ejecuta las skills originales incluidas en `vendor/upstream/`.

## Reglas obligatorias

1. No reescribir, resumir ni sustituir los archivos `SKILL.md` de `vendor/upstream/`.
2. No inventar nuevas capacidades de procurement y presentarlas como provenientes de los repositorios originales.
3. Mantener las licencias, autores, fuentes y commits indicados en `vendor/upstream/SOURCES.md`.
4. Toda adaptación propia debe vivir fuera de `vendor/upstream/` y quedar identificada como código de integración.
5. No usar datos ficticios sin marcarlos explícitamente como demostración.
6. Nunca guardar secretos, tokens, documentos empresariales ni archivos `.env` en Git.
7. Aplicar mínimo privilegio a Supabase y Microsoft Graph.
8. Ninguna recomendación de adjudicación, contrato o proveedor se ejecuta automáticamente: siempre requiere revisión humana.

## Comandos de verificación

```bash
npm run typecheck
npm run lint
npm run build
```

## Flujo de trabajo

- Crear una rama corta por cambio.
- Mantener `main` desplegable.
- Verificar los tres comandos antes de fusionar.
- Para actualizar un repositorio upstream, registrar el nuevo commit en `vendor/upstream/SOURCES.md` y revisar manualmente sus diferencias.
