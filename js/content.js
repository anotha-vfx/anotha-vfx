/**
 * ================================================================
 *  ANOTHA VFX — SITE CONTENT FILE
 *  Edit everything in this file to update the whole website.
 *  Open this file in PyCharm and change any value below.
 * ================================================================
 */

window.SITE = {

  /* ----------------------------------------------------------------
   * BRANDING
   * ---------------------------------------------------------------- */
  brand: {
    stageName:   "ANOTHA",          // Shown in nav logo (big letters)
    stageTag:    "VFX",             // Shown in nav logo (small accent)
    fullName:    "Jatin Vishwakarma",
    firstName:   "JATIN",
    lastName:    "VISHWAKARMA",
    role:        "VFX Artist  ·  Video Editor",
    tagline:     "Crafting cinematic worlds, frame by frame.",
  },

  /* ----------------------------------------------------------------
   * HERO STATS  (3 numbers shown beneath the name in the hero)
   * ---------------------------------------------------------------- */
  stats: [
    { value: "4+",  label: "Years"    },
    { value: "50+", label: "Projects" },
    { value: "∞",   label: "Frames"   },
  ],

  /* ----------------------------------------------------------------
   * SHOWREEL  (the large video section below the hero)
   *
   *  Pick ONE option and fill it in — leave the others blank "":
   *
   *  Option A – Vimeo (recommended for quality + privacy controls)
   *    → Open your Vimeo video. The URL looks like:
   *       vimeo.com/123456789
   *    → Copy the numbers at the end → paste into vimeoId below
   *
   *  Option B – YouTube
   *    → Open your video. URL: youtube.com/watch?v=XXXXXXXXXXX
   *    → Copy the part after v= → paste into youtubeId below
   *
   *  Option C – Local file
   *    → Drop your .mp4 in the assets/ folder
   *    → Set localFile: "assets/showreel.mp4"
   * ---------------------------------------------------------------- */
  showreel: {
    vimeoId:   "1194482437",                    // e.g.  "123456789"
    youtubeId: "",                    // e.g.  "dQw4w9WgXcQ"
    localFile: "", // fallback if above are blank ""assets/showreel.mp4""
    poster:    "assets/showreel-poster.jpg",
    year:      "2026",
  },

  /* ----------------------------------------------------------------
   * HERO BACKGROUND VIDEO  (muted, looping, behind the title)
   *  Same file as the showreel is fine — or use a shorter clip.
   * ---------------------------------------------------------------- */
  heroVideo: {
    localFile: "assets/showreel.mp4",
    poster:    "assets/showreel-poster.jpg",
  },

  /* ----------------------------------------------------------------
   * PROJECTS
   *  Add or remove objects in this array to add/remove project cards.
   *  videoPreview: short clip that plays on hover (leave "" if none)
   *  link: where clicking the card goes ("#" = no link yet)
   * ---------------------------------------------------------------- */
  projects: [
    {
      number:       "01",
      year:         "2024",
      title:        "Spider-Man VFX",
      category:     "VFX Compositing",
      description:  "Cinematic web-slinging sequence with custom particle systems, compositing, and dynamic lighting.",
      tags:         ["After Effects", "Blender", "Compositing"],
      bgGradient:   "linear-gradient(135deg,#12002a 0%,#3d0066 50%,#1a0035 100%)",
      videoPreview: "",   // e.g. "assets/previews/spiderman.mp4"
      link:         "#",
    },
    {
      number:       "02",
      year:         "2024",
      title:        "Horror Corridor",
      category:     "Atmospheric VFX",
      description:  "Atmospheric horror environment with volumetric fog, practical lighting FX, and creature compositing.",
      tags:         ["Blender", "DaVinci Resolve", "VFX"],
      bgGradient:   "linear-gradient(135deg,#001510 0%,#003322 50%,#001a14 100%)",
      videoPreview: "",
      link:         "#",
    },
    {
      number:       "03",
      year:         "2024",
      title:        "Motion Reel",
      category:     "Motion Graphics",
      description:  "Compilation of motion graphics and kinetic typography across film and digital campaigns.",
      tags:         ["After Effects", "Cinema 4D", "Motion"],
      bgGradient:   "linear-gradient(135deg,#100800 0%,#2e1800 50%,#180d00 100%)",
      videoPreview: "",
      link:         "#",
    },
    {
      number:       "04",
      year:         "2025",
      title:        "Sci-Fi Environment",
      category:     "3D & Environment",
      description:  "Futuristic world-building with procedural texturing, atmospheric scattering, and environment design.",
      tags:         ["Blender", "Substance", "3D Render"],
      bgGradient:   "linear-gradient(135deg,#00101e 0%,#001f3d 50%,#000d1a 100%)",
      videoPreview: "",
      link:         "#",
    },
  ],

  /* ----------------------------------------------------------------
   * ABOUT PAGE
   * ---------------------------------------------------------------- */
  about: {
    // Your photo — drop the image in assets/ and update the path
    photo:    "",          // e.g. "assets/jatin.jpg"
    photoAlt: "Jatin Vishwakarma",

    // Bio paragraphs — each string is a separate paragraph
    bio: [
      "I'm Jatin Vishwakarma — a VFX artist and video editor working under the name Anotha VFX.",
      "My work spans compositing, 3D visual effects, motion design, and full video editing — bridging the gap between raw footage and polished, story-driven visuals. Every frame is a craft.",
      "With a director's eye for storytelling and a craftsman's obsession with quality, I approach every project as an opportunity to push what's possible inside a frame.",
    ],

    tools: [
      "Blender", "After Effects", "DaVinci Resolve", "Premiere Pro",
      "Cinema 4D", "Nuke", "Photoshop", "Substance Painter",
    ],

    specializations: [
      "VFX Compositing", "Motion Graphics",
      "3D Modeling & Render", "Color Grading",
      "Particle FX", "Video Editing",
    ],
  },

  /* ----------------------------------------------------------------
   * CONTACT PAGE
   *
   *  formEndpoint: sign up at formspree.io → create a form →
   *  copy the endpoint URL and paste it here.
   *  It looks like: https://formspree.io/f/abcdefgh
   * ---------------------------------------------------------------- */
  contact: {
    email:            "anotha.vfx@gmail.com",
    phone:            "+918989417415",
    phoneDisplay:     "+91 89894 17415",
    instagram:        "@anotha.fw.vfx",
    instagramUrl:     "https://instagram.com/anotha.fw.vfx",
    available:        true,
    availabilityText: "Available for new projects",
    formEndpoint:     "https://formspree.io/f/YOUR_FORM_ID",
  },

  /* ----------------------------------------------------------------
   * FOOTER
   * ---------------------------------------------------------------- */
  footer: {
    copyright: `© ${new Date().getFullYear()} Jatin Vishwakarma. All rights reserved.`,
  },

};
