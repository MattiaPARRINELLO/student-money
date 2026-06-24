#!/bin/bash
set -e

echo "📦 Build..."
npm run build

echo "📋 Copie static + public dans standalone..."
STANDALONE_DIR=$(find .next/standalone -name server.js -maxdepth 4 | head -1 | xargs dirname)
cp -r .next/static "$STANDALONE_DIR/.next/static"
cp -r public "$STANDALONE_DIR/public"

echo "🤐 Zip..."
cd "$STANDALONE_DIR"
zip -r "$OLDPWD/deploy.zip" .

echo "✅ Fichier créé : deploy.zip"
echo ""
echo "👉 Upload deploy.zip sur cPanel (File Manager > ton dossier domaine > Upload > Extraire)"
echo "👉 Puis en SSH sur le serveur : npm install && touch tmp/restart.txt"
