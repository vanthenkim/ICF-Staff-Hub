#!/bin/bash
cd /Users/vivianstumpf/Documents/GitHub/ICF-Staff-Hub
rm -f .git/HEAD.lock .git/index.lock
git commit -m "KH: dept-specific terms, staff fun activities, redirect pages"
git push
rm -- "$0"
