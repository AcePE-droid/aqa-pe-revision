#!/usr/bin/env python3
"""Build every Ace PE logo asset from the designer's PDF.

Run this when the artwork changes; it is the only thing that should write to
public/brand/ or app/favicon.ico. Everything it produces is derived from the
PDF's own vector data, so nothing here is traced, redrawn or sampled from a
screenshot:

  * the lockup comes from the page where it sits on its own,
  * the icon comes from the variants sheet,
  * the wordmark's type is replaced by real glyph outlines pulled out of the
    font subset embedded in the PDF, so the files need no font installed,
  * colours are the file's own CMYK run through CoreGraphics, which is what
    makes them agree with a real render rather than with a naive formula.

Usage:
    python3 tools/logo/build.py "/path/to/ace PE.pdf"

The PDF is not in the repo: it is the designer's 2.6 MB Illustrator export.
Ask the site owner for it if these assets ever need regenerating.
"""
import os
import struct
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
BIN = os.path.join(HERE, ".bin")
os.environ.setdefault("LOGO_BIN_DIR", BIN)

sys.path.insert(0, HERE)
import pdf2svg  # noqa: E402  (needs LOGO_BIN_DIR set first)
from pdf2svg import NUMRE, convert, load_pdf  # noqa: E402

SVG_DIR = os.path.join(ROOT, "public", "brand")
ICO_PATH = os.path.join(ROOT, "app", "favicon.ico")

# Straight out of the PDF: cmyk(0,0,0,1) and cmyk(0.939,0.328,1,0.26).
INK = "#1A1919"
GREEN = "#055D33"
# The site background, used instead of the designer's #F6F0E3 so the reversed
# artwork matches the page it sits on.
CREAM = "#F4EFE6"

# The loop is 51.5% of the disc's width as drawn. That is 8.2px inside a 16px
# favicon, at which size the loop's counter falls below one pixel and fills in,
# so the mark reads as a smudge. Enlarging it to 72% inside the same disc keeps
# the counter open while staying clear of the disc's edge. It is an optical
# correction for one size only: 32px and above use the proportions as drawn.
SMALL_ICON_MARK_FRACTION = 0.72
ICO_SIZES = (16, 32, 48)


# --- geometry ---------------------------------------------------------------

def affine(d, scale, offset):
    """Apply x' = scale*x + offset to an SVG path of absolute M/L/C/Z commands.

    One pass over the path, so it cannot accidentally compound: an earlier
    version folded the translate and the scale into one helper and applied the
    scale twice, which silently squared it.
    """
    out, i = [], 0
    while i < len(d):
        c = d[i]
        if c not in "MLCZ":
            i += 1
            continue
        if c == "Z":
            out.append("Z")
            i += 1
            continue
        j = i + 1
        while j < len(d) and d[j] not in "MLCZ":
            j += 1
        vals = [float(x) for x in NUMRE.findall(d[i + 1:j])]
        pts = []
        for k in range(0, len(vals), 2):
            pts.append(fmt(scale * vals[k] + offset[0]))
            pts.append(fmt(scale * vals[k + 1] + offset[1]))
        out.append(c + " ".join(pts))
        i = j
    return "".join(out)


def fmt(v):
    v = round(v, 2)
    return str(int(v)) if v == int(v) else str(v)


def _cubic_extrema(p0, p1, p2, p3):
    """Parameters in (0, 1) where a cubic turns, for one coordinate."""
    a = -p0 + 3 * p1 - 3 * p2 + p3
    b = 2 * (p0 - 2 * p1 + p2)
    c = p1 - p0
    if abs(a) < 1e-12:
        if abs(b) < 1e-12:
            return []
        t = -c / b
        return [t] if 0 < t < 1 else []
    disc = b * b - 4 * a * c
    if disc < 0:
        return []
    root = disc ** 0.5
    return [t for t in ((-b + root) / (2 * a), (-b - root) / (2 * a)) if 0 < t < 1]


def _cubic_at(t, p0, p1, p2, p3):
    u = 1 - t
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3


def tight_bbox(paths):
    """The box the artwork actually fills.

    Taking the bounding box of a path's raw coordinates includes the Bezier
    control points, which sit outside the curve they steer - on the lockup that
    left about 3% dead space under the loop. This walks the curves instead and
    solves for where each one turns, so the viewBox ends up flush with the ink.
    """
    xs, ys = [], []
    for d in paths:
        cur = (0.0, 0.0)
        i = 0
        while i < len(d):
            c = d[i]
            if c not in "MLCZ":
                i += 1
                continue
            if c == "Z":
                i += 1
                continue
            j = i + 1
            while j < len(d) and d[j] not in "MLCZ":
                j += 1
            v = [float(x) for x in NUMRE.findall(d[i + 1:j])]
            if c in "ML":
                for k in range(0, len(v), 2):
                    xs.append(v[k])
                    ys.append(v[k + 1])
                    cur = (v[k], v[k + 1])
            else:
                for k in range(0, len(v), 6):
                    x0, y0 = cur
                    x1, y1, x2, y2, x3, y3 = v[k:k + 6]
                    xs += [x0, x3]
                    ys += [y0, y3]
                    for t in _cubic_extrema(x0, x1, x2, x3):
                        xs.append(_cubic_at(t, x0, x1, x2, x3))
                    for t in _cubic_extrema(y0, y1, y2, y3):
                        ys.append(_cubic_at(t, y0, y1, y2, y3))
                    cur = (x3, y3)
            i = j
    return min(xs), min(ys), max(xs), max(ys)


def svg(paths, w, h, background=None):
    lines = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %s %s" '
             'width="%s" height="%s" role="img" aria-label="Ace PE">'
             % (fmt(w), fmt(h), fmt(w), fmt(h))]
    if background:
        lines.append('  <rect width="%s" height="%s" fill="%s"/>'
                     % (fmt(w), fmt(h), background))
    for d, fill in paths:
        lines.append('  <path fill="%s" d="%s"/>' % (fill, d))
    lines.append("</svg>")
    return "\n".join(lines) + "\n"


def write(directory, name, content):
    path = os.path.join(directory, name)
    with open(path, "w") as fh:
        fh.write(content)
    print("  %-36s %6d bytes" % (name, len(content)))
    return path


# --- toolchain --------------------------------------------------------------

def ensure_binaries():
    """Compile the two Swift helpers on first use.

    They exist because this machine has no poppler, mupdf or librsvg: one reads
    glyph outlines and converts CMYK through CoreGraphics, the other rasterises
    the SVGs for the favicon.
    """
    os.makedirs(BIN, exist_ok=True)
    for name in ("pdftool", "svgraster"):
        out = os.path.join(BIN, name)
        src = os.path.join(HERE, name + ".swift")
        if os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(src):
            continue
        print("  compiling %s" % name)
        subprocess.run(["swiftc", "-O", "-o", out, src], check=True)


def raster(svg_path, png_path, size):
    subprocess.run([os.path.join(BIN, "svgraster"), svg_path, png_path, str(size), "1"],
                   check=True, capture_output=True)
    return png_path


def write_ico(path, png_paths):
    """Pack PNGs into a .ico.

    PNG-compressed entries are read by every browser in use and keep the file
    a fraction of the size of the equivalent uncompressed bitmaps.
    """
    images = [open(p, "rb").read() for p in png_paths]
    header = struct.pack("<HHH", 0, 1, len(images))
    offset = len(header) + 16 * len(images)
    entries, body = b"", b""
    for size, data in zip(ICO_SIZES, images):
        entries += struct.pack("<BBBBHHII", size if size < 256 else 0,
                               size if size < 256 else 0, 0, 0, 1, 32,
                               len(data), offset)
        body += data
        offset += len(data)
    with open(path, "wb") as fh:
        fh.write(header + entries + body)
    print("  %-36s %6d bytes  (%s)" % (os.path.basename(path), len(header + entries + body),
                                       ", ".join("%dpx" % s for s in ICO_SIZES)))


COMPONENT_PATH = os.path.join(ROOT, "components", "BrandLockup.tsx")
# The order the shapes come off the page, so each path gets a useful comment.
LOCKUP_SHAPES = ("the loop-A mark", "P", "E", "a", "c", "e")

COMPONENT = '''import type { SVGProps } from "react";

/**
 * The Ace PE lockup: the loop-A mark followed by the wordmark.
 *
 * The artwork is inline rather than an <img> pointing at public/brand, so the
 * header paints the logo with the rest of the markup instead of after a second
 * request - no blank gap on a cold load, and no layout shift. The wordmark is
 * outlined paths, not type, because the lockup is set in FatFrank, which the
 * site does not license or ship.
 *
 * Every path takes `currentColor`, so the colour comes from the `text-*` class
 * on this element or an ancestor. That is what lets one component cover the
 * dark, green and cream versions: `text-brand-ink`, `text-brand-green`, and
 * `text-background` for the reversed one.
 *
 * The viewBox is flush with the ink, so a caller can size and align this
 * without allowing for padding that is not there. It is %(w)s by %(h)s, a
 * ratio of %(aspect).3f to 1 - set one of height or width and let the other be
 * auto.
 *
 * Generated by tools/logo/build.py from the designer's PDF. Rerun that rather
 * than editing the path data by hand.
 */
export default function BrandLockup({
  title = "Ace PE",
  ...props
}: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 %(w)s %(h)s"
      fill="currentColor"
      role="img"
      aria-label={title}
      {...props}
    >
%(paths)s
    </svg>
  );
}
'''


def write_component(paths, w, h):
    body = "\n".join('      {/* %s */}\n      <path d="%s" />' % (name, d)
                     for name, d in zip(LOCKUP_SHAPES, paths))
    source = COMPONENT % {"w": fmt(w), "h": fmt(h), "aspect": w / h, "paths": body}
    with open(COMPONENT_PATH, "w") as fh:
        fh.write(source)
    print("  %-36s %6d bytes" % ("components/BrandLockup.tsx", len(source)))


# --- build ------------------------------------------------------------------

def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    pdf = sys.argv[1]
    if not os.path.exists(pdf):
        sys.exit("source PDF not found: %s" % pdf)

    ensure_binaries()
    load_pdf(pdf)
    os.makedirs(SVG_DIR, exist_ok=True)
    os.makedirs(os.path.join(BIN, "work"), exist_ok=True)

    # -- lockup: page 2, where it sits alone, every shape the same knockout ---
    lock = convert(2)["shapes"]
    assert len(lock) == 6, "expected mark + 5 glyphs on page 2, got %d" % len(lock)
    lx0, ly0, lx1, ly1 = tight_bbox([s["d"] for s in lock])
    LW, LH = lx1 - lx0, ly1 - ly0
    lock_paths = [affine(s["d"], 1.0, (-lx0, -ly0)) for s in lock]
    print("\nlockup  %.2f x %.2f (aspect %.3f)" % (LW, LH, LW / LH))

    for label, ink in (("dark", INK), ("green", GREEN), ("cream", CREAM)):
        write(SVG_DIR, "acepe-lockup-%s.svg" % label,
              svg([(d, ink) for d in lock_paths], LW, LH))

    # Reversed, on a panel. The designer's page is a full A4 sheet and sets no
    # usable margin, so this is a chosen clear space of half the lockup's
    # height on every side.
    pad = LH * 0.5
    padded = [affine(s["d"], 1.0, (-lx0 + pad, -ly0 + pad)) for s in lock]
    for label, bg in (("on-green", GREEN), ("on-dark", INK)):
        write(SVG_DIR, "acepe-lockup-cream-%s.svg" % label,
              svg([(d, CREAM) for d in padded], LW + 2 * pad, LH + 2 * pad,
                  background=bg))

    # -- icon: page 10, the solid disc and the loop knocked out of it ---------
    sheet = convert(10)["shapes"]
    disc, loop = sheet[10], sheet[11]
    dx0, dy0, dx1, dy1 = tight_bbox([disc["d"]])
    D = dx1 - dx0
    cx, cy = (dx0 + dx1) / 2, (dy0 + dy1) / 2
    disc_d = affine(disc["d"], 1.0, (-dx0, -dy0))
    loop_d = affine(loop["d"], 1.0, (-dx0, -dy0))
    loop_box = tight_bbox([loop["d"]])
    mw = loop_box[2] - loop_box[0]
    print("icon    %.2f x %.2f, mark is %.1f%% of the disc" % (D, D, 100 * mw / D))

    for label, (bg, fg) in (("dark", (INK, CREAM)), ("green", (GREEN, CREAM)),
                            ("cream", (CREAM, INK))):
        write(SVG_DIR, "acepe-icon-%s.svg" % label,
              svg([(disc_d, bg), (loop_d, fg)], D, D))

    # The 16px-only variant, with the mark enlarged about the disc's centre.
    grow = SMALL_ICON_MARK_FRACTION * D / mw
    small_loop = affine(loop["d"], grow, (D / 2 - grow * cx, D / 2 - grow * cy))
    small_path = write(SVG_DIR, "acepe-icon-dark-16px.svg",
                       svg([(disc_d, INK), (small_loop, CREAM)], D, D))
    print("        16px variant enlarges the mark to %.0f%% (x%.3f)"
          % (100 * SMALL_ICON_MARK_FRACTION, grow))

    # -- the React component --------------------------------------------------
    # Written from the same paths as the SVGs above, so the header cannot drift
    # out of step with public/brand the way it would if the data were copied by
    # hand once and then left.
    write_component(lock_paths, LW, LH)

    # -- favicon --------------------------------------------------------------
    print("\nfavicon")
    work = os.path.join(BIN, "work")
    pngs = []
    for size in ICO_SIZES:
        source = small_path if size == 16 else os.path.join(SVG_DIR, "acepe-icon-dark.svg")
        pngs.append(raster(source, os.path.join(work, "favicon-%d.png" % size), size))
    write_ico(ICO_PATH, pngs)
    print("\nink %s   green %s   cream %s" % (INK, GREEN, CREAM))


if __name__ == "__main__":
    main()
