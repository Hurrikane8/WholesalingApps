# Aurora Home Buyers brand

The design system in one page: for Kane, a designer, a printer, or a Claude Code session. The full reasoning is in `docs/aurora-v2-spec.md` (sections 2 and 3). The code is the source of truth: tokens live in `src/app/globals.css`, hex values for images in `src/components/brand/colors.ts`, and `/styleguide` (preview builds only) shows every token and component.

## The idea: rooflines under northern light

- **Winter daylight.** A cool snow-white page (not cream), deep spruce ink, and one pine green for action. Calm, clean and very readable.
- **Plain lettering.** Overpass for headlines (a descendant of North American highway-sign lettering, built to be read fast) and Atkinson Hyperlegible Next for everything else (designed with the Braille Institute for low-vision readers).
- **One memorable thing: the Aurora Roofline.** A single line tracing a street of Edmonton home types (bungalow, two-storey, a row of townhouses, a half duplex, a walk-up, a bungalow with a garage) under a ribbon of northern light. It says the name, the city and "every kind of home" in one image. Everything around it stays quiet.

The name: Kane grew up in Manning, Alberta, in the County of Northern Lights; the community was first known as Aurora (source: The Canadian Encyclopedia, "Manning").

## Colour

| Token | Hex | Use |
|---|---|---|
| `snow` | `#F4F7F8` | Page background |
| `frost` | `#E3ECEE` | Alternate sections, unselected chips, the footer |
| `white` | `#FFFFFF` | Form card, ledgers, inputs |
| `mist` | `#C9D6D9` | Decorative rules and dividers only; never text or input borders |
| `line` | `#6F8781` | Input and control borders |
| `ink` | `#183A31` | Text, headings, the logo |
| `ink-2` | `#3F5A54` | Secondary text |
| `ink-3` | `#4D6660` | Fine print and captions only, 14px or larger |
| `pine` | `#0B6B4F` | Primary buttons, selected chips |
| `pine-deep` | `#08573F` | Hover and pressed |
| `night` | `#0E2A30` | The one dark section a page may have |
| `night-ink-2` | `#B8CCCB` | Secondary text on night |
| `aurora-green` | `#3FE0A0` | Ribbon and logo crossbar; decorative only |
| `aurora-teal` | `#31C6D4` | Ribbon midpoint; decorative only |
| `aurora-violet` | `#8F7CF7` | Ribbon tail; decorative only |
| `focus` / `focus-night` | `#4B3FC4` / `#9EF0CF` | Focus rings on light / night |
| `error` | `#B3261E` | Error text and borders |
| `signal` | `#9A5B00` | "Unconfirmed" and "Draft" preview tags only |

Rules: aurora colours never carry text or fill large areas; no gradient washes; at most one night section per page; body text never lighter than `ink-2`; no dark theme. Sections alternate snow and frost, and every page ends on snow above the frost footer.

## Type

| Role | Family | Size | Weight |
|---|---|---|---|
| Home H1 | Overpass | `clamp(2.5rem, 1.6rem + 3.6vw, 4.5rem)` | 800 |
| H1 | Overpass | `clamp(2.125rem, 1.5rem + 2.6vw, 3.5rem)` | 800 |
| H2 | Overpass | `clamp(1.625rem, 1.25rem + 1.6vw, 2.5rem)` | 750 |
| H3 | Overpass | 1.375rem | 700 |
| Lead | Atkinson | 1.25rem | 400 |
| Body | Atkinson | 1.125rem | 400 |
| Small | Atkinson | 1rem | 400 |
| Fine print (the minimum anywhere) | Atkinson | 0.875rem | 400 |
| Buttons | Overpass | 1.125rem | 700 |

Utilities: `type-home-h1`, `type-h1`, `type-h2`, `type-h3`, `type-lead`, `type-small`, `type-fine`, `nums` (tabular figures for every money amount), `measure` (68ch prose).

Rules: sentence case everywhere (headings, buttons, navigation, titles); no all-caps or letter-spaced labels; no eyebrow labels above headings; never accent a single word in a headline; no monospace.

Fonts are self-hosted: Overpass through `next/font/google`, Atkinson Hyperlegible Next through `next/font/local` (Fontsource variable). Social cards use the static Fontsource WOFF files.

## Shape, space and depth

- Radii by role: buttons 10px, inputs and chips 8px, the form card 16px, ledgers 6px, photos 4px.
- Content width 1200px; gutters 20 / 32 / 48px. Section padding 64px on phones, 96px on desktop (`band`); the home page uses 48 / 64px to stay within its length budget.
- Exactly one floating object: the lead form card (`shadow-float`, 1px mist border). Everything else separates with space, a background change or a 1px mist rule.
- Buttons: 52px tall (44px in the header); primary is pine with a thin inset white rule (a nod to highway guide signs); secondary is outlined in ink; on night, snow with ink text. No arrows after button or link text.
- Links: ink, 1px underline offset 3px, pine on hover. Focus: a 3px outline with a 2px offset. Touch targets at least 44px.

## Logo

- **The interim mark:** an "A" drawn as a steep gable roof, with an aurora ribbon as its crossbar, running past the right leg like light trailing off the roof. Code: `src/components/brand/Mark.tsx` and `mark-shapes.tsx`.
- **Full lockup:** the mark, "Aurora Home Buyers" in Overpass 800 ink, and "Edmonton, Alberta" underneath in Atkinson at 14px in `ink-2`. Below 360px wide, the compact lockup: mark and name only. Code: `src/components/brand/Logo.tsx`.
- **Icons:** `src/app/icon.svg` (the mark on a snow rounded square, strokes up about 20% so it reads at 16px), `apple-icon.tsx`, and `/brand/logo.png` (512×512, the schema logo).
- **Kane's own logo:** save it as `public/brand/logo.svg` and ask Claude Code to swap it into the header, footer and icons, keeping these lockup rules.
- Don't recolour the mark, stretch it, put it on a busy photo, or add effects. On night, the roof strokes are snow.

## The Aurora Roofline

`src/components/brand/AuroraRoofline.tsx`: pure inline SVG, one self-contained component, so an illustrator's redraw can replace it.

- The horizon is one continuous ink line (2px; 1.5px on phones); about a third of the homes have small windows. Below 640px it crops to the middle 60% rather than shrinking.
- The ribbon arcs from lower left to upper right with two soft waves (green, teal, violet), with a soft glow behind it.
- It's the home hero's bottom edge (the ribbon draws itself once on load, the only unprompted motion on the site; fully drawn with reduced motion), the footer's top edge (a static crop, no ribbon), and the night section's top (the ribbon alone). Text never overlaps the line work.

## Photos and video

- Real photos only: of Kane, taken by or for him, or licensed images of places. **Never stock photos of people, and never AI-generated people.**
- Shot list: Kane outdoors on an established Edmonton street in natural light (one vertical, one horizontal with room for text); Kane at a kitchen table with a printed offer and a pen (hands and paper, no staged handshake); exteriors of the roofline's home types in winter and summer (no house numbers, no identifiable client homes); if possible, the northern lights over Edmonton rooftops.
- Files go in `public/images/`; set `site.founder.photo` and `photoAlt`. Alt text says what's in the picture. Every layout must look finished without photos.
- Optional intro video: 60–90 seconds, filmed on a phone with a clip-on mic; self-hosted MP4 of 12 MB or less, a poster and WebVTT captions; never autoplay with sound (`site.founder.video`).

## Motion

The ribbon draw is the only unprompted motion. Menus, accordions, chips and buttons respond in 150ms or less. No scroll-triggered fades, parallax or hover lifts. Reduced motion is honoured everywhere.

## Voice

- First person singular, as Kane, on everything a seller reads. "We" and the business name only in legal and disclosure text.
- Plain and specific: short sentences, plain verbs, Canadian spelling, no exclamation marks. Explain; don't sell. Say something checkable, or say nothing.
- Tagline: **Straight answers on selling your home.**
- The pillars (shown only while their flags are verified): you see the math; you hear it when listing wins; you know who's buying.
- Banned phrases, the claims system and how to write around unconfirmed promises: `docs/content-playbook.md`.

## Never do these

ALL-CAPS or letter-spaced labels; eyebrow labels; meta strings joined with middle dots; a single accented word in a headline; arrows after link or button text; identical rounded cards with icons in rounded squares; one shadow under everything; gradient washes; cream backgrounds, terracotta, navy with amber, or near-black pages with a neon accent; monospace type; numbered markers on anything that isn't a sequence; any claim about volume, speed or experience that doesn't come from `claims.ts`.
