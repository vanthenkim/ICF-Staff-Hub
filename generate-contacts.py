"""
generate-contacts.py
--------------------
Reads ICF_Staff_Contacts.xlsx and writes contacts.json.

Usage:
    python generate-contacts.py

Run this whenever you update ICF_Staff_Contacts.xlsx, then commit
and push — Netlify will auto-deploy the new data.

Requirements:
    pip install openpyxl
"""

import openpyxl
import json
import os

XLSX = "ICF_Staff_Contacts.xlsx"
JSON_OUT = "contacts.json"
PHOTO_DIR = "assets/people"

# Manual overrides where the photo filename spelling differs from the name
PHOTO_OVERRIDES = {
    "parigna souem": "parigna-soeum.jpg",
    # Add more here if needed, e.g.:
    # "firstname lastname": "photo-filename.jpg",
}


def find_photo(name):
    """Try to find a matching photo file for a staff member name."""
    available = {f.lower(): f for f in os.listdir(PHOTO_DIR)}

    # Direct: "Eddie Roach" → "eddie-roach.jpg"
    slug = "-".join(name.lower().split())
    for ext in [".jpg", ".png"]:
        if slug + ext in available:
            return f"{PHOTO_DIR}/{available[slug + ext]}"

    # Reversed (for surname-first names): "Rany Mom" → "mom-rany.jpg"
    parts = name.split()
    if len(parts) == 2:
        rev = f"{parts[1].lower()}-{parts[0].lower()}"
        for ext in [".jpg", ".png"]:
            if rev + ext in available:
                return f"{PHOTO_DIR}/{available[rev + ext]}"

    # Manual override
    key = name.lower()
    if key in PHOTO_OVERRIDES:
        fname = PHOTO_OVERRIDES[key]
        if fname.lower() in available:
            return f"{PHOTO_DIR}/{available[fname.lower()]}"

    return ""


def main():
    wb = openpyxl.load_workbook(XLSX)
    ws = wb.active

    contacts = []
    current_dept = None

    for row in ws.iter_rows(values_only=True):
        num, name, role, dept, email, phone, telegram = row

        # Skip header row
        if num == "#":
            continue

        # Department section header row (e.g. "CHURCH", "EDUCATION")
        if name is None and num is not None and not isinstance(num, int):
            current_dept = str(num).strip().title()
            continue

        # Staff row
        if isinstance(num, int) and name:
            contacts.append({
                "name": name.strip(),
                "role": (role or "").strip(),
                "department": dept or current_dept or "",
                "email": (email or "").strip(),
                "phone": (phone or "").strip(),
                "telegram": (telegram or "").strip().lstrip("@"),
                "photo": find_photo(name.strip()),
            })

    with open(JSON_OUT, "w", encoding="utf-8") as f:
        json.dump(contacts, f, indent=2, ensure_ascii=False)

    print(f"✓ Wrote {len(contacts)} contacts to {JSON_OUT}")
    with_photos = sum(1 for c in contacts if c["photo"])
    print(f"  {with_photos} contacts have photos")


if __name__ == "__main__":
    main()
