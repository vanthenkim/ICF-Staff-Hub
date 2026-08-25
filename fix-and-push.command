#!/bin/bash
cd "$(dirname "$0")"
echo "Removing git lock file..."
rm -f .git/index.lock
echo "Pushing to GitHub..."
git push origin preview
git push origin main
echo ""
echo "Done! You can close this window."
