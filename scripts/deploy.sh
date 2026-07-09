#!/usr/bin/env bash
# Build the site and publish it to the `gh-pages` branch (GitHub Pages).
# Works without GitHub Actions — useful when Actions is unavailable.
#
#   npm run deploy      (preferred)
#   bash scripts/deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

REMOTE="$(git remote get-url origin)"
NAME="$(git config user.name || echo 'deploy')"
EMAIL="$(git config user.email || echo 'deploy@users.noreply.github.com')"

echo "→ Building…"
npm run build

echo "→ Publishing dist/ to gh-pages on $REMOTE"
touch dist/.nojekyll
rm -rf dist/.git
git init -q -b gh-pages dist
git -C dist add -A
git -C dist -c user.name="$NAME" -c user.email="$EMAIL" commit -q -m "Deploy site to GitHub Pages"
git -C dist push -q --force "$REMOTE" gh-pages
rm -rf dist/.git

echo "✓ Deployed. Live at the repository's GitHub Pages URL."
