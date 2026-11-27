#!/usr/bin/env bash
# Gera o instalador do Windows a partir do Linux, sem Wine.
# Requisitos: npm install (inclui resedit) e o pacote nsis (makensis).
set -euo pipefail
cd "$(dirname "$0")/../.."
VERSION=$(node -p "require('./package.json').version")
EXE="dist/win-unpacked/Masmorra do Deploy.exe"
OUT="$PWD/dist/Masmorra-do-Deploy-Setup-$VERSION.exe"

rm -rf dist/win-unpacked
npx electron-builder --win dir -c.win.signAndEditExecutable=false
node desktop/windows/patch-exe.js "$EXE"
makensis -V2 -DVERSION="$VERSION" -DSRC="$PWD/dist/win-unpacked" -DOUT="$OUT" desktop/windows/installer.nsi
echo "Instalador: $OUT"
