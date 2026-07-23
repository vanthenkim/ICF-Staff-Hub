#!/bin/bash
REPO="$HOME/Documents/GitHub/ICF-Staff-Hub"
echo "=== Git Commit Script v2 ==="
echo "Removing locks..."
rm -f "$REPO/.git/index.lock" "$REPO/.git/HEAD.lock" 2>&1 && echo "Locks removed" || echo "rm failed"
echo "Git status:"
git -C "$REPO" status --short 2>&1
echo "Adding files..."
git -C "$REPO" add -A 2>&1
echo "Committing..."
git -C "$REPO" commit -m "Fix dept-staff.js: extend leader framing to Manager and Leader levels" 2>&1
echo "Pushing..."
git -C "$REPO" push origin main 2>&1
echo ""
echo "=== DONE === Press any key to close."
read -n1
