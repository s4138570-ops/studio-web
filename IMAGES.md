# Image slots (for the team)

Every dashed "IMAGE · name" box in the page is a slot. To fill one, put your picture inside it:

```html
<div data-slot="stop-hero" class="ph hero"><img src="img/stop-hero.jpg" alt="Short description"></div>
```

The label and dashed border disappear automatically, and large images get a torn-paper bottom edge.
Use `.jpg`/`.webp` for photos, `.svg`/`.png` for illustrations. Keep each file under ~300 KB.

| Slot name | Screen | Size (px) | Notes |
|---|---|---|---|
| `stop-hero` | 01 | 706 × 340 | Real photo of Num Pon Soon Society (licensed / archive) |
| `quick-hero` | 05 | 706 × 360 | **Find-it image** — made by the team |
| `full-hero` | 06 | 706 × 228 | Real photo or archive image |
| `source-1` … `source-4` | 07 | 80 × 80 | Institution logos (check usage rules) |
| `ar-view` | 08 | 706 × 860 | Camera preview / AR mock-up |
| `map` | 09 | 706 × 940 | Map style or screenshot |

Already drawn (SVG in `img/`, replace freely): `stamp-1…8.svg`, `header-street.svg`
(screens 02 & 03), `banner-tonight.svg` (11), `share-card.svg` (13), `offline.svg` (14).

Palette: red `#C41E2A` · teal `#16303A` · green `#0A7A3C` · cream `#FBF1DC` · peach `#F8D9A8` ·
yellow `#F1EB7A` · orange `#F07A2E`. Fonts: Fraunces italic (headings), Noto Serif / SC / TC (text).

Translations live in `i18n.js` (English → 简体, 繁體). Proper names are kept in English until
official Chinese names are confirmed.
