"""Convert a page of the Ace PE logo PDF into SVG, with all text outlined.

Only the operators this particular file actually uses are implemented. It is a
logo sheet from Illustrator, so the content streams are small and regular:
filled paths, one clip rectangle per page, and text set with an explicit text
matrix. Anything unrecognised is reported rather than silently skipped, so a
missing operator shows up as a gap in the output instead of a wrong drawing.
"""
import re, zlib, json, subprocess, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
BIN = os.environ.get("LOGO_BIN_DIR", os.path.join(HERE, ".bin"))
PDFTOOL = os.path.join(BIN, "pdftool")

# --- PDF object access ------------------------------------------------------
#
# The source PDF is not in the repo (it is the designer's 2.6 MB Illustrator
# export), so the path is supplied by the caller.

OBJS = {}

def load_pdf(path):
    """Index every top-level object in the file by number."""
    OBJS.clear()
    raw = open(path, "rb").read()
    for m in re.finditer(rb"(?:^|[\r\n>\s])(\d+)\s+0\s+obj\b", raw):
        n = int(m.group(1))
        e = raw.find(b"endobj", m.end())
        OBJS[n] = raw[m.end(): e if e > 0 else len(raw)]
    return OBJS

def stream_of(num):
    body = OBJS.get(num, b"")
    si = body.find(b"stream")
    if si < 0:
        return b""
    p = si + 6
    if body[p:p + 2] == b"\r\n":
        p += 2
    elif body[p:p + 1] in (b"\n", b"\r"):
        p += 1
    raw = body[p:body.find(b"endstream")]
    try:
        return zlib.decompress(raw)
    except Exception:
        return raw

PAGE_OBJS = [56, 1, 4, 7, 10, 13, 21, 24, 27, 30]   # /Kids order, so index = page - 1

# --- colour -----------------------------------------------------------------

_cmyk_cache = {}

def cmyk_hex(c, m, y, k):
    """CMYK to sRGB through CoreGraphics, so the result matches a real render."""
    key = (round(c, 4), round(m, 4), round(y, 4), round(k, 4))
    if key not in _cmyk_cache:
        out = subprocess.run([PDFTOOL, "cmyk", *map(str, key)],
                             capture_output=True, text=True).stdout
        _cmyk_cache[key] = out.strip().split("-> ")[1]
    return _cmyk_cache[key]

def gray_hex(g):
    v = int(round(g * 255))
    return "#%02X%02X%02X" % (v, v, v)

def rgb_hex(r, g, b):
    return "#%02X%02X%02X" % tuple(int(round(v * 255)) for v in (r, g, b))

# --- fonts ------------------------------------------------------------------

# WinAnsiEncoding, only the codes this sheet actually shows.
WINANSI = {ord(ch): nm for ch, nm in {
    "a": "a", "b": "b", "c": "c", "d": "d", "e": "e", "p": "p", "A": "A",
    "E": "E", "P": "P", "C": "C", "space": "space",
}.items() if len(ch) == 1}
WINANSI[32] = "space"

_font_cache = {}

def font_program(font_obj):
    """Return (path-to-font-file, descriptor dict text) for a PDF font object."""
    body = OBJS[font_obj]
    dm = re.search(rb"/FontDescriptor\s+(\d+)\s+0\s+R", body)
    if not dm:
        return None
    desc = OBJS[int(dm.group(1))]
    fm = re.search(rb"/(FontFile\d?)\s+(\d+)\s+0\s+R", desc)
    if not fm:
        return None
    kind, num = fm.group(1).decode(), int(fm.group(2))
    ext = {"FontFile2": "ttf", "FontFile3": "cff", "FontFile": "pfb"}[kind]
    path = os.path.join(BIN, "fonts", "obj%d.%s" % (num, ext))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    if not os.path.exists(path):
        open(path, "wb").write(stream_of(num))
    return path

def glyph_paths(font_obj, names):
    key = (font_obj, tuple(sorted(names)))
    if key in _font_cache:
        return _font_cache[key]
    path = font_program(font_obj)
    out = subprocess.run([PDFTOOL, "glyphs", path, ",".join(sorted(names))],
                         capture_output=True, text=True)
    data = json.loads(out.stdout)
    _font_cache[key] = data
    return data

# --- matrices ---------------------------------------------------------------

def mmul(a, b):
    a0, a1, a2, a3, a4, a5 = a
    b0, b1, b2, b3, b4, b5 = b
    return (a0 * b0 + a1 * b2,       a0 * b1 + a1 * b3,
            a2 * b0 + a3 * b2,       a2 * b1 + a3 * b3,
            a4 * b0 + a5 * b2 + b4,  a4 * b1 + a5 * b3 + b5)

def apply(m, x, y):
    return (m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5])

# --- tokenising -------------------------------------------------------------

TOKEN = re.compile(rb"""
      (?P<num>[-+]?\d*\.?\d+)
    | /(?P<name>[^\s/\[\]<>(){}]+)
    | (?P<str>\((?:\\.|[^()\\])*\))
    | (?P<arr_open>\[) | (?P<arr_close>\])
    | (?P<dict_open><<) | (?P<dict_close>>>)
    | (?P<op>[A-Za-z'"*][A-Za-z0-9'"*]*)
""", re.X | re.S)

def tokenize(s):
    for m in TOKEN.finditer(s):
        k = m.lastgroup
        v = m.group(k)
        if k == "num":
            yield ("num", float(v))
        elif k == "name":
            yield ("name", v.decode("latin-1"))
        elif k == "str":
            yield ("str", v[1:-1])
        elif k == "arr_open":
            yield ("[", None)
        elif k == "arr_close":
            yield ("]", None)
        elif k in ("dict_open", "dict_close"):
            yield ("dict", None)
        else:
            yield ("op", v.decode("latin-1"))

# --- page resources ---------------------------------------------------------

def page_fonts(page_obj):
    """Map the page's font resource names (/T1_0 etc) to font object numbers."""
    body = OBJS[page_obj]
    fm = re.search(rb"/Font\s*<<(.*?)>>", body, re.S)
    if not fm:
        return {}
    return {k.decode(): int(v) for k, v in
            re.findall(rb"/([^\s/]+)\s+(\d+)\s+0\s+R", fm.group(1))}

# --- the converter ----------------------------------------------------------

def convert(page_no, skip_full_page_rects=True):
    """Return a list of {d, fill, kind} shapes in SVG user space (y down)."""
    page_obj = PAGE_OBJS[page_no - 1]
    cm = re.search(rb"/Contents\s+(\d+)\s+0\s+R", OBJS[page_obj])
    content = stream_of(int(cm.group(1)))
    fonts = page_fonts(page_obj)

    media = [float(x) for x in
             re.search(rb"/MediaBox\[([^\]]*)\]", OBJS[page_obj]).group(1).split()]
    page_h = media[3] - media[1]
    # PDF y-up to SVG y-down.
    base = (1, 0, 0, -1, -media[0], media[3])

    ctm = base
    stack = []
    fill = "#000000"
    shapes = []
    seen_ops = set()
    unknown = set()

    # current path, as a list of SVG path commands in device space
    d = []
    start = cur = (0.0, 0.0)

    tm = tlm = (1, 0, 0, 1, 0, 0)
    tf_obj = None
    tfs = 1.0
    tc = tw = 0.0
    th = 1.0
    trise = 0.0

    operands = []
    arr_depth = 0

    def num(i):
        return operands[i]

    def moveto(x, y):
        nonlocal cur, start
        px, py = apply(ctm, x, y)
        d.append("M%.3f %.3f" % (px, py))
        cur = start = (x, y)

    def lineto(x, y):
        nonlocal cur
        px, py = apply(ctm, x, y)
        d.append("L%.3f %.3f" % (px, py))
        cur = (x, y)

    def curveto(x1, y1, x2, y2, x3, y3):
        nonlocal cur
        p1, p2, p3 = apply(ctm, x1, y1), apply(ctm, x2, y2), apply(ctm, x3, y3)
        d.append("C%.3f %.3f %.3f %.3f %.3f %.3f" % (*p1, *p2, *p3))
        cur = (x3, y3)

    def paint(kind, even_odd):
        nonlocal d
        if d:
            path = "".join(d)
            is_page_rect = (len(d) == 5 and kind == "fill")
            if not (skip_full_page_rects and is_page_rect and _covers_page(d, page_h)):
                shapes.append({"d": path, "fill": fill, "kind": kind,
                               "evenOdd": even_odd})
        d = []

    def _covers_page(cmds, h):
        xs, ys = [], []
        for c in cmds:
            nums = re.findall(r"-?\d+\.?\d*", c)
            for i in range(0, len(nums), 2):
                xs.append(float(nums[i])); ys.append(float(nums[i + 1]))
        return (max(xs) - min(xs)) > 800 and (max(ys) - min(ys)) > 560

    def show_text(raw):
        nonlocal tm
        if tf_obj is None:
            return
        codes = unescape(raw)
        names = [WINANSI.get(b) for b in codes]
        wanted = {n for n in names if n}
        if not wanted:
            return
        data = glyph_paths(tf_obj, wanted)
        upem = data["unitsPerEm"]
        for b, nm in zip(codes, names):
            g = data["glyphs"].get(nm, {})
            gp = g.get("path")
            adv = g.get("advance", 0.0)
            if gp:
                trm = mmul((tfs * th, 0, 0, tfs, 0, trise), mmul(tm, ctm))
                scale = 1.0 / upem
                full = mmul((scale, 0, 0, scale, 0, 0), trm)
                shapes.append({"d": xform_path(gp, full), "fill": fill,
                               "kind": "fill", "evenOdd": False, "glyph": nm})
            w0 = adv / upem
            tx = (w0 * tfs + tc + (tw if b == 32 else 0)) * th
            tm = mmul((1, 0, 0, 1, tx, 0), tm)

    for kind, val in tokenize(content):
        if kind == "num":
            operands.append(val); continue
        if kind == "name":
            operands.append(val); continue
        if kind == "str":
            operands.append(val); continue
        if kind == "[":
            arr_depth += 1; operands.append("["); continue
        if kind == "]":
            arr_depth -= 1; operands.append("]"); continue
        if kind == "dict":
            operands = []; continue

        op = val
        seen_ops.add(op)
        try:
            if op == "q":
                stack.append((ctm, fill))
            elif op == "Q":
                if stack:
                    ctm, fill = stack.pop()
            elif op == "cm":
                ctm = mmul(tuple(operands[-6:]), ctm)
            elif op == "m":
                moveto(num(-2), num(-1))
            elif op == "l":
                lineto(num(-2), num(-1))
            elif op == "c":
                curveto(*operands[-6:])
            elif op == "v":
                x2, y2, x3, y3 = operands[-4:]
                curveto(cur[0], cur[1], x2, y2, x3, y3)
            elif op == "y":
                x1, y1, x3, y3 = operands[-4:]
                curveto(x1, y1, x3, y3, x3, y3)
            elif op == "h":
                d.append("Z"); cur = start
            elif op == "re":
                x, y, w, h = operands[-4:]
                moveto(x, y); lineto(x + w, y); lineto(x + w, y + h)
                lineto(x, y + h); d.append("Z")
            elif op in ("f", "F", "f*"):
                paint("fill", op == "f*")
            elif op in ("B", "B*", "b", "b*"):
                paint("fill", op.endswith("*"))
            elif op in ("S", "s"):
                paint("stroke", False)
            elif op == "n":
                d = []
            elif op in ("W", "W*"):
                pass                      # clip: this sheet only clips to the page
            elif op == "k":
                fill = cmyk_hex(*operands[-4:])
            elif op == "K":
                pass
            elif op == "g":
                fill = gray_hex(num(-1))
            elif op == "rg":
                fill = rgb_hex(*operands[-3:])
            elif op == "sc" or op == "scn":
                vals = [o for o in operands if isinstance(o, float)]
                if len(vals) == 4: fill = cmyk_hex(*vals[-4:])
                elif len(vals) == 3: fill = rgb_hex(*vals[-3:])
                elif len(vals) == 1: fill = gray_hex(vals[-1])
            elif op == "BT":
                tm = tlm = (1, 0, 0, 1, 0, 0)
            elif op == "ET":
                pass
            elif op == "Tf":
                tf_obj = fonts.get(operands[-2]) if len(operands) >= 2 else None
                tfs = num(-1)
            elif op == "Tm":
                tm = tlm = tuple(operands[-6:])
            elif op in ("Td", "TD"):
                tlm = mmul((1, 0, 0, 1, num(-2), num(-1)), tlm)
                tm = tlm
            elif op == "T*":
                tlm = mmul((1, 0, 0, 1, 0, 0), tlm); tm = tlm
            elif op == "Tj":
                show_text(operands[-1])
            elif op == "TJ":
                for o in operands:
                    if isinstance(o, bytes):
                        show_text(o)
                    elif isinstance(o, float):
                        tm = mmul((1, 0, 0, 1, -o / 1000 * tfs * th, 0), tm)
            elif op in ("Tc",):
                tc = num(-1)
            elif op in ("Tw",):
                tw = num(-1)
            elif op == "Tz":
                th = num(-1) / 100.0
            elif op == "Ts":
                trise = num(-1)
            elif op in ("gs", "Do", "BDC", "EMC", "BMC", "cs", "CS", "w", "J",
                        "j", "M", "ri", "i", "d", "TL", "sh", "BX", "EX", "MP",
                        "DP", "SCN", "SC"):
                pass
            else:
                unknown.add(op)
        except Exception as exc:
            unknown.add("%s(%s)" % (op, exc))
        operands = []

    return {"shapes": shapes, "ops": sorted(seen_ops), "unknown": sorted(unknown),
            "pageSize": (media[2] - media[0], media[3] - media[1])}

ESC = {b"n": b"\n", b"r": b"\r", b"t": b"\t", b"b": b"\b", b"f": b"\f",
       b"(": b"(", b")": b")", b"\\": b"\\"}

def unescape(s):
    out = bytearray(); i = 0
    while i < len(s):
        if s[i:i + 1] == b"\\" and i + 1 < len(s):
            nxt = s[i + 1:i + 2]
            if nxt in ESC:
                out += ESC[nxt]; i += 2; continue
            if nxt.isdigit():
                j = i + 1; oct_ = b""
                while j < len(s) and len(oct_) < 3 and s[j:j + 1].isdigit():
                    oct_ += s[j:j + 1]; j += 1
                out.append(int(oct_, 8)); i = j; continue
            i += 2; continue
        out += s[i:i + 1]; i += 1
    return bytes(out)

NUMRE = re.compile(r"-?\d*\.?\d+")

def xform_path(dstr, m):
    """Re-express an SVG path (font units, y-up) under a matrix, y already flipped."""
    out = []
    i = 0
    while i < len(dstr):
        c = dstr[i]
        if c in "MLCQZ":
            if c == "Z":
                out.append("Z"); i += 1; continue
            j = i + 1
            while j < len(dstr) and dstr[j] not in "MLCQZ":
                j += 1
            nums = [float(x) for x in NUMRE.findall(dstr[i + 1:j])]
            pts = []
            for k in range(0, len(nums), 2):
                pts.extend("%.3f" % v for v in apply(m, nums[k], nums[k + 1]))
            out.append(c + " ".join(pts))
            i = j
        else:
            i += 1
    return "".join(out)

def bbox_of(shapes):
    xs, ys = [], []
    for s in shapes:
        nums = [float(x) for x in NUMRE.findall(s["d"])]
        for k in range(0, len(nums) - 1, 2):
            xs.append(nums[k]); ys.append(nums[k + 1])
    return min(xs), min(ys), max(xs), max(ys)
