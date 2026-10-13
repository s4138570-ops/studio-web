# Images and content (for the team)

## Where things live

| What | File |
|---|---|
| Stop text (English): title, address line, Quick Look, Find it, Full Story, sources | `stops.js` |
| 简体 / 繁體 translations of every string | `i18n.js` (繁體 converted from 简体 with OpenCC, Taiwan wording) |
| Stop photos | `img/stop-1.jpg` … `img/stop-8.jpg`, set by `img:` in `stops.js` |
| Stamps | `img/stamp-1.svg` … `img/stamp-8.svg` (placeholders) |

Each stop has its own pages: `#/1/7` is the entry page of stop 7, `#/5/7` its Quick Look,
`#/6/7` its Full Story and `#/7/7` its sources. The stop list (screen 10) and the map pins link there.

## Stop photos

Crop to 4:3 (about 720 × 540 px, under 300 KB) and set `img:` in `stops.js`. A stop with `img: null`
shows the empty image slot.

| Stop | File | Status | Credit (fill in) |
|---|---|---|---|
| 1 The arches | `stop-1.jpg` | **waiting**: the Exhibition Street arch photo | ? |
| 2 Sum Kum Lee | `stop-2.jpg` | **waiting**: the Shanghai Village facade photo | ? |
| 3 Num Pon Soon | `stop-3.jpg` | done | ? (looks like a heritage-survey slide) |
| 4 Cohen Place | `stop-4.jpg` | **waiting**: the Chinese Museum entrance with the lions | ? |
| 5 The furniture lanes | `stop-5.jpg` | done | Australasian Sketcher, April 1880 (shown on the page) |
| 6 Chinese Mission Church | `stop-6.jpg` | done | ? |
| 7 Kuomintang Building | `stop-7.jpg` | done | ? |
| 8 Celestial Avenue | `stop-8.jpg` | done | Google Street View (shown on the page) |

Before a public launch, confirm the source and permission of every photo and add the credit to
`credit:` in `stops.js`.

## Stamps

The team's stamp art is in `img/stamp-1.webp` … (white background removed, 480 px wide). The order and
the list of files are set by `STAMP_ART` in `script.js`; `null` shows an empty dashed slot.

| # | Stamp | File |
|---|---|---|
| 1 | Painting a lantern | `stamp-1.webp` |
| 2 | Mooncakes | `stamp-2.webp` |
| 3 | Stage and crowd | `stamp-3.webp` |
| 4 | Stamp card and phone | `stamp-4.webp` (also the "Collect the stamps" thumbnail, screen 11) |
| 5 | Moonlit street | `stamp-5.webp` |
| 6 | Lion dance | **waiting** for the file |
| 7 | Chinatown gate | **waiting** for the file |
| 8 | ? | not designed yet |

`img/stop-art-1.svg` … `stop-art-8.svg` are drawings of each stop, used in the stop list until the
stop has a photo.

## Still to do

- **AR (screen 08)**: waiting on the team. The "See it in AR" button shows on stop 3 only.
- **Find it**: each challenge was written from the photos. Check on site that the thing is still there.
- **Map pins**: positions are estimates from street numbers; move a pin by editing its `left`/`top` %
  in `index.html` (screen 09).
- **Facts**: every story cites its sources on the Sources screen. Where records disagree, the text says so.

## Other images

`header-street.svg` (screens 02 & 03), `share-card.svg` (13), `offline.svg` (14), `map.jpg` (09, Google Maps
screenshot), `promo.jpg` (the team's Mid-Autumn poster, screens 03 & 11). Spare: `banner-tonight.svg`,
`motif-fan.svg`, `motif-lantern.svg`, `motif-noodle.svg`.

Palette: red `#C41E2A` · teal `#16303A` · green `#0A7A3C` · cream `#FBF1DC` · peach `#F8D9A8` ·
yellow `#F1EB7A` · orange `#F07A2E`. Fonts: Fraunces italic (headings), Noto Serif / SC / TC (text).
