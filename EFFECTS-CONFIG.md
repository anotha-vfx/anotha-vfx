# ANOTHA VFX — Effects & Features Config Guide

Every custom effect on the site and exactly where to edit it.
All values live at the **top of each file** in a clearly marked `Config` block.

---

## 💧 Fluid Cursor (WebGL smoke simulation)

**File:** `js/fluid-cursor.js` (Config block, lines ~40–65)

| Setting | Default | What it does |
|---|---|---|
| `COLOR` | auto | Purple `#A855F7` on homepage*, white `#ffffff` on inner pages |
| `SPLAT_RADIUS` | `0.2` | Size of each smoke puff |
| `SPLAT_FORCE` | `6000` | How hard movement pushes the fluid |
| `DENSITY_DISSIPATION` | `3.5` | How fast the smoke fades (higher = faster) |
| `VELOCITY_DISSIPATION` | `2` | How fast motion settles |
| `CURL` | `3` | Swirliness |
| `RAINBOW_MODE` | `false` | `true` = each puff cycles colors |

\* Currently **not loaded on the homepage** (script tag removed) and **skipped on all mobile devices**.
The page-detection logic for the color is inside the `COLOR` config entry itself.

---

## 🎬 NLE Timeline ("Sequence 01 — Portfolio", homepage)

**File:** `js/nle.js` (lines ~21–23) — clips are generated automatically from the project cards.

| Setting | Default | What it does |
|---|---|---|
| `SEQ_SECONDS` | `60` | Length of one full playhead sweep (also the timecode scale) |
| `FPS` | `24` | Frame rate used by the timecode readout |
| `GUTTER` | `44` | Width of the V1/V2/A1 label column (px) |

Section heading text ("Sequence 01 — Portfolio") is in `index.html`, search for `nle-header`.
Visual styles (clip colors, playhead red, track heights): `css/style.css`, section `NLE TIMELINE`.

---

## 📅 Booking — slots badge + Calendly button

**File:** `js/content.js` → `booking:` block

| Setting | Default | What it does |
|---|---|---|
| `slotsLeft` | `"auto"` | `"auto"` = month name from today's date + stable 2–5 slot count per month. Or set a number: `2` = "2 slots left", `0` = "Fully booked" (red dot), `-1` = feature off |
| `slotsMonth` | `"July"` | Month name — only used when `slotsLeft` is a number |
| `calendlyUrl` | set | Your Calendly link. `""` hides the "Book a free 30-min call" button |

Button text ("Book a free 30-min call"): `js/main.js`, search for `Book a free`.

---

## 💬 WhatsApp Button

**Phone number:** in each HTML page, search for `wa.me/` — currently `918989417415`.
(5 places: `index.html`, `about/`, `services/`, `reviews/`, `contact/`.)

**Colors/size:** `css/style.css`, section `WHATSAPP CHAT BUTTON` (`.wa-btn`, 54px circle, dark glass + gold).

---

## 🎬 Clapperboard Loader (homepage)

**Text** ("SCENE 01 · TAKE 05 · ROLL A"): `index.html`, search for `slate-meta`.
**Look & snap animation:** `css/style.css`, section `CLAPPERBOARD LOADER` (`@keyframes slateClap`).

---

## 🎭 Theater Mode (page dims while a video plays)

**File:** `js/main.js`, search for `Theater mode`.
**Dim darkness/speed:** `css/style.css`, section `THEATER MODE` → `#theaterDim`
(`rgba(0,0,0,.85)` = darkness, `.55s` = fade speed).

---

## 🪜 Process Timeline ("How We Work", services page)

**Step titles & descriptions:** `services/index.html`, search for `process-section`.
**Layout/line/dots:** `css/style.css`, section `PROCESS TIMELINE`.

---

## 🧊 Liquid Glass Accents (nav, cards, buttons)

**File:** `css/style.css`, section `LIQUID GLASS ACCENTS`.
Specular hairlines (`inset 0 1px 0 rgba(255,255,255,…)`), nav blur (32px),
lightbox blur (18px), mobile-menu blur (26px) — all edited there.

---

## 📦 Text Panels on inner pages (readability boxes)

**File:** `css/style.css`, section `GALAXY BACKGROUND — LEGIBILITY PANELS`
(kept after the galaxy was removed; panel color `rgba(5,5,5,0.88)`, blur 12px).

---

## ✨ Hero Watermark ("MS VFX 97", homepage)

**Text:** `index.html`, search for `hero-ambient`.
**Size/spacing/visibility:** `css/style.css` → `.hero-ambient` / `.hero-ambient-sub`
(mobile position + brightness overrides are in the `@media (max-width: 600px)` and `380px` blocks).

---

## 🧾 General site content

Names, hero stats, showreel video ID, projects, reels: `js/content.js` (fully commented).
Reviews shown on homepage + reviews page: `reviews/data.js` (instructions at the top of the file).
