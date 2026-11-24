"""Scrappy photobooth: 2008 gal / purikura assets drawn in code.

Writes to public/booth/:
  tile-roses.png    soft pink rose wallpaper for the machine body (seamless)
  tile-zebra.png    zebra print band (seamless)
  tile-leopard.png  pink leopard print (seamless)
  gal/<id>.png      glossy decoration stickers (256 px, transparent)

Everything is drawn at 4x and scaled down so edges are smooth, like the glossy
stamps on a real purikura machine. Run:  python3 scripts/draw-booth-gyaru.py
"""
import math
import os
import random
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

OUT = sys.argv[1] if len(sys.argv) > 1 else 'public/booth'
os.makedirs(f'{OUT}/gal', exist_ok=True)
SS = 4
SERIF = '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'
SANS = '/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf'

PINK = (255, 79, 163); HOT = (226, 0, 122); BUB = (255, 182, 217); PALE = (255, 228, 241)
PLUM = (58, 0, 48); LIL = (201, 166, 255); PUR = (150, 70, 220); W = (255, 255, 255)
GOLD = (222, 170, 60); TAN = (214, 160, 90); BROWN = (70, 40, 20); SILVER = (205, 210, 222)


def rng(seed):
    return random.Random(seed)


# ───────────────────────── fills ─────────────────────────
def leopard(size, base=(232, 180, 110), spot=(70, 40, 20), inner=(200, 130, 70), seed=1, scale=1.0):
    """leopard rosettes, seamless on a torus"""
    w, h = size
    im = Image.new('RGB', size, base)
    d = ImageDraw.Draw(im)
    r = rng(seed)
    n = int(w * h / (2600 * scale * scale))
    for _ in range(n):
        cx, cy = r.uniform(0, w), r.uniform(0, h)
        rad = r.uniform(14, 24) * scale
        for ox in (-w, 0, w):
            for oy in (-h, 0, h):
                x, y = cx + ox, cy + oy
                d.ellipse([x - rad * .55, y - rad * .45, x + rad * .55, y + rad * .45], fill=inner)
                # broken ring of 4-5 blobs
                k = r.randint(3, 5)
                a0 = r.uniform(0, 6.28)
                for i in range(k):
                    a = a0 + i * 6.28 / k + r.uniform(-.3, .3)
                    bx, by = x + math.cos(a) * rad * .72, y + math.sin(a) * rad * .62
                    br = rad * r.uniform(.22, .34)
                    d.ellipse([bx - br, by - br * .8, bx + br, by + br * .8], fill=spot)
    return im


def zebra(size, a=W, b=(20, 14, 20), seed=2, period=None):
    """wavy zebra stripes, seamless horizontally (period divides width) and vertically"""
    w, h = size
    im = Image.new('RGB', size, a)
    px = im.load()
    r = rng(seed)
    ph = [r.uniform(0, 6.28) for _ in range(4)]
    for y in range(h):
        for x in range(w):
            u = x / w * 6.2832
            v = y / h * 6.2832
            t = (math.sin(u * 9 + 1.6 * math.sin(v * 2 + ph[0]) + .8 * math.sin(v * 3 + u + ph[1]))
                 + .35 * math.sin(v * 5 + ph[2]) * math.cos(u * 2 + ph[3]))
            if t > .25:
                px[x, y] = b
    return im


def glitter(size, base, seed=3, dens=.08, lo=-60, hi=90):
    w, h = size
    im = Image.new('RGB', size, base)
    px = im.load()
    r = rng(seed)
    for _ in range(int(w * h * dens)):
        x, y = r.randrange(w), r.randrange(h)
        k = r.randint(lo, hi)
        c = px[x, y]
        px[x, y] = tuple(max(0, min(255, v + k)) for v in c)
    return im


def fill_mask(mask, tex):
    """paint a texture through an L mask (tiles the texture if needed)"""
    out = Image.new('RGBA', mask.size, (0, 0, 0, 0))
    if tex.size != mask.size:
        t = Image.new('RGB', mask.size)
        for x in range(0, mask.size[0], tex.size[0]):
            for y in range(0, mask.size[1], tex.size[1]):
                t.paste(tex, (x, y))
        tex = t
    out.paste(tex.convert('RGBA'), (0, 0), mask)
    return out


def outline(mask, px, color):
    big = mask.filter(ImageFilter.MaxFilter(px * 2 + 1)) if px > 0 else mask
    layer = Image.new('RGBA', mask.size, color + (0,))
    layer.putalpha(big)
    return layer


def gloss(mask, strength=150, top=.45):
    """white highlight on the upper part of a shape"""
    w, h = mask.size
    g = Image.new('L', (w, h), 0)
    gd = ImageDraw.Draw(g)
    bb = mask.getbbox() or (0, 0, w, h)
    x0, y0, x1, y1 = bb
    gd.ellipse([x0 + (x1 - x0) * .12, y0 + (y1 - y0) * .04, x1 - (x1 - x0) * .25, y0 + (y1 - y0) * top], fill=strength)
    g = g.filter(ImageFilter.GaussianBlur(w / 60))
    g = ImageChops.multiply(g, mask)
    layer = Image.new('RGBA', (w, h), W + (0,))
    layer.putalpha(g)
    return layer


def sparkle(d, x, y, r, color=W, thin=.12):
    d.polygon([(x, y - r), (x + r * thin, y - r * thin), (x + r, y), (x + r * thin, y + r * thin),
               (x, y + r), (x - r * thin, y + r * thin), (x - r, y), (x - r * thin, y - r * thin)], fill=color)


def rhinestone(im, x, y, r, color=W):
    d = ImageDraw.Draw(im)
    d.ellipse([x - r, y - r, x + r, y + r], fill=(150, 150, 165))
    d.ellipse([x - r * .82, y - r * .82, x + r * .82, y + r * .82], fill=color)
    # facets
    d.polygon([(x, y - r * .8), (x + r * .5, y), (x, y + r * .8), (x - r * .5, y)], fill=tuple(min(255, c + 30) for c in color))
    d.ellipse([x - r * .45, y - r * .55, x - r * .05, y - r * .15], fill=W)


class C:
    """a 1024 canvas that saves as a 256 sticker with a white die-cut halo"""
    def __init__(self):
        self.S = 256 * SS
        self.im = Image.new('RGBA', (self.S, self.S), (0, 0, 0, 0))

    def add(self, layer):
        self.im.alpha_composite(layer)

    def save(self, name, halo=7):
        a = self.im.getchannel('A').point(lambda v: 255 if v > 30 else 0)
        cut = a.filter(ImageFilter.MaxFilter(halo * SS * 2 + 1)).filter(ImageFilter.GaussianBlur(SS))
        base = Image.new('RGBA', self.im.size, W + (0,))
        base.putalpha(cut)
        shadow = Image.new('RGBA', self.im.size, (90, 0, 60, 0))
        shadow.putalpha(cut.point(lambda v: v * .35).filter(ImageFilter.GaussianBlur(4 * SS)))
        out = Image.new('RGBA', self.im.size, (0, 0, 0, 0))
        out.alpha_composite(shadow, (0, 3 * SS))
        out.alpha_composite(base)
        out.alpha_composite(self.im)
        out = out.crop(out.getbbox())
        k = 240 * SS / max(out.size)
        out = out.resize((max(1, int(out.width * k / SS)), max(1, int(out.height * k / SS))), Image.Resampling.LANCZOS)
        out.save(f'{OUT}/gal/{name}.png', optimize=True)
        return out


def mask_new(S):
    return Image.new('L', (S, S), 0)


# ───────────────────────── stickers ─────────────────────────
def heart_poly(cx, cy, s, n=120):
    pts = []
    for i in range(n):
        t = i / n * 6.2832
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((cx + x * s, cy - y * s))
    return pts


def lips():
    c = C(); S = c.S
    m = mask_new(S); d = ImageDraw.Draw(m)
    # upper lip: two bumps; lower lip: wide half ellipse
    pts = []
    for i in range(61):
        t = i / 60
        x = 120 + t * 784
        y = 470 - 120 * math.sin(t * math.pi) ** .8 + 60 * math.exp(-((t - .5) ** 2) / .004)
        pts.append((x, y))
    for i in range(61):
        t = 1 - i / 60
        x = 120 + t * 784
        y = 480 + 230 * math.sin(t * math.pi) ** .9
        pts.append((x, y))
    d.polygon(pts, fill=255)
    m = m.filter(ImageFilter.GaussianBlur(6))
    tex = glitter((S, S), (205, 20, 130), seed=5, dens=.25, lo=-70, hi=110)
    c.add(fill_mask(m, tex))
    # mouth line
    ln = Image.new('RGBA', (S, S), (0, 0, 0, 0)); ld = ImageDraw.Draw(ln)
    ld.line([(150, 478), (350, 500), (512, 485), (680, 500), (880, 478)], fill=(110, 0, 60, 255), width=16, joint='curve')
    c.add(ln)
    hl = Image.new('RGBA', (S, S), (0, 0, 0, 0)); hd = ImageDraw.Draw(hl)
    hd.ellipse([330, 560, 690, 640], fill=(255, 255, 255, 150)); hd.ellipse([250, 380, 400, 430], fill=(255, 255, 255, 120))
    c.add(hl.filter(ImageFilter.GaussianBlur(14)))
    return c.save('lips')


def leopard_text(text, name, font=SERIF, size=360, heart=None, sparkles=False, tex=None):
    c = C(); S = c.S
    f = ImageFont.truetype(font, size)
    m = mask_new(S); d = ImageDraw.Draw(m)
    lines = text.split('\n')
    y = S / 2 - (len(lines) * size * .95) / 2
    boxes = []
    for ln in lines:
        bw = d.textlength(ln, font=f)
        d.text(((S - bw) / 2, y), ln, font=f, fill=255)
        boxes.append(((S - bw) / 2, y, bw))
        y += size * .95
    tex = tex or leopard((S, S), seed=sum(map(ord, name)), scale=3)
    c.add(outline(m, 10, PLUM))
    c.add(fill_mask(m, tex))
    if heart:
        x0, y0, bw = boxes[0]
        hm = mask_new(S); ImageDraw.Draw(hm).polygon(heart_poly(*heart), fill=255)
        c.add(outline(hm, 0, (255, 140, 200)))
        c.add(gloss(hm, 120))
    if sparkles:
        sd = ImageDraw.Draw(c.im)
        for (x, y, r) in [(120, 230, 70), (900, 300, 60), (880, 780, 80), (150, 800, 50)]:
            sparkle(sd, x, y, r, HOT + (255,), .16)
    return c.save(name)


def tiara():
    c = C(); S = c.S
    d = ImageDraw.Draw(c.im)
    # band
    d.rounded_rectangle([140, 640, 884, 700], 30, fill=SILVER + (255,), outline=(140, 140, 160, 255), width=8)
    # arches
    pts = []
    for i in range(201):
        t = i / 200
        x = 160 + t * 704
        y = 640 - (180 + 170 * math.cos((t - .5) * math.pi)) * abs(math.sin(t * math.pi * 3)) ** .6
        pts.append((x, y))
    d.line(pts, fill=(160, 160, 178, 255), width=26, joint='curve')
    d.line(pts, fill=SILVER + (255,), width=14, joint='curve')
    for i, t in enumerate([i / 18 for i in range(19)]):
        x = 160 + t * 704
        rhinestone(c.im, x, 670, 22)
    # centre heart gem
    hm = mask_new(S); ImageDraw.Draw(hm).polygon(heart_poly(512, 470, 7.2), fill=255)
    c.add(outline(hm, 12, (200, 200, 215)))
    c.add(fill_mask(hm, Image.new('RGB', (S, S), (255, 90, 170))))
    c.add(gloss(hm, 190))
    for x, y in [(330, 470), (694, 470), (230, 560), (794, 560)]:
        rhinestone(c.im, x, y, 30, (255, 170, 210))
    return c.save('tiara')


def rhinestone_heart():
    c = C(); S = c.S
    pts = heart_poly(512, 500, 26, n=34)
    for i, (x, y) in enumerate(pts):
        rhinestone(c.im, x, y, 40 if i % 2 == 0 else 32)
    return c.save('rhinestone-heart', halo=6)


def zebra_note():
    c = C(); S = c.S
    m = mask_new(S); d = ImageDraw.Draw(m)
    # two note heads (hearts) + stems + beam
    for cx in (330, 700):
        d.polygon(heart_poly(cx, 720, 8.2), fill=255)
    d.rectangle([400, 220, 450, 700], fill=255)
    d.rectangle([770, 220, 820, 700], fill=255)
    d.polygon([(400, 200), (820, 200), (820, 320), (400, 320)], fill=255)
    z = zebra((S // 4, S // 4), a=(230, 120, 255), b=(60, 0, 80), seed=7).resize((S, S))
    c.add(outline(m, 12, PLUM))
    c.add(fill_mask(m, z))
    c.add(gloss(m, 110, .3))
    return c.save('zebra-note')


def leopard_hibiscus():
    c = C(); S = c.S
    m = mask_new(S); d = ImageDraw.Draw(m)
    for i in range(5):
        a = -math.pi / 2 + i * 2 * math.pi / 5
        x, y = 512 + math.cos(a) * 230, 512 + math.sin(a) * 230
        d.ellipse([x - 200, y - 200, x + 200, y + 200], fill=255)
    tex = leopard((S, S), base=(255, 120, 190), spot=(110, 0, 70), inner=(230, 70, 150), seed=11, scale=2.6)
    c.add(outline(m, 10, (110, 0, 70)))
    c.add(fill_mask(m, tex))
    d2 = ImageDraw.Draw(c.im)
    d2.ellipse([450, 450, 574, 574], fill=(255, 230, 120, 255), outline=(150, 0, 80, 255), width=10)
    for i in range(5):
        a = -math.pi / 2 + i * 2 * math.pi / 5 + .6
        d2.line([(512, 512), (512 + math.cos(a) * 160, 512 + math.sin(a) * 160)], fill=(150, 0, 80, 255), width=10)
        x, y = 512 + math.cos(a) * 170, 512 + math.sin(a) * 170
        d2.ellipse([x - 20, y - 20, x + 20, y + 20], fill=(255, 230, 120, 255))
    return c.save('leopard-hibiscus')


def star_poly(cx, cy, r, ri=.45, rot=-90):
    pts = []
    for i in range(10):
        a = math.radians(rot + i * 36)
        rr = r if i % 2 == 0 else r * ri
        pts.append((cx + math.cos(a) * rr, cy + math.sin(a) * rr))
    return pts


def zebra_stars():
    c = C(); S = c.S
    m = mask_new(S); d = ImageDraw.Draw(m)
    for (x, y, r, rot) in [(360, 360, 260, -80), (720, 330, 170, -100), (620, 720, 230, -95)]:
        d.polygon(star_poly(x, y, r, rot=rot), fill=255)
    z = zebra((S // 4, S // 4), a=(255, 140, 200), b=(20, 10, 20), seed=9).resize((S, S))
    c.add(outline(m, 12, PLUM))
    c.add(fill_mask(m, z))
    c.add(gloss(m, 90, .35))
    return c.save('zebra-stars')


def diamond_heart():
    c = C(); S = c.S
    m = mask_new(S); ImageDraw.Draw(m).polygon(heart_poly(512, 520, 25), fill=255)
    base = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    bd = ImageDraw.Draw(base)
    # faceted: a fan of triangles from the centre in alternating pinks
    cx, cy = 512, 470
    pts = heart_poly(512, 520, 25, n=24)
    shades = [(255, 120, 180), (255, 170, 210), (230, 60, 140), (255, 200, 225), (245, 95, 165)]
    for i in range(len(pts)):
        p1, p2 = pts[i], pts[(i + 1) % len(pts)]
        bd.polygon([(cx, cy), p1, p2], fill=shades[i % len(shades)] + (255,))
    bd.polygon(heart_poly(512, 500, 12), fill=(255, 210, 232, 255))
    c.add(outline(m, 12, (170, 20, 100)))
    clipped = Image.new('RGBA', (S, S), (0, 0, 0, 0)); clipped.paste(base, (0, 0), m)
    c.add(clipped)
    c.add(gloss(m, 200, .35))
    sd = ImageDraw.Draw(c.im)
    sparkle(sd, 330, 300, 90); sparkle(sd, 760, 640, 60)
    return c.save('diamond-heart')


def glitter_butterfly():
    c = C(); S = c.S
    m = mask_new(S); d = ImageDraw.Draw(m)
    d.ellipse([120, 180, 500, 560], fill=255); d.ellipse([524, 180, 904, 560], fill=255)
    d.ellipse([200, 500, 480, 820], fill=255); d.ellipse([544, 500, 824, 820], fill=255)
    tex = glitter((S, S), (215, 215, 228), seed=13, dens=.35, lo=-80, hi=60)
    c.add(outline(m, 14, (230, 80, 160)))
    c.add(fill_mask(m, tex))
    inner = mask_new(S); di = ImageDraw.Draw(inner)
    di.ellipse([200, 260, 440, 500], fill=255); di.ellipse([584, 260, 824, 500], fill=255)
    c.add(fill_mask(inner.filter(ImageFilter.GaussianBlur(10)), glitter((S, S), (255, 150, 200), seed=14, dens=.3)))
    d2 = ImageDraw.Draw(c.im)
    d2.rounded_rectangle([490, 230, 534, 800], 22, fill=(120, 0, 70, 255))
    d2.line([(512, 240), (420, 110)], fill=(120, 0, 70, 255), width=12); d2.line([(512, 240), (604, 110)], fill=(120, 0, 70, 255), width=12)
    d2.ellipse([400, 90, 440, 130], fill=(255, 90, 170, 255)); d2.ellipse([584, 90, 624, 130], fill=(255, 90, 170, 255))
    return c.save('glitter-butterfly')


def ribbon_bow():
    c = C(); S = c.S
    m = mask_new(S); d = ImageDraw.Draw(m)
    d.polygon([(512, 470), (130, 250), (100, 640)], fill=255)
    d.polygon([(512, 470), (894, 250), (924, 640)], fill=255)
    d.polygon([(470, 500), (330, 880), (440, 840), (500, 900), (520, 520)], fill=255)
    d.polygon([(554, 500), (694, 880), (584, 840), (524, 900), (504, 520)], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(8)).point(lambda v: 255 if v > 120 else 0)
    tex = leopard((S, S), base=(255, 150, 205), spot=(60, 10, 50), inner=(240, 100, 170), seed=17, scale=2.6)
    c.add(outline(m, 12, PLUM))
    c.add(fill_mask(m, tex))
    c.add(gloss(m, 110, .4))
    k = mask_new(S); ImageDraw.Draw(k).rounded_rectangle([430, 400, 594, 560], 50, fill=255)
    c.add(outline(k, 10, PLUM)); c.add(fill_mask(k, Image.new('RGB', (S, S), (255, 79, 163)))); c.add(gloss(k, 170))
    for x, y in [(240, 330), (300, 520), (784, 330), (724, 520)]:
        rhinestone(c.im, x, y, 26)
    return c.save('leopard-bow')


def flare(name, color, rays=4, rot=0, halo=True, twin=False):
    """the soft 'kira' light flares from the brushes tab"""
    c = C(); S = c.S
    L = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(L)
    cx = cy = S / 2
    if halo:
        g = Image.new('L', (S, S), 0); ImageDraw.Draw(g).ellipse([cx - 230, cy - 230, cx + 230, cy + 230], fill=170)
        g = g.filter(ImageFilter.GaussianBlur(70))
        hl = Image.new('RGBA', (S, S), color + (0,)); hl.putalpha(g); L.alpha_composite(hl)
    for i in range(rays):
        a = math.radians(rot + i * 180 / rays)
        long = 470 if i % 2 == 0 else 300
        for wdt, alpha, col in [(46, 90, color), (20, 200, color), (8, 255, W)]:
            ray = Image.new('L', (S, S), 0)
            rd = ImageDraw.Draw(ray)
            dx, dy = math.cos(a) * long, math.sin(a) * long
            nx, ny = -math.sin(a) * wdt, math.cos(a) * wdt
            rd.polygon([(cx - dx, cy - dy), (cx + nx, cy + ny), (cx + dx, cy + dy), (cx - nx, cy - ny)], fill=alpha)
            ray = ray.filter(ImageFilter.GaussianBlur(wdt / 4 + 2))
            lay = Image.new('RGBA', (S, S), col + (0,)); lay.putalpha(ray); L.alpha_composite(lay)
    core = Image.new('L', (S, S), 0); ImageDraw.Draw(core).ellipse([cx - 60, cy - 60, cx + 60, cy + 60], fill=255)
    core = core.filter(ImageFilter.GaussianBlur(22))
    lay = Image.new('RGBA', (S, S), W + (0,)); lay.putalpha(core); L.alpha_composite(lay)
    if twin:
        small = L.resize((S // 3, S // 3), Image.Resampling.LANCZOS)
        L.alpha_composite(small, (S - S // 3 - 40, 40))
    c.im = L
    # flares have no die-cut: they're light
    a = L.getchannel('A')
    out = L.crop(a.getbbox()).resize((240, 240), Image.Resampling.LANCZOS)
    out.save(f'{OUT}/gal/{name}.png', optimize=True)
    return out


def xoxo():
    c = C(); S = c.S
    f = ImageFont.truetype(SANS, 330)
    m = mask_new(S); d = ImageDraw.Draw(m)
    bw = d.textlength('xoxo', font=f)
    d.text(((S - bw) / 2, 300), 'xoxo', font=f, fill=255)
    c.add(outline(m, 16, PLUM))
    c.add(outline(m, 8, W))
    c.add(fill_mask(m, glitter((S, S), (255, 79, 163), seed=21, dens=.3, lo=-70, hi=120)))
    c.add(gloss(m, 120, .55))
    return c.save('xoxo')


# ───────────────────────── tiles ─────────────────────────
def roses_tile(n=512):
    """soft pink roses (seamless): layered petals, low contrast, slightly blurred"""
    im = Image.new('RGB', (n, n), (255, 214, 232))
    r = rng(31)
    spots = [(r.uniform(0, n), r.uniform(0, n), r.uniform(60, 95)) for _ in range(9)]
    for (cx, cy, R) in spots:
        for ox in (-n, 0, n):
            for oy in (-n, 0, n):
                x0, y0 = cx + ox, cy + oy
                if x0 + R < 0 or y0 + R < 0 or x0 - R > n or y0 - R > n:
                    continue
                L = Image.new('RGBA', (n, n), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
                # outer petals → inner swirl
                layers = 7
                for k in range(layers):
                    rr = R * (1 - k / (layers + 1))
                    shade = 236 - k * 9
                    col = (255, max(120, shade - 40), max(160, shade - 10), 255)
                    petals = 6 - k // 2
                    rot = r.uniform(0, 6.28)
                    for p in range(max(3, petals)):
                        a = rot + p * 6.28 / max(3, petals)
                        px, py = x0 + math.cos(a) * rr * .35, y0 + math.sin(a) * rr * .35
                        d.ellipse([px - rr * .7, py - rr * .6, px + rr * .7, py + rr * .6], fill=col,
                                  outline=(240, 140, 185, 255), width=2)
                d.arc([x0 - R * .25, y0 - R * .25, x0 + R * .25, y0 + R * .25], 0, 300, fill=(220, 100, 160, 255), width=3)
                im.paste(L.filter(ImageFilter.GaussianBlur(1.2)), (0, 0), L)
    # lace dots
    d = ImageDraw.Draw(im)
    for _ in range(140):
        x, y = r.uniform(0, n), r.uniform(0, n)
        d.ellipse([x - 2.5, y - 2.5, x + 2.5, y + 2.5], fill=(255, 245, 250))
    im = im.filter(ImageFilter.GaussianBlur(.6))
    im.save(f'{OUT}/tile-roses.png', optimize=True)


def main():
    roses_tile()
    zebra((192, 96), seed=4).save(f'{OUT}/tile-zebra.png', optimize=True)
    leopard((256, 256), base=(255, 170, 210), spot=(80, 10, 60), inner=(240, 120, 180), seed=6).save(f'{OUT}/tile-leopard.png', optimize=True)
    lips()
    leopard_text('LO\nVE', 'leopard-love', size=330, heart=(700, 330, 9))
    leopard_text('KIRA\nKIRA', 'kira-kira', font=SANS, size=250, sparkles=True)
    leopard_text('BFF', 'leopard-bff', font=SANS, size=300, tex=leopard((1024, 1024), base=(255, 150, 205), spot=(60, 10, 50), inner=(240, 100, 170), seed=19, scale=2.8))
    tiara()
    rhinestone_heart()
    zebra_note()
    leopard_hibiscus()
    zebra_stars()
    diamond_heart()
    glitter_butterfly()
    ribbon_bow()
    xoxo()
    flare('flare-pink', (255, 90, 180))
    flare('flare-white', (255, 255, 255), rays=4, rot=45)
    flare('flare-cross', (255, 140, 210), rays=2, rot=45, twin=True)
    flare('flare-lilac', (190, 140, 255), rays=6, rot=15)


if __name__ == '__main__':
    main()
