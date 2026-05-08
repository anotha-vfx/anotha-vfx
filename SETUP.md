# ANOTHA VFX — Complete Setup Guide

---

## PART 1 — Web3Forms (Contact Form)

**One-time setup. Free. Unlimited submissions.**

1. Go to **web3forms.com** → click **"Get your Access Key"**
2. Enter your email address → check your inbox → copy the key
3. Open `contact.html` in PyCharm
4. Find this line:
   ```
   <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY">
   ```
5. Replace `YOUR_ACCESS_KEY` with the key you copied
6. Done — every form submission arrives in your inbox

---

## PART 2 — Vimeo: Full Process for Landscape Showreel

---

### A — Export your video correctly before uploading

Before touching Vimeo, your video file must be in the right format.

Export from your editing software (DaVinci Resolve / Premiere / After Effects):

| Setting | Value |
|---|---|
| Format | MP4 |
| Codec | H.264 |
| Resolution | 1920 × 1080 (1080p) — landscape, horizontal |
| Frame rate | Whatever you shot at (24fps, 25fps, or 30fps) |
| Audio | AAC, Stereo |
| File size | Under 500 MB is ideal |

> The resolution must be **wider than it is tall** — 1920×1080 means 1920 wide, 1080 tall.
> That is landscape. Do NOT export 1080×1920 (that is portrait / vertical).

---

### B — Create a Vimeo account

1. Open your browser → go to **vimeo.com**
2. Click **Sign Up** (top right)
3. Choose **"Sign up with Email"** → fill in your name, email, password
4. Free account is enough — do not pay for anything yet
5. Free plan gives you **5 GB of storage per week**

---

### C — Upload your landscape showreel

1. After logging in, look at the top of the page
2. Click the **"+ New video"** button (or just **"Upload"**) — it is blue, top right corner
3. A box appears — click **"Choose files"** or drag your MP4 file straight into the box
4. Your video starts uploading — you will see a progress bar
5. While it uploads, fill in the **Title** field — e.g. "Anotha VFX Showreel 2025"
6. Wait until the upload says **"Complete"** and then **"Processing done"**
   - This takes 2–10 minutes depending on your internet speed and file size
   - Do not close the tab while it processes

---

### D — Set privacy so it can play on your website

This step is critical. If you skip it, the video will not embed on your site.

1. After processing is done, click **"Settings"** on the video (or click the video title → then Settings)
2. On the left sidebar click **"Privacy"**
3. Under **"Who can watch this video?"** select:

   **"Only people with a private link"** ← choose this one
   
   This means:
   - It will NOT appear in Vimeo search results
   - Anyone with the link can watch it
   - It CAN be embedded on your website ✓

4. Under **"Where can this be embedded?"** — make sure it says **"Anywhere"**
   - If you see a domain restriction option, leave it open / anywhere
5. Click **"Save"**

---

### E — Get your Video ID

After saving, look at the URL in your browser address bar.
It will look like this:

```
https://vimeo.com/manage/videos/123456789
```

or when you click "View on Vimeo":

```
https://vimeo.com/123456789
```

The **number at the end** is your Video ID. Copy it.

Example — if your URL is `vimeo.com/987654321` then your ID is `987654321`

---

### F — Add the showreel to your website

Open `js/content.js` in PyCharm. Find this block near the top:

```js
showreel: {
  vimeoId:   "",       // ← PASTE YOUR ID HERE (keep the quotes)
  youtubeId: "",
  localFile: "assets/showreel.mp4",
```

Change it to:

```js
showreel: {
  vimeoId:   "987654321",   // ← your actual ID
  youtubeId: "",
  localFile: "",
```

Save the file. Open `index.html` in your browser — click the play button in the Showreel section. Your Vimeo video plays full width, landscape, inside the player. Done.

---

### G — Add portrait (vertical) reels separately

Portrait reels go in the **Reels strip** (the horizontal scroll section), not the main showreel.

Upload each portrait video to Vimeo following steps C, D, E above.
Get the Video ID for each one.

Then open `index.html` in PyCharm. Find the Reels section.
Each card looks like this:

```html
<div class="reel-card"
     data-vimeo=""
     data-youtube=""
     style="--reel-bg: linear-gradient(...)">
```

Paste your Vimeo ID into `data-vimeo`:

```html
<div class="reel-card"
     data-vimeo="111222333"
     data-youtube=""
     style="--reel-bg: linear-gradient(...)">
```

Repeat for each portrait video card.
Click the card on your site → your portrait video plays inside the card at 9:16 ratio.

---

### I — Set a custom thumbnail for a video

Vimeo lets you set any frame (or upload your own image) as the thumbnail shown before the video plays.

1. Go to **vimeo.com** → open your video → click **"Edit"** (pencil icon)
2. Click the **"Thumbnail"** tab on the left
3. Two options:
   - **"Upload a thumbnail"** → upload a JPG or PNG, 1920×1080, from your files
   - **"Select a frame"** → scrub the video and pick the exact frame you want
4. Click **"Save"**

The thumbnail Vimeo shows is used inside the Vimeo player. It appears while the video loads and again if you pause at the beginning. Your website's custom gradient background shows before the video is clicked.

---

### J — Video quality looks bad on the website

**Why it happens:**
Vimeo processes your upload into several quality versions (1080p, 720p, 540p, 360p). This takes time after uploading — sometimes 10–30 minutes. While processing is still running, the embed will play a lower-quality version.

**What to check:**

1. Go to **vimeo.com → your video → Settings → Advanced**
2. Look for **"Distribution"** or **"Video quality"** — confirm it says "1080p available"
3. If it still says processing, wait and check again in 15 minutes

**Embed quality:**
The website requests 1080p quality by default in the embed URL. On Vimeo free accounts, 1080p is available for uploads — but Vimeo may still auto-downgrade based on the viewer's connection speed. There is no way to force a fixed quality on the free plan.

**Source quality matters most:**
If your original exported file was 1080p H.264 MP4, the embed quality will be as good as Vimeo allows. If the source was lower quality, the embed will also be low quality.

---

### K — Add a landscape video to a Project card (3rd video type)

This is for the **Projects grid** — the four landscape cards below the Reels strip.
When someone clicks a card that has a video ID, a full-screen 16:9 lightbox opens.

Upload the video to Vimeo following steps C, D, E above (same process as the showreel).
Your video must be **landscape (1920×1080)** — not portrait.

Then open `index.html` in PyCharm. Find the project card you want to add the video to.
Each card looks like this:

```html
<article class="project-card"
         data-vimeo=""
         data-youtube="">
```

Paste your Vimeo ID into `data-vimeo`:

```html
<article class="project-card"
         data-vimeo="111222333"
         data-youtube="">
```

Save → the card now shows a gold play icon on hover.
Click the card on your live site → the lightbox opens and plays your video at full width.

---

### L — Common mistakes

| Problem | Fix |
|---|---|
| Video plays with black bars on the sides | You exported portrait (9:16) — re-export as 1920×1080 landscape |
| "This video does not exist" error | Privacy is set too strict — change to "Only people with a private link" |
| Video plays on Vimeo but not on your site | Check "Where can this be embedded?" — must be set to "Anywhere" |
| Upload stuck at 0% | File is too large or connection dropped — try a smaller file or a different browser |
| "Processing failed" on Vimeo | Re-export from your editor — some codecs fail (use H.264 MP4 only) |

---

## PART 3 — Upload to GitHub

GitHub stores your website files and publishes them live for free.

### Step 1 — Create a GitHub account
- Go to **github.com** → Sign Up
- Choose a username — this becomes part of your site URL, e.g. `jatin-vfx`

### Step 2 — Install GitHub Desktop
- Download from **desktop.github.com** (free, Windows)
- Sign in with your GitHub account

### Step 3 — Create a repository
1. In GitHub Desktop → **File → New Repository**
2. Name it exactly: `your-username.github.io`
   - Example: if your username is `jatin-vfx` → name it `jatin-vfx.github.io`
   - This exact format gives you a clean URL with no subfolder
3. Leave everything else as default → click **Create Repository**

### Step 4 — Add your website files
1. GitHub Desktop shows you the local folder — click **"Show in Explorer"**
2. Copy everything from `A:\ANOTHA VFX\` into that folder:
   - `index.html`
   - `about.html`
   - `contact.html`
   - `css/` folder
   - `js/` folder
   - `assets/` folder
   - `SETUP.md` (optional, can skip)
3. Go back to GitHub Desktop — you'll see all files listed as new changes

### Step 5 — Commit and publish
1. In the bottom-left box, type a message like: `Initial upload`
2. Click **"Commit to main"**
3. Click **"Publish repository"** (top bar)
4. Make sure **"Keep this code private"** is **unchecked** (GitHub Pages needs public)
5. Click **"Publish Repository"**

### Step 6 — Enable GitHub Pages
1. Go to **github.com** → open your repository
2. Click **Settings** (top nav of the repo)
3. Scroll down to **Pages** (left sidebar)
4. Under **Source** → select **"Deploy from a branch"**
5. Branch: **main** → Folder: **/ (root)** → click **Save**
6. Wait 2–3 minutes → your site is live at:
   ```
   https://your-username.github.io
   ```

---

## PART 4 — Buying & Connecting a Custom Domain

### Step 1 — Buy a domain
Best registrars (cheapest, most reliable):
- **Namecheap** (namecheap.com) — ~$10–12/year for `.com`
- **Porkbun** (porkbun.com) — often cheaper, good UI
- **Cloudflare Registrar** (cloudflare.com/registrar) — at-cost pricing, no markup

Suggested domains for your portfolio:
```
anothavfx.com
jatinvfx.com
anothafx.com
jatinvishwakarma.com
```

### Step 2 — Add the domain to GitHub Pages
1. Go to your GitHub repo → **Settings → Pages**
2. Under **Custom domain** → type your domain (e.g. `anothavfx.com`) → click **Save**
3. GitHub creates a file called `CNAME` in your repo automatically — leave it there

### Step 3 — Point your domain to GitHub (DNS settings)
Go to your domain registrar → find **DNS Settings** or **Manage DNS**.

Add these **A records** (they point your domain to GitHub's servers):

| Type | Host | Value |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

Also add this **CNAME record** (makes `www.` work too):

| Type | Host | Value |
|------|------|-------|
| CNAME | www | your-username.github.io |

### Step 4 — Wait for DNS to propagate
DNS changes take **10 minutes to 48 hours** to go live worldwide.
Most of the time it's under an hour.

Check progress at: **dnschecker.org** → enter your domain

### Step 5 — Enable HTTPS (free SSL)
1. Once DNS is working → go to **GitHub repo → Settings → Pages**
2. Check **"Enforce HTTPS"** — this gives your site a padlock and `https://`
3. This is free and automatic via GitHub + Let's Encrypt

Your site is now live at `https://anothavfx.com` (or whatever you chose).

---

## PART 5 — Making Changes After Going Live

Your workflow every time you update the site:

### 1. Edit files locally in PyCharm
Open the files in `A:\ANOTHA VFX\` and make your changes as normal.
Save the files.

### 2. Open GitHub Desktop
GitHub Desktop automatically detects what changed.
You'll see a list of modified files on the left.

### 3. Commit the changes
1. In the bottom-left summary box, write what you changed — e.g.:
   - `Add new Horror Corridor project`
   - `Update contact email`
   - `Add Reel 03 Vimeo ID`
2. Click **"Commit to main"**

### 4. Push to GitHub
Click **"Push origin"** (top bar).

### 5. Wait 1–2 minutes
GitHub Pages rebuilds your site automatically.
Refresh your live domain and the changes are there.

---

## PART 6 — Adding More Videos

---

### Adding a new Portrait Reel card

Open `index.html` in PyCharm. Find the Reels section — you'll see blocks like this:

```html
<!-- REEL 01 — set data-vimeo or data-youtube to your video ID -->
<div class="reel-card"
     data-vimeo=""
     data-youtube=""
     style="--reel-bg: linear-gradient(160deg,#12002a,#3d0066,#1a0035)">
  <div class="reel-bg"></div>
  <div class="reel-overlay"></div>
  <div class="reel-play-btn">
    <div class="reel-play-circle"><div class="reel-play-icon"></div></div>
  </div>
  <div class="reel-info">
    <span class="reel-num">01</span>
    <span class="reel-title">Spider-Man</span>
    <span class="reel-tag">VFX</span>
  </div>
</div>
```

**To add a new portrait reel:**
1. Copy one of those entire `<div class="reel-card">` blocks
2. Paste it directly below the last reel card (before the `<!-- ADD MORE REELS` comment)
3. Change the number in `<span class="reel-num">`, the title, and the tag
4. Paste your Vimeo ID into `data-vimeo=""`
5. Optionally change the gradient colour in the `style="--reel-bg: ..."` attribute (used as fallback before thumbnail loads)
6. Save

The scroll pip dots and the scroll bar update **automatically** — no manual editing needed.

The thumbnail loads automatically from Vimeo as soon as the page opens. No manual image download needed.

---

### Adding a new Landscape Project card

Open `index.html`. Find the Projects section — you'll see blocks like this:

```html
<!-- PROJECT 01 ─────────────────────────────── -->
<article class="project-card"
         data-vimeo=""
         data-youtube="">
  <div class="project-link">
    <div class="project-media">
      <div class="project-bg"
           style="background:linear-gradient(135deg,#12002a 0%,#3d0066 50%,#1a0035 100%)"></div>
      <div class="project-cat">VFX Compositing</div>
      <div class="project-media-overlay">
        <div class="project-arrow">...</div>
      </div>
    </div>
    <div class="project-info">
      <div class="project-meta">
        <span class="project-num">01</span>
        <span class="project-year">2024</span>
      </div>
      <h3 class="project-title">Spider-Man VFX</h3>
      <p class="project-desc">Your description here.</p>
      <div class="project-tags">
        <span class="tag">After Effects</span>
        <span class="tag">Blender</span>
      </div>
    </div>
  </div>
</article>
```

**To add a new project card:**
1. Copy one of those entire `<article class="project-card">` blocks
2. Paste it after the last project card, still inside `<div class="projects-grid">`
3. Update the number, year, title, description, tags, and category
4. Paste your Vimeo ID into `data-vimeo=""`
5. Optionally change the gradient in `style="background:linear-gradient(...)"`
6. Save

The **"05"** project count updates automatically — no manual editing needed.

The Vimeo thumbnail loads automatically as the background. Clicking the card opens the full-screen 16:9 lightbox player.

---

## PART 7 — Editing Existing Content

Everything that's editable and where to find it:

| What to change | File to open |
|---|---|
| Showreel Vimeo ID | `js/content.js` → `showreel.vimeoId` |
| Portrait reel video IDs | `index.html` → find `.reel-card`, set `data-vimeo` |
| Landscape project video IDs | `index.html` → find `<article class="project-card">`, set `data-vimeo` |
| Project titles, descriptions, tags | `index.html` → find `.project-card` blocks |
| Project gradient colours | `index.html` → `style="--reel-bg: ..."` on each card |
| Your bio text | `about.html` → `.bio-lead` and `.bio-p` paragraphs |
| Skills list | `about.html` → `.skill` items in `.skills-grid` |
| Your photo | Replace `assets/jatin.jpg` → update `<img src="...">` in `about.html` |
| Email / phone / Instagram | `contact.html` → `.contact-items` section |
| Web3Forms access key | `contact.html` → `value="YOUR_ACCESS_KEY"` |
| Nav logo text | `index.html`, `about.html`, `contact.html` → `.logo-name` and `.logo-sub` |
| Footer copyright | All three HTML files → `.footer-bottom span` |
| Font (body) | `css/style.css` → `font-family: 'Inter'` (and Google Fonts link in `<head>`) |
| Accent colour (gold) | `css/style.css` → `--gold: #c4a472` in `:root` |
| Background colour | `css/style.css` → `--bg: #050505` in `:root` |

---

## PART 8 — File Structure Reference

```
ANOTHA VFX/
│
├── index.html          Homepage (hero, showreel, reels, projects)
├── about.html          About page (bio, skills, photo)
├── contact.html        Contact page (form, email, phone, Instagram)
├── SETUP.md            This file
│
├── js/
│   ├── content.js      Showreel video ID config
│   └── main.js         All animations and interactions
│
├── css/
│   └── style.css       All visual styles and design tokens
│
└── assets/             Drop your media files here
    ├── showreel.mp4          Background video for hero (muted loop)
    ├── showreel-poster.jpg   Thumbnail shown before showreel plays
    ├── jatin.jpg             Your photo for About page
    └── previews/
        ├── spiderman.mp4     Short hover preview for project card 01
        ├── horror.mp4        Short hover preview for project card 02
        └── ...
```

---

## Quick Launch Checklist

- [ ] Web3Forms: got access key, pasted into `contact.html`
- [ ] Showreel uploaded to Vimeo, ID pasted into `js/content.js`
- [ ] Portrait reels: Vimeo IDs pasted into `data-vimeo` on each `.reel-card`
- [ ] Landscape project videos: Vimeo IDs pasted into `data-vimeo` on each `<article class="project-card">` (optional — leave blank if no video yet)
- [ ] `assets/showreel-poster.jpg` exists (screenshot from your reel)
- [ ] Photo added as `assets/jatin.jpg`, `<img>` tag updated in `about.html`
- [ ] Project titles and descriptions edited in `index.html`
- [ ] Files uploaded to GitHub via GitHub Desktop
- [ ] GitHub Pages enabled (Settings → Pages → main branch)
- [ ] Domain bought and DNS A records pointed at GitHub's IPs
- [ ] Custom domain entered in GitHub Pages settings
- [ ] HTTPS enforced in GitHub Pages settings
- [ ] Tested on mobile (browser DevTools → Ctrl+Shift+M)
