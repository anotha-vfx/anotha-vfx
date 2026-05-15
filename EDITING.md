# ANOTHA VFX — Editing Guide
Everything you need to update content on the site. No coding knowledge required for most tasks.

---

## QUICK REFERENCE TABLE

| # | Topic | File to Open | What You Can Change |
|---|---|---|---|
| 1 | **Reviews** | `reviews/data.js` | Add, edit, remove, reorder reviews — homepage marquee + reviews page update automatically |
| 2 | **Projects** | `index.html` | Add / remove project cards, change title, description, video, tags |
| 3 | **Short-form Reels** | `index.html` | Add / remove reel cards, change title, category, video |
| 4 | **Showreel Video** | `js/content.js` | Swap the main showreel (Vimeo, YouTube, or local file) |
| 5 | **Hero Section** | `index.html` | Role text, tagline, skill chips, stats, background video |
| 6 | **About Page** | `about/index.html` | Photo, bio text, tools list, specializations list |
| 7 | **Services Page** | `services/index.html` | Add / remove / rename services and their descriptions |
| 8 | **Contact Details** | `contact/index.html` | Email, phone numbers, social handles, availability text |
| 9 | **Social Links** | All `index.html` files | Instagram, YouTube, LinkedIn, Email links in nav + footer |
| 10 | **Footer Year** | All `index.html` files | Copyright year |
| 11 | **SEO** | All `index.html` files | Page title, meta description, OG tags for link previews |
| 12 | **Google Analytics** | All `index.html` files | Measurement ID |
| 13 | **Sitemap** | `sitemap.xml` | Add new pages so Google can find them |
| 14 | **Favicon** | `assets/favicon.jpg` | The small icon in the browser tab |

---

## 1. REVIEWS

**File to open:** `reviews/data.js`

This is the **only file you ever need to touch for reviews.** When you save and push it, both the homepage scrolling marquee and the full reviews page update automatically — nothing else needs changing.

---

### How to ADD a new review — step by step

**Step 1.** Open `reviews/data.js` in VS Code (or any text editor).

**Step 2.** Scroll to the bottom of the file. You will see the array ends like this:

```js
  // ── REVIEW 5 ──
  {
    text: "Jatin delivered stunning color grading and VFX for our short film...",
    name: "Priya Sharma",
    role: "Independent Filmmaker",
    stars: 5
  },

];
```

**Step 3.** Click at the end of the last `},` line (after the closing brace of Review 5), press **Enter**, and paste this block:

```js
  // ── REVIEW 6 ──
  {
    text: "Write the review text here.",
    name: "Client Name",
    role: "Director / YouTuber / Brand",
    stars: 5
  },
```

**Step 4.** Fill in the four fields:
- `text:` — what the client said (keep it inside the `"quotes"`)
- `name:` — their name
- `role:` — their job title, YouTube channel, or brand name
- `stars:` — a number from `1` to `5` (no quotes, no stars symbol — just the number)

**Step 5.** Save the file. Push to GitHub. Done.

> ⚠️ **Important:** Every review block must end with a comma `,` after the closing brace `}` — except if you deliberately want it to be the very last one and the file already ends correctly. The safest habit is to always put a comma.

---

### How to EDIT an existing review — step by step

**Step 1.** Open `reviews/data.js`.

**Step 2.** Find the review you want to change. Each one looks like this:

```js
  {
    text: "The motion graphics Jatin created for our YouTube channel were mind-blowing.",
    name: "Sarah Chen",
    role: "YouTuber — 500K Subscribers",
    stars: 5
  },
```

**Step 3.** Change only what you need:

| Field | Line looks like | What to do |
|---|---|---|
| Review text | `text: "..."` | Replace everything inside the `"quotes"` |
| Client name | `name: "..."` | Replace everything inside the `"quotes"` |
| Role / title | `role: "..."` | Replace everything inside the `"quotes"` |
| Star rating | `stars: 5` | Change the number (1 to 5, no quotes) |

**Step 4.** Save and push to GitHub.

---

### How to REMOVE a review — step by step

**Step 1.** Open `reviews/data.js`.

**Step 2.** Find the review block you want to delete. It starts with `{` and ends with `},`.

**Step 3.** Select the entire block — from the `{` on the first line to the `},` on the last line — and delete it.

Example: to delete Review 3, select and delete this entire section:

```js
  // ── REVIEW 3 ──
  {
    text: "Professional, fast, and incredibly talented...",
    name: "Marcus Reid",
    role: "Creative Director",
    stars: 5
  },
```

**Step 4.** Make sure the review before it still ends with a `,` and the file still ends with `];`. Save and push.

---

### How to REORDER reviews

**Step 1.** Open `reviews/data.js`.

**Step 2.** Cut an entire `{ ... },` block (including its `// ── REVIEW N ──` comment line if you want).

**Step 3.** Paste it in a different position inside the array.

**Step 4.** Save and push. The homepage marquee and the reviews page will both reflect the new order.

---

### What the full file looks like (reference)

```js
const REVIEWS = [

  // ── REVIEW 1 ──
  {
    text: "Review text here.",
    name: "Name Here",
    role: "Role Here",
    stars: 5
  },

  // ── REVIEW 2 ──
  {
    text: "Another review.",
    name: "Another Name",
    role: "Another Role",
    stars: 4
  },

];
```

The array starts with `[` on line 24 and ends with `];` on the last line. All your review blocks go **between** those two.

---

## 2. PROJECTS (Work grid)

**File to open:** `index.html`
Search for the comment `<!-- WORK — PROJECT GRID -->` (around line 395).

### How to ADD a project

Copy one full `<article class="project-card" ...> ... </article>` block and paste it inside `<div class="projects-grid">`. Then update these parts:

| What to find | What to change |
|---|---|
| `data-vimeo="1190417066"` | Your Vimeo video ID (the number in the URL) |
| `data-youtube=""` | OR your YouTube video ID |
| `style="background:linear-gradient(135deg,#12002a..."` | Thumbnail background colour |
| `<div class="project-cat">VFX Compositing</div>` | Category label |
| `<span class="project-num">01</span>` | Project number |
| `<span class="project-year">2026</span>` | Year |
| `<h3 class="project-title">Passage Monster VFX</h3>` | Project title |
| `<p class="project-desc">...</p>` | Short description |
| `<span class="tag">After Effects</span>` | Tool tags — duplicate this line for each tool |

Also update the total count: find `<span class="section-count">04</span>` and change `04` to the new total.

### How to REMOVE a project
Delete the entire `<article class="project-card" ...> ... </article>` block. Update the section count.

---

## 3. SHORT-FORM REELS

**File to open:** `index.html`
Search for `<!-- PORTRAIT REELS -->` (around line 285).

### How to ADD a reel
Copy one `<div class="reel-card" ...> ... </div>` block and paste it inside `<div class="reels-track" id="reelsTrack">`. Update:

| What to find | What to change |
|---|---|
| `data-vimeo="1190436345"` | Vimeo video ID |
| `data-youtube=""` | OR YouTube video ID |
| `style="--reel-bg: linear-gradient(...)"` | Background colour |
| `<span class="reel-num">01</span>` | Reel number |
| `<span class="reel-title">Real Estate</span>` | Reel title |
| `<span class="reel-tag">Editing</span>` | Category tag |

### How to REMOVE a reel
Delete the entire `<div class="reel-card" ...> ... </div>` block.

---

## 4. SHOWREEL VIDEO

**File to open:** `js/content.js`

Find this section near the top:

```js
showreel: {
  vimeoId:   '',     // ← paste your Vimeo ID here, e.g. "123456789"
  youtubeId: '',     // ← OR your YouTube ID
  localFile: '',     // ← OR path to local file, e.g. "assets/showreel.mp4"
},
```

Fill in **one** of the three and leave the others as empty `''`. Example for Vimeo:

```js
showreel: {
  vimeoId:   '123456789',
  youtubeId: '',
  localFile: '',
},
```

---

## 5. HERO SECTION

**File to open:** `index.html`

| What | Search for this exact text | How to change |
|---|---|---|
| Role badge | `<div class="hero-role">` | Edit the text between the tags |
| Tagline | `<p class="hero-tagline">` | Edit the text between the tags |
| Skill chips | `<div class="hero-chips">` | Edit or duplicate `<span class="hero-chip">` lines |
| Years stat | `data-count="4"` | Change `4` to the new number; also change the visible `4+` next to it |
| Projects stat | `data-count="50"` | Same as above |
| Background video | `<source src="assets/showreel.mp4"` | Drop a new `.mp4` into `assets/` with the same name |
| Poster image | `poster="assets/showreel-poster.jpg"` | Drop a new `.jpg` into `assets/` with the same name |

---

## 6. ABOUT PAGE

**File to open:** `about/index.html`

| What | Search for this exact text | How to change |
|---|---|---|
| Photo | `<img src="../assets/JATIN.png"` | Drop a new image into `assets/` and update the filename here |
| Caption | `<div class="img-caption">Jatin Vishwakarma — 2025</div>` | Edit the text |
| Bio intro | `<p class="bio-lead">` | Edit the text between the tags |
| Bio paragraphs | `<p class="bio-p">` | Two of these — edit each one |
| Tools list | First `<div class="skills-grid">` | Edit or add `<div class="skill">ToolName</div>` lines |
| Specializations | Second `<div class="skills-grid">` | Same — edit or add `<div class="skill">` lines |

---

## 7. SERVICES PAGE

**File to open:** `services/index.html`

Each service is one block that looks like this:

```html
<div class="skills-block">
  <span class="skills-label">VFX Compositing</span>
  <p class="bio-p">Description of the service goes here.</p>
</div>
```

| Task | How |
|---|---|
| **Add a service** | Copy one full `<div class="skills-block">...</div>` block, paste it after the last one, fill in the name and description |
| **Remove a service** | Delete the entire `<div class="skills-block">...</div>` block |
| **Rename a service** | Edit the text inside `<span class="skills-label">` |
| **Change description** | Edit the text inside `<p class="bio-p">` |

---

## 8. CONTACT DETAILS

**File to open:** `contact/index.html`

Search for each item below and change both the `href` link and the visible text between the tags:

| What | Search for | Change |
|---|---|---|
| Email | `href="https://mail.google.com/mail/?view=cm&to=anotha.vfx@gmail.com"` | Change email in the `to=` part and in the visible text |
| Phone 1 | `href="tel:+918989417415"` | Change number in `href` and the visible `+91 89894 17415` text |
| Phone 2 | `href="tel:+919406548639"` | Same |
| Instagram | `href="https://instagram.com/anotha.fw.vfx"` | Change URL and visible `@handle` |
| YouTube | `href="https://www.youtube.com/@anothavfx"` | Change URL and visible text |
| LinkedIn | `href="https://www.linkedin.com/in/jatin-vishwakarma-bbb30a3b5/"` | Change URL and visible name |
| Availability text | `<span>Available for new projects</span>` | Edit the text |

---

## 9. SOCIAL LINKS

Social links appear in the **mobile menu footer** and **footer social column** on every page.

**To update a link everywhere at once:** open VS Code, press `Ctrl+Shift+H` (Find & Replace across all files), search for the old URL and replace with the new one.

Current links used throughout the site:
```
https://instagram.com/anotha.fw.vfx
https://www.youtube.com/@anothavfx
https://www.linkedin.com/in/jatin-vishwakarma-bbb30a3b5/
https://mail.google.com/mail/?view=cm&to=anotha.vfx@gmail.com
```

---

## 10. FOOTER COPYRIGHT YEAR

**Files to open:** every `index.html` file (5 total)

Search for:
```html
<span>&copy; 2026 Jatin Vishwakarma. All rights reserved.</span>
```
Change `2026` to the new year in each file, or use VS Code's Find & Replace across all files (`Ctrl+Shift+H`).

---

## 11. SEO

**Files to open:** each page's `index.html`

| Page | File |
|---|---|
| Homepage | `index.html` |
| About | `about/index.html` |
| Services | `services/index.html` |
| Reviews | `reviews/index.html` |
| Contact | `contact/index.html` |

In each file, update these three things (all near the top, lines 6–16):

**Browser tab title** — keep under 60 characters:
```html
<title>Your Title Here — Anotha VFX</title>
```

**Google search description** — keep under 160 characters:
```html
<meta name="description" content="Your description here.">
```

**WhatsApp / Instagram link preview** — update to match:
```html
<meta property="og:title"       content="Same as your title">
<meta property="og:description" content="Same as your description">
```

---

## 12. GOOGLE ANALYTICS

Analytics ID: **G-99MKQSMXY5**
View your dashboard: [analytics.google.com](https://analytics.google.com)

To swap the ID, use VS Code Find & Replace across all files (`Ctrl+Shift+H`):
- Find: `G-99MKQSMXY5`
- Replace with: your new ID

---

## 13. SITEMAP

**File to open:** `sitemap.xml`

Every time you add a new page, paste this block before the closing `</urlset>` tag:

```xml
<url>
  <loc>https://anothavfx.com/your-new-page/</loc>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

After pushing to GitHub, re-submit in Google Search Console:
Go to → [search.google.com/search-console](https://search.google.com/search-console) → **Sitemaps** → enter `https://anothavfx.com/sitemap.xml` → Submit.

---

## 14. FAVICON

**File to replace:** `assets/favicon.jpg`

The favicon is the small icon shown in the browser tab. Requirements:
- File name must stay exactly: `favicon.jpg`
- Recommended size: **48×48 px**
- Format: **JPEG** (not PNG renamed to .jpg — export properly from Photoshop or Squoosh)

To update: drop the new file into the `assets/` folder, replacing the old one. Push to GitHub.

> **Browsers cache favicons.** To see the new icon immediately, press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) to hard-refresh.

---

## DEPLOYMENT — pushing changes live

1. Make your edits and save the file(s)
2. Open the terminal in VS Code (`Ctrl+`` `)
3. Run these three commands:
```
git add .
git commit -m "brief description of what you changed"
git push
```
4. Wait ~30 seconds, then visit [anothavfx.com](https://anothavfx.com) to confirm

---

*Last updated: May 2026*
