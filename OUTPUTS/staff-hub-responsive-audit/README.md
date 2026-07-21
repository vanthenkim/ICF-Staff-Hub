# Staff Hub — Responsive Layout Audit

Date: 21 July 2026
Scope: 24 live HTML pages, `assets/styles.css` (2,251 lines)
Deliverable: `assets/layout.css` — a shared responsive layer, now linked into all 24 pages

---

## The short version

The design system is in better shape than expected. Colours, spacing, radii and shadows are already tokenised in `assets/styles.css`, and every page loads it. What's missing is the layer Apple actually gets right: **a single breakpoint system, one container width, and type that scales with the screen.**

Three problems account for almost all the layout inconsistency:

1. **Sixteen different breakpoint values** across the repo. Apple uses four.
2. **Two competing max-widths** — the `--content-max: 1240px` token, and a hardcoded `max-width:1400px` block pasted into 10 pages.
3. **Zero fluid type.** Every font size is a fixed pixel value, so a 32px headline is 32px on a 1440px monitor and on a 320px phone.

---

## What Apple actually does, and what's worth taking

| Apple pattern | Take it? | Why |
|---|---|---|
| Four breakpoints (320 / 734 / 1068 / 1440) | **Yes** | This is the main reason their pages feel right everywhere. Content locks and centres rather than stretching forever. |
| 12-column grid, gutters that grow with viewport | **Yes** | Standard, uncopyrightable, solves your department-page inconsistency. |
| Fluid type scale with `clamp()` | **Yes** | Fixes the crushed-headline problem on phones without adding breakpoints. |
| Short line lengths (60–70 chars) | **Yes** | Your guidelines and policy pages currently run full 1240px width. Hard to read. |
| Sticky slim nav collapsing to a hamburger | **Yes** | You already have this — it works. |
| Tall full-bleed hero sections, long scroll storytelling | **No** | Apple is a marketing site optimised for browsing. A staff hub is a utility — people arrive wanting a phone number in under ten seconds. Heroes push the useful stuff below the fold. |
| SF Pro typeface | **No** | Licensed for Apple platforms only, not general web use. You already have FlamaKH, which handles Khmer — keep it. |
| Their CSS, JS, icon set, imagery | **No** | Copyrighted. And you don't need it. |

**Bottom line:** copy the layout thinking, not the site. Everything in the "yes" column is generic web layout practice that nobody owns.

---

## Findings by severity

### High — will visibly break on a phone

**H1. Fixed-column grids with no fallback**
`about.html` (6 instances) and `medical.html` (1) use inline `grid-template-columns: repeat(4–7, 1fr)` with no media query. On a 320px screen that produces columns roughly 45px wide — unreadable slivers.
*Fixed:* `layout.css` §4 includes an attribute-selector safety net that forces these to wrap below 734px. **This is a patch, not a fix** — replace the inline styles with `.l-cards` when you next touch those pages.

**H2. Contacts table had no overflow treatment**
`contacts.html` list view is a 5-column table at `width:100%`. Below about 600px the columns collapse and text wraps to one word per line.
*Fixed:* wrapped in `.l-table-scroll` with a `min-width:640px` table and a sticky header row. It now scrolls horizontally instead of collapsing.

**H3. Two competing container widths**
`--content-max: 1240px` in the token block, but `max-width:1400px` hardcoded inline across `about.html` and 9 department pages. Content jumps width as you navigate between pages.
*Fixed in the layer* via `--width-content` / `--width-wide`. **Needs manual follow-up:** find/replace the inline `max-width:1400px` with `class="l-container--wide"`.

### Medium — inconsistent, not broken

**M1. Sixteen breakpoint values**
In use: 320, 420, 480, 520, 540, 560, 600, 620, 640, 700, 720, 760, 768, 960, 1100, 1400. Components reflow at different moments, so the page rearranges itself in stages as you resize instead of snapping cleanly.
*Action:* migrate to 734 / 1068 / 1440 as you touch each component. Documented at the top of `layout.css`.

**M2. No fluid type**
Zero `clamp()` in 2,251 lines of CSS. `.hero__title` is 32px flat; `about.html` has 36px and 30px headings.
*Partly fixed:* `.hero__title` and `.dept-hero h1` are now fluid. Opt-in classes `.l-display` through `.l-small` are available for new markup.

**M3. Prose runs full width**
`guidelines.html`, `resources.html` and `training.html` set long-form text across the full 1240px. That's roughly 140 characters per line — about double the comfortable reading limit.
*Action:* wrap body copy in `.l-container--reading` or add `.l-measure`.

**M4. Sidebar collapses at 960px**
The single-column switch happens at 960px, but iPad landscape is 1024px — so tablets get the desktop sidebar squeezed into not quite enough room.
*Action:* move that breakpoint to 1068px.

### Low — polish

**L1.** No print stylesheet. Staff print contact lists and policies; they currently get the sidebar and nav on paper. *Fixed* — `layout.css` §10.
**L2.** No `prefers-reduced-motion` handling. *Fixed* — §9.
**L3.** No minimum tap-target sizing on touch devices. *Fixed* — §9, 44px floor.
**L4.** Long email addresses can force horizontal scroll on narrow screens. *Fixed* — `.l-break` utility plus `min-width: 0` on all grid children.

### Non-issues (checked, no action)

- Four files lack a viewport meta tag: `department-education.html`, `department-family-care.html`, `department-it.html` are redirect stubs, and `_guidelines_content.html` is an include fragment. None render as a page. Fine as-is.
- The `auto-fill / minmax()` card grids already in `styles.css` (lines 624, 692, 771, 1946, 2044, 2065, 2089) are correct — leave them alone.
- The planner week grids already use `minmax(90px, 1fr)` with `overflow-x: auto`. Correct approach.

---

## What changed

| File | Change |
|---|---|
| `assets/layout.css` | **New.** ~240 lines. Breakpoints, containers, 12-col grid, card grids, fluid type, table scroll, overflow guards, print. |
| 24 × `*.html` | Added `<link rel="stylesheet" href="assets/layout.css?v=1">` immediately after `styles.css`. |
| `contacts.html` | Table wrapped in `.l-table-scroll`, sticky header class added. |

Nothing was removed or restyled. The layer is additive — existing pages render as before, with the fixes applied on top.

---

## How this was verified

Checked computationally, not visually — the browser extension blocks `file://` URLs and the sandbox has no headless browser, so I couldn't take screenshots.

What was verified:

- **Type scale** — computed every `clamp()` at 320 / 734 / 1068 / 1440. All six tokens grow monotonically and stay inside their floor and ceiling. Display headline resolves to 30px on a phone and 56px on desktop.
- **Container arithmetic** — no container exceeds the viewport at any of the four widths. Reading width caps at 720px from 1068px up.
- **Card grids** — computed the column count and resulting card width at each breakpoint. No card ever falls below its `minmax` floor; grids wrap instead of squashing. Worst case is `.l-cards--sm` at 157px, above its 150px floor.
- **Cascade conflicts** — checked every selector in the new layer against `styles.css`. Found one real conflict: `.page-header h1` (used on 12 pages) is specificity 0,1,1 and would have beaten a plain class. Added it explicitly. No `!important` collisions.
- **Syntax and integration** — braces and parens balanced, 49 selectors, 9 media queries, layer linked into all 24 pages in the correct order, `contacts.html` tag balance intact after the table wrap.

**Still worth doing:** open `index.html`, `contacts.html`, `about.html` and one department page in a browser and drag the window from narrow to wide. `about.html` is the one to watch — it has six of the seven fixed-column grids.

---

## Recommended next steps, in order

1. **Replace the inline `max-width:1400px` blocks** on the 10 pages with `class="l-container--wide"`. Removes the width jump between pages.
2. **Move the 960px sidebar breakpoint to 1068px** in `styles.css` line 132 (and the related 960px queries at lines 202, 259, 267, 375, 540, 850, 1006).
3. **Swap the fixed-column inline grids in `about.html` and `medical.html`** for `class="l-cards"` and drop the safety net.
4. **Wrap prose on guidelines / resources / training** in `.l-container--reading`.
5. **Consolidate the remaining breakpoints** to 734 / 1068 / 1440 one component at a time.

Items 1–4 are each about 20 minutes. Item 5 is ongoing.

---

## Using the layer

```html
<!-- standard page -->
<div class="l-container">…</div>

<!-- long-form policy or guideline text -->
<div class="l-container--reading">…</div>

<!-- card grids — never squash, they wrap instead -->
<div class="l-cards">…</div>       <!-- 260px min, e.g. people cards -->
<div class="l-cards--sm">…</div>   <!-- 150px min, e.g. tool icons -->
<div class="l-cards--lg">…</div>   <!-- 320px min, e.g. feature cards -->

<!-- 12-column layout, auto-collapses -->
<div class="l-grid">
  <div class="l-col-8">main</div>
  <div class="l-col-4">side</div>
</div>

<!-- any wide table -->
<div class="l-table-scroll"><table class="l-table-sticky">…</table></div>

<!-- tight utility page header instead of a hero -->
<div class="l-page-head"><h1 class="l-h1">Contacts</h1><input …></div>
```
