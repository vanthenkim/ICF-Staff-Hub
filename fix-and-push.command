#!/bin/bash
cd "$(dirname "$0")"
echo "Removing git lock files..."
rm -f .git/index.lock .git/HEAD.lock
echo "Staging and committing changes..."
git add training.html medical.html
git commit -m "Leader's Guide: individual KH file links + medical.html Khmer translation"
echo "Pushing to GitHub..."
git push origin preview
git push origin main
echo ""
echo "Done! You can close this window."
