#!/bin/sh
# Remove Mapbox secret from all commits in git history

# Backup current branches
git branch -f backup-main main 2>/dev/null

# Use filter-branch to replace the hardcoded key in all commits
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --force --tree-filter '
if [ -f erp/src/components/MapaRotas.jsx ]; then
  sed -i "s/mapboxgl.accessToken = '\''pk\.[^'\'']*'\''/mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '\'''\''/" erp/src/components/MapaRotas.jsx 2>/dev/null
  sed -i "s/mapboxgl.accessToken = \"pk\.[^\"]*\"/mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || \"\"/" erp/src/components/MapaRotas.jsx 2>/dev/null
fi
' -- --all

# Clean up refs
rm -rf .git/refs/original/

# Force push
git push -u origin main --force
