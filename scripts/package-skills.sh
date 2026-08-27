#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist/skills"
mkdir -p "$DIST"

for folder in "$ROOT"/vendor/upstream/arun-procurement-ai/agent-skills/* "$ROOT"/vendor/upstream/maxbase-procurement-skills/*; do
  [ -d "$folder" ] || continue
  [ -f "$folder/SKILL.md" ] || continue
  name="$(basename "$folder")"
  (cd "$(dirname "$folder")" && zip -qr "$DIST/$name.zip" "$name")
  echo "Creado: $DIST/$name.zip"
done

echo "Skills listas en dist/skills"
