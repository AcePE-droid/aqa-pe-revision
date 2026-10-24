# Logo build

Turns the designer's Illustrator PDF into every logo asset the site uses.
Run it only when the artwork itself changes.

```bash
python3 tools/logo/build.py "/path/to/ace PE.pdf"
```

## What it writes

| Output | Notes |
| --- | --- |
| `public/brand/acepe-lockup-{dark,green,cream}.svg` | Lockup, one ink, transparent |
| `public/brand/acepe-lockup-cream-on-{green,dark}.svg` | Reversed, panel baked in |
| `public/brand/acepe-icon-{dark,green,cream}.svg` | The loop in its disc |
| `public/brand/acepe-icon-green-16px.svg` | 16px-only variant, see below |
| `components/BrandLockup.tsx` | The same paths, inline, on `currentColor` |
| `app/favicon.ico` | 16, 32 and 48px, PNG-compressed entries |
| `app/icon.png` | 192px, the icon search engines use |
| `app/apple-icon.png` | 180px, full-bleed, for iOS home screens |

The favicon is cut from the green icon, set by `FAVICON_VARIANT` in
`build.py`. Green because it holds up against a light and a dark browser tab
bar alike, where the ink disc is close enough to a dark chrome to sink into
it. The 16px-only file is built in whatever colour that constant names, since
serving the favicon is the only thing it is for.

Everything above is generated. Editing the path data in any of them by hand
will be silently undone the next time this runs, so change the build instead.

## Where the source PDF is

Not in this repo. It is the designer's 2.6 MB export with ten pages of
competing concepts on it, only some of which were chosen; ask the site owner
for a copy. The build reads two of those pages:

- **page 2** for the lockup, the one place it sits on its own, and
- **page 10** for the disc icon.

The chosen lockup appears twice on page 10 at different weights. The one the
build uses is identified by the ratio of the mark's height to the wordmark's
x-height, which matches page 2 and the other candidate does not.

## How it works, and why it is written this way

This machine has no poppler, mupdf, Inkscape or librsvg, and no Homebrew to
install them, so the conversion is done from scratch:

- `pdf2svg.py` walks the PDF's content stream and re-emits the vector geometry
  as SVG, tracking the transform and colour state. It implements only the
  operators this file actually uses, and reports anything it does not
  recognise rather than skipping it quietly, so a gap shows up as an error
  instead of as missing artwork.
- `pdftool.swift` does the two things CoreGraphics is needed for: reading
  glyph outlines out of the font subset embedded in the PDF, and converting
  the file's CMYK colours to sRGB through a real colour-managed conversion.
- `svgraster.swift` renders the SVGs for the favicon. It understands only the
  subset `build.py` emits, deliberately, so an unexpected file is an error.

Both Swift helpers are compiled on first run into `tools/logo/.bin/`, which is
git-ignored. That directory also ends up holding the extracted font subsets,
which is the other reason it must never be committed: they are fragments of
commercial fonts this project does not license. What ships is outlined paths,
which is artwork rather than font software.

## Decisions baked into the build

**Colour comes from the vector data, not from pixels.** The PDF specifies
CMYK. Converted through CoreGraphics those are `#055D33` and `#1A1919`, which
is what a real render produces; a naive CMYK formula gives a visibly different
green. Both are recorded in `app/globals.css` as `--color-brand-green` and
`--color-brand-ink`.

**The knockout is the site's cream, `#F4EFE6`, not the designer's white.** So
the reversed artwork matches the page it sits on.

**The viewBox is flush with the ink.** Bounds are computed by solving each
curve for where it turns, not by taking the extent of the path coordinates:
Bezier control points sit outside the curve they steer, and using them left
about 3% dead space under the lockup.

**The 16px favicon uses an enlarged mark.** As drawn, the loop is just under
half the disc's width, which is about 8px inside a 16px icon. At that size the
loop's counter falls below a pixel, fills in, and the mark reads as a smudge.
The 16px entry alone enlarges the mark to 72% of the disc, which keeps the
counter open while staying clear of the edge; 32px and up use the proportions
as drawn. `SMALL_ICON_MARK_FRACTION` in `build.py` controls this.

Worth knowing when judging it: on a Retina screen a 16px favicon is drawn at
32 device pixels, so the problem this corrects is only visible on a 1x display.

**The `.ico` is not the icon Google uses.** Next declares `favicon.ico` as
`sizes="16x16"`, and Google wants a square that is a multiple of 48px, so
`app/icon.png` exists at 192px to be the one it picks. Next emits the `<link>`
tags for both from the filenames alone; there is nothing to wire up.

**The Apple icon is full-bleed on purpose.** iOS applies its own rounded mask
and does not handle transparency, so it is the loop on a solid green field
rather than the disc, which would otherwise show as a circle inside a
squircle.

Changing any of these will not change what Google shows straight away. It
caches favicons and refreshes them when it next crawls, which takes days or
weeks. Requesting indexing for the homepage in Search Console brings the
crawl forward but does not guarantee the swap.
