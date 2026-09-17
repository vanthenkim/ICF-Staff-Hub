#!/bin/bash
cd "$(dirname "$0")"
echo "Removing git lock files..."
rm -f .git/index.lock .git/HEAD.lock
echo "Staging and committing changes..."
git add -A
git commit -m "Update site content" --allow-empty
echo "Pushing preview branch..."
git push origin preview
echo "Merging preview into main..."
git checkout main
git merge preview --no-edit
git push origin main
git checkout preview
echo ""
echo "Done! You can close this window."
