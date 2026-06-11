# Org Chart Auto-Sync — Setup Guide

**Goal:** Add two columns to the Google Sheet so the org chart in `about.html` can be generated automatically, instead of being edited by hand.

---

## What You Need to Add to the Google Sheet

Add these two columns to your existing staff sheet (wherever the other columns like Name, Role, Department are):

| Column | What to fill in | Example |
|---|---|---|
| **Manager** | The direct manager's full name, exactly as it appears in the sheet | `Bethany Roach` |
| **OrgGroup** | A sub-label for grouping within a team (optional — most leave blank) | `After School` or `PE` |

---

## Rules for Filling In

**Manager column:**
- Leave blank for the top person in each department (the Executive Director)
- Everyone else must have a manager
- The name must match exactly — same spelling as the person's own row in the sheet
- If someone reports directly to the ED, their manager is the ED's name

**OrgGroup column (only needed for some departments):**
- Leave blank for most staff
- Only fill in when a manager has multiple sub-teams under them (example: the Education Manager has "After School", "Creative Art", "PE", "English", "Scholarship" sub-teams)
- All people in the same sub-group get the same label

---

## Example: Church Department

| Name | Manager | OrgGroup |
|---|---|---|
| Eddie Roach | *(blank)* | *(blank)* |
| Rany Mom | Eddie Roach | *(blank)* |
| Panha Neang | Eddie Roach | *(blank)* |
| Boromey Hom | Panha Neang | *(blank)* |
| Bethany Roach | Eddie Roach | *(blank)* |
| Seangly Leng | Bethany Roach | *(blank)* |
| Sombo Ros | Eddie Roach | *(blank)* |
| Sreileak Rous | Sombo Ros | *(blank)* |

## Example: Social / Education (with OrgGroups)

| Name | Manager | OrgGroup |
|---|---|---|
| Matthias Lendi | *(blank)* | *(blank)* |
| Parigna Souem | Matthias Lendi | *(blank)* |
| Khunhy Thoeun | Parigna Souem | After School |
| Su Sey | Parigna Souem | After School |
| David Piseth | Parigna Souem | Creative Art |
| Kanha Un | Parigna Souem | PE |
| Tola Khem | Parigna Souem | PE |
| Phin Teb | Parigna Souem | Scholarship |

---

## What Happens After

Once the columns are filled in:

1. Vanthen updates `generate-contacts.py` to include the new fields in `contacts.json`
2. Claude rewrites the org chart section in `about.html` to read from `contacts.json` and render automatically
3. From that point on: update the Google Sheet → run the script → push to GitHub → org chart updates

---

## For Vacancies

If a position is open (currently shown as a red "Vacancy" card in the org chart), add a row like this:

| Name | Role | Manager | OrgGroup | ... |
|---|---|---|---|---|
| VACANCY | Social Worker | Karano Chhuon | Social Workers | *(leave email/phone/telegram blank)* |

Use `VACANCY` as the name — the renderer will recognise this and show the red vacancy card automatically.

---

## Checklist Before the Afternoon Session

- [ ] Open the Google Sheet
- [ ] Add "Manager" column
- [ ] Add "OrgGroup" column  
- [ ] Fill in Manager for all staff (start with Church — it's the simplest)
- [ ] Fill in OrgGroup where needed (Social/Education is the main one)
- [ ] Add VACANCY rows for any open positions
- [ ] Share the updated sheet with Vanthen so he can regenerate contacts.json
