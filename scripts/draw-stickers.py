"""Scrappy object shelf: 45 Y2K pixel-art stickers drawn in code.
Each is drawn as flat 2D clip-art, then turned into a ~36 px sprite: colours snapped to
the sticker's own flat fills, 1 px plum outline, white die-cut, hard-edged upscale.

  python3 draw_stickers.py <repo>/public/assets/scrappy
Writes full/<id>.webp (≤256 px) and thumbs/<id>.webp (≤128 px) and prints a JSON manifest."""
import math, os, sys, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUT = sys.argv[1] if len(sys.argv) > 1 else 'out'
os.makedirs(f'{OUT}/full', exist_ok=True); os.makedirs(f'{OUT}/thumbs', exist_ok=True)

S = 4                      # supersample
L = 256                    # logical canvas
OW = 6                     # outline width (logical)
PLUM = (74, 12, 58); W = (255, 255, 255)
PINK = (255, 92, 168); HOT = (232, 30, 130); BUB = (255, 182, 217); LIL = (196, 160, 255)
PUR = (140, 90, 220); SKY = (120, 200, 255); BLUE = (70, 140, 235); AQUA = (90, 225, 215)
MINT = (150, 235, 190); SUN = (255, 214, 64); ORA = (255, 150, 50); RED = (235, 50, 70)
CREAM = (255, 248, 225); GREY = (190, 196, 210); DGREY = (110, 116, 135); BROWN = (170, 110, 60)
GOLD = (240, 190, 60); PEACH = (255, 210, 180); GREEN = (90, 200, 90)


class C:
    def __init__(self):
        self.im = Image.new('RGBA', (L * S, L * S), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.im)

    def _p(self, pts): return [(x * S, y * S) for x, y in pts]
    def _b(self, b): return [b[0] * S, b[1] * S, b[2] * S, b[3] * S]

    def poly(self, pts, fill, ow=OW):
        self.d.polygon(self._p(pts), fill=fill, outline=PLUM if ow else None, width=int(ow * S) if ow else 0)
    def ell(self, b, fill, ow=OW):
        self.d.ellipse(self._b(b), fill=fill, outline=PLUM if ow else None, width=int(ow * S) if ow else 0)
    def rr(self, b, r, fill, ow=OW):
        self.d.rounded_rectangle(self._b(b), r * S, fill=fill, outline=PLUM if ow else None, width=int(ow * S) if ow else 0)
    def line(self, pts, w=OW, col=PLUM):
        self.d.line(self._p(pts), fill=col, width=int(w * S), joint='curve')
        for x, y in pts[:1] + pts[-1:]:
            r = w / 2; self.d.ellipse(self._b([x - r, y - r, x + r, y + r]), fill=col)
    def arc(self, b, a0, a1, w=OW, col=PLUM):
        self.d.arc(self._b(b), a0, a1, fill=col, width=int(w * S))
    def hi(self, b):  # white highlight blob
        self.d.ellipse(self._b(b), fill=W)
    def dot(self, x, y, r, col=PLUM):
        self.d.ellipse(self._b([x - r, y - r, x + r, y + r]), fill=col)


def star(cx, cy, ro, ri, n=5, rot=-90):
    return [(cx + (ro if i % 2 == 0 else ri) * math.cos(math.radians(rot + i * 180 / n)),
             cy + (ro if i % 2 == 0 else ri) * math.sin(math.radians(rot + i * 180 / n))) for i in range(n * 2)]


def heart_pts(cx, cy, s, steps=60):
    pts = []
    for i in range(steps):
        t = 2 * math.pi * i / steps
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((cx + x * s, cy - y * s))
    return pts


def face(c, cx, cy, sc=1.0, cheeks=True):
    c.dot(cx - 18 * sc, cy, 5 * sc); c.dot(cx + 18 * sc, cy, 5 * sc)
    c.dot(cx - 16 * sc, cy - 2 * sc, 1.6 * sc, W); c.dot(cx + 20 * sc, cy - 2 * sc, 1.6 * sc, W)
    c.arc([cx - 8 * sc, cy, cx + 8 * sc, cy + 12 * sc], 20, 160, 3.5 * sc)
    if cheeks:
        c.ell([cx - 34 * sc, cy + 6 * sc, cx - 22 * sc, cy + 14 * sc], (255, 140, 180), 0)
        c.ell([cx + 22 * sc, cy + 6 * sc, cx + 34 * sc, cy + 14 * sc], (255, 140, 180), 0)


def facets(c, pts, cx, cy, w=3):
    for x, y in pts[::2] if len(pts) > 8 else pts:
        c.line([(cx, cy), (x, y)], w, (*PLUM, ))


# ----------------------------------------------------------------- GEMS
def gem_heart(c):
    pts = heart_pts(128, 132, 6.2); c.poly(pts, PINK)
    inner = heart_pts(128, 128, 3.4); c.poly(inner, (255, 140, 195), 3)
    for x, y in [(70, 92), (186, 92), (128, 210), (128, 70)]: c.line([(128, 128), (x, y)], 3)
    c.hi([86, 84, 104, 98])

def gem_diamond(c):
    top = [(70, 96), (100, 64), (156, 64), (186, 96)]
    c.poly(top + [(128, 206)], (210, 240, 255))
    c.poly([(70, 96), (186, 96), (128, 206)], (170, 220, 250), 3)
    for a, b in [((100, 64), (112, 96)), ((156, 64), (144, 96)), ((112, 96), (128, 206)), ((144, 96), (128, 206)), ((128, 64), (112, 96)), ((128, 64), (144, 96))]:
        c.line([a, b], 3)
    c.hi([104, 72, 120, 84])

def gem_oval(c):
    c.ell([62, 76, 194, 180], LIL); c.ell([92, 100, 164, 156], (215, 190, 255), 3)
    for x, y in [(64, 128), (192, 128), (128, 78), (128, 178), (82, 92), (174, 92), (82, 164), (174, 164)]:
        c.line([(x, y), (128 + (x - 128) * .45, 128 + (y - 128) * .45)], 3)
    c.hi([96, 94, 114, 106])

def gem_star(c):
    p = star(128, 136, 92, 40); c.poly(p, SUN)
    c.poly(star(128, 136, 44, 20), (255, 236, 140), 3)
    for x, y in p[::2]: c.line([(128, 136), (x, y)], 3)
    c.hi([104, 92, 118, 104])

def gem_drop(c):
    pts = [(128, 46)] + [(128 + 62 * math.cos(math.radians(a)), 150 + 62 * math.sin(math.radians(a))) for a in range(-30, 211, 10)]
    c.poly(pts, AQUA)
    c.poly([(128, 84), (156, 150), (128, 190), (100, 150)], (170, 245, 235), 3)
    c.hi([104, 120, 118, 140])

def gem_square(c):
    c.poly([(72, 92), (92, 72), (164, 72), (184, 92), (184, 164), (164, 184), (92, 184), (72, 164)], MINT)
    c.rr([100, 100, 156, 156], 4, (195, 250, 220), 3)
    for a, b in [((92, 72), (100, 100)), ((164, 72), (156, 100)), ((92, 184), (100, 156)), ((164, 184), (156, 156))]:
        c.line([a, b], 3)
    c.hi([106, 106, 122, 118])

def gem_pearl(c):
    c.ell([70, 70, 186, 186], (250, 244, 250)); c.ell([90, 92, 176, 178], (240, 228, 245), 0)
    c.hi([96, 92, 126, 116]); c.ell([142, 140, 160, 156], (255, 220, 240), 0)

def gem_row(c):
    c.rr([20, 112, 236, 146], 16, GREY)
    for i in range(5):
        x = 44 + i * 42
        c.poly(star(x, 129, 22, 14, n=8, rot=0), [PINK, LIL, SKY, SUN, PINK][i], 4)
        c.hi([x - 9, 120, x - 2, 126])

def gem_butterfly(c):
    for sx in (-1, 1):
        c.ell([128 + sx * 8 - (90 if sx < 0 else 0), 56, 128 + sx * 8 + (0 if sx < 0 else 90), 138] if sx > 0 else [38, 56, 120, 138], SKY)
        c.ell([128 + 12, 128, 128 + 76, 196] if sx > 0 else [52, 128, 116, 196], BLUE)
    for b in ([58, 76, 82, 100], [174, 76, 198, 100], [70, 148, 90, 168], [166, 148, 186, 168]): c.ell(b, W, 3)
    c.rr([118, 64, 138, 196], 10, PUR)
    c.line([(124, 66), (106, 40)], 4); c.line([(132, 66), (150, 40)], 4)
    c.dot(106, 40, 6); c.dot(150, 40, 6)

# ----------------------------------------------------------------- CHARMS
def ch_clip(c):
    c.ell([30, 60, 128, 140], (255, 200, 235)); c.ell([128, 60, 226, 140], (255, 200, 235))
    c.ell([46, 120, 128, 196], LIL); c.ell([128, 120, 210, 196], LIL)
    c.rr([116, 56, 140, 200], 12, PINK)
    c.hi([54, 76, 74, 90]); c.hi([150, 76, 170, 90])
    c.line([(128, 200), (128, 232)], 6, GREY)

def ch_padlock(c):
    c.arc([82, 40, 174, 140], 180, 360, 14, PLUM); c.arc([88, 46, 168, 134], 180, 360, 6, GREY)
    c.poly(heart_pts(128, 150, 5.6), PINK)
    c.ell([118, 136, 138, 156], PLUM, 0); c.poly([(122, 150), (134, 150), (130, 176), (126, 176)], PLUM, 0)
    c.hi([84, 112, 100, 124])

def ch_cherry(c):
    c.line([(96, 150), (124, 72), (170, 48)], 5, (60, 140, 60)); c.line([(160, 158), (128, 70)], 5, (60, 140, 60))
    c.poly([(126, 70), (176, 52), (190, 70), (150, 84)], GREEN)
    c.ell([56, 130, 128, 202], RED); c.ell([122, 138, 194, 210], RED)
    c.hi([70, 144, 86, 158]); c.hi([136, 152, 152, 166])

def ch_keychain(c):
    c.ell([104, 22, 152, 70], None if False else (0, 0, 0, 0)); c.arc([104, 22, 152, 70], 0, 360, 7, GREY)
    c.arc([104, 22, 152, 70], 0, 360, 2, PLUM)
    c.line([(128, 70), (128, 92)], 5, GREY)
    c.poly(star(128, 158, 78, 34), SUN); c.hi([110, 124, 124, 136])
    face(c, 128, 158, .7, cheeks=False)

def ch_ring(c):
    c.arc([66, 104, 190, 228], 0, 360, 16, PLUM); c.arc([70, 108, 186, 224], 0, 360, 8, GOLD)
    for k in range(5):
        a = math.radians(-90 + k * 72); x, y = 128 + 30 * math.cos(a), 84 + 30 * math.sin(a)
        c.ell([x - 24, y - 24, x + 24, y + 24], (255, 160, 210))
    c.ell([112, 68, 144, 100], SUN); c.hi([118, 74, 126, 82])

def ch_bow(c):
    c.poly([(128, 120), (40, 66), (30, 120), (40, 174)], PINK)
    c.poly([(128, 120), (216, 66), (226, 120), (216, 174)], PINK)
    c.poly([(116, 130), (90, 214), (112, 206), (124, 222), (130, 134)], HOT)
    c.poly([(140, 130), (166, 214), (144, 206), (132, 222), (126, 134)], HOT)
    c.rr([108, 100, 148, 142], 12, HOT); c.hi([50, 86, 66, 98]); c.hi([190, 86, 206, 98])

def ch_locket(c):
    c.line([(60, 30), (128, 96), (196, 30)], 4, GOLD)
    c.poly(heart_pts(128, 150, 5.4), GOLD); c.poly(heart_pts(128, 146, 3.6), (255, 225, 130), 3)
    c.dot(128, 100, 8, GOLD); c.hi([94, 120, 108, 132])

def ch_bracelet(c):
    cols = [PINK, SKY, SUN, LIL, MINT, (255, 160, 210), AQUA, ORA]
    for i in range(16):
        a = math.radians(i * 22.5); x, y = 128 + 84 * math.cos(a), 128 + 70 * math.sin(a)
        c.ell([x - 17, y - 17, x + 17, y + 17], cols[i % 8], 4); c.hi([x - 9, y - 10, x - 3, y - 5])

def ch_tiara(c):
    c.poly([(36, 190), (54, 110), (90, 150), (128, 64), (166, 150), (202, 110), (220, 190)], (225, 230, 245))
    c.rr([30, 176, 226, 204], 10, GREY)
    for x, y, col in [(54, 116, PINK), (128, 74, SKY), (202, 116, PINK)]: c.ell([x - 12, y - 12, x + 12, y + 12], col, 4)
    c.ell([116, 130, 140, 154], LIL, 4); c.hi([60, 180, 80, 188])

# ----------------------------------------------------------------- Y2K GADGETS
def y_flip(c):
    c.rr([74, 20, 182, 120], 22, PINK); c.rr([90, 36, 166, 104], 8, (190, 235, 255), 4)
    c.rr([74, 124, 182, 236], 22, PINK); c.rr([92, 118, 164, 130], 6, HOT, 4)
    for r in range(4):
        for k in range(3): c.rr([96 + k * 22, 146 + r * 20, 112 + k * 22, 158 + r * 20], 4, W, 3)
    c.hi([84, 32, 96, 44]); c.poly(star(150, 66, 12, 5), W, 0)

def y_mp3(c):
    c.rr([70, 40, 186, 200], 20, (245, 245, 250)); c.rr([88, 58, 168, 112], 6, (150, 220, 255), 4)
    c.ell([94, 124, 162, 192], GREY); c.ell([116, 146, 140, 170], W, 4)
    c.line([(120, 200), (96, 236), (60, 238)], 4, (245, 245, 250)); c.line([(120, 200), (96, 236), (60, 238)], 2, PLUM)
    c.ell([40, 226, 66, 250], W, 4); c.ell([150, 226, 176, 250], W, 4); c.line([(136, 200), (160, 228)], 4)
    c.hi([80, 50, 92, 62])

def y_camera(c):
    c.rr([34, 76, 222, 196], 20, (200, 170, 255)); c.rr([54, 62, 104, 82], 6, PUR)
    c.ell([92, 92, 184, 184], (90, 90, 120)); c.ell([110, 110, 166, 166], (60, 160, 230), 4); c.hi([122, 120, 136, 132])
    c.rr([184, 90, 210, 108], 4, SUN, 4); c.dot(64, 100, 7, PINK); c.hi([44, 86, 60, 98])

def y_cd(c):
    c.ell([40, 40, 216, 216], (230, 235, 245))
    for i, col in enumerate([(255, 190, 230), (200, 230, 255), (220, 255, 220), (255, 240, 180)]):
        a0 = -60 + i * 22; c.d.pieslice([46 * S, 46 * S, 210 * S, 210 * S], a0, a0 + 18, fill=col)
    c.ell([104, 104, 152, 152], (200, 205, 215)); c.ell([118, 118, 138, 138], W, 4)
    c.arc([40, 40, 216, 216], 0, 360, OW)

def y_handheld(c):
    c.rr([44, 60, 212, 196], 34, (150, 220, 255)); c.rr([90, 78, 166, 136], 8, (200, 230, 170), 4)
    c.poly([(66, 150), (78, 150), (78, 138), (90, 138), (90, 150), (102, 150), (102, 162), (90, 162), (90, 174), (78, 174), (78, 162), (66, 162)], DGREY, 3)
    c.ell([160, 140, 182, 162], PINK, 4); c.ell([180, 124, 202, 146], SUN, 4); c.hi([60, 76, 76, 90])

def y_computer(c):
    c.rr([46, 30, 210, 180], 36, (255, 170, 215)); c.rr([70, 52, 186, 138], 12, (170, 230, 255), 4)
    c.poly(star(128, 94, 16, 7), W, 0)
    c.poly([(92, 180), (164, 180), (180, 214), (76, 214)], (255, 150, 200))
    c.rr([60, 210, 196, 232], 8, (255, 200, 230)); c.hi([60, 44, 78, 58]); c.dot(128, 160, 6, W)

def y_pet(c):
    c.ell([54, 34, 202, 222], (255, 200, 120)); c.rr([88, 76, 168, 146], 12, (200, 230, 190), 4)
    c.dot(116, 104, 4); c.dot(140, 104, 4); c.arc([120, 104, 136, 120], 20, 160, 3)
    for x in (96, 128, 160): c.ell([x - 10, 166, x + 10, 186], PINK, 4)
    c.ell([118, 18, 138, 40], GREY, 4); c.hi([74, 62, 92, 80])

def y_cassette(c):
    c.rr([28, 66, 228, 192], 14, (60, 60, 80)); c.rr([48, 80, 208, 140], 8, (255, 210, 230), 4)
    c.rr([82, 98, 174, 126], 10, (240, 240, 250), 3)
    c.ell([90, 102, 110, 122], W, 3); c.ell([146, 102, 166, 122], W, 3)
    c.poly([(70, 192), (84, 160), (172, 160), (186, 192)], (100, 100, 120), 4); c.hi([40, 74, 54, 86])

def y_pager(c):
    c.rr([44, 80, 212, 184], 18, LIL); c.rr([62, 96, 176, 140], 6, (190, 235, 190), 4)
    for x in (70, 104, 138): c.rr([x, 152, x + 26, 170], 6, W, 3)
    c.rr([186, 100, 200, 164], 5, PUR, 3); c.hi([54, 88, 70, 100])
    c.rr([72, 108, 140, 116], 2, (90, 150, 90), 0); c.rr([72, 122, 120, 130], 2, (90, 150, 90), 0)

# ----------------------------------------------------------------- CUTE DECO
def cu_bunny(c):
    c.ell([72, 14, 112, 120], W); c.ell([144, 14, 184, 120], W)
    c.ell([82, 32, 102, 104], (255, 180, 210), 0); c.ell([154, 32, 174, 104], (255, 180, 210), 0)
    c.ell([48, 86, 208, 226], W); face(c, 128, 156, 1.1)

def cu_kitten(c):
    c.poly([(54, 116), (64, 36), (118, 84)], (255, 200, 140)); c.poly([(202, 116), (192, 36), (138, 84)], (255, 200, 140))
    c.ell([44, 70, 212, 222], (255, 200, 140)); face(c, 128, 148, 1.1)
    for dy in (-6, 6):
        c.line([(46, 160 + dy), (82, 158)], 3); c.line([(210, 160 + dy), (174, 158)], 3)

def cu_strawberry(c):
    c.poly([(128, 232), (48, 128), (56, 82), (128, 66), (200, 82), (208, 128)], RED)
    for x, y in [(96, 110), (128, 100), (160, 110), (90, 150), (166, 150), (112, 186), (146, 186)]:
        c.ell([x - 4, y - 6, x + 4, y + 6], SUN, 0)
    c.poly(star(128, 70, 46, 20, n=5, rot=90), GREEN); face(c, 128, 140, .8)

def cu_cupcake(c):
    c.poly([(66, 140), (190, 140), (172, 228), (84, 228)], (255, 200, 120))
    for x in range(86, 176, 18): c.line([(x, 146), (x + 4, 222)], 3)
    c.ell([50, 84, 206, 160], (255, 170, 215)); c.ell([80, 50, 176, 120], (255, 190, 225))
    c.ell([114, 22, 142, 50], RED); c.hi([94, 62, 110, 74])
    for x, y, col in [(80, 110, SKY), (150, 98, SUN), (176, 126, MINT), (114, 132, W)]: c.rr([x, y, x + 14, y + 6], 3, col, 0)

def cu_daisy(c):
    for k in range(10):
        a = math.radians(k * 36); x, y = 128 + 72 * math.cos(a), 128 + 72 * math.sin(a)
        c.ell([x - 34, y - 34, x + 34, y + 34], W)
    c.ell([78, 78, 178, 178], SUN); face(c, 128, 124, .85)

def cu_cloud(c):
    for b in ([30, 100, 110, 180], [70, 60, 160, 150], [130, 76, 210, 156], [160, 110, 230, 180], [56, 120, 200, 196]): c.ell(b, W)
    c.d.rectangle([60 * S, 124 * S, 200 * S, 180 * S], fill=W)
    c.arc([56, 120, 200, 196], 20, 160, OW); face(c, 130, 136, .9)

def cu_rainbow(c):
    for i, col in enumerate([RED, ORA, SUN, GREEN, SKY, PUR]):
        r = 104 - i * 13
        c.d.pieslice([(128 - r) * S, (176 - r) * S, (128 + r) * S, (176 + r) * S], 180, 360, fill=col, outline=PLUM, width=3 * S)
    c.d.pieslice([(128 - 26) * S, (176 - 26) * S, (128 + 26) * S, (176 + 26) * S], 180, 360, fill=(0, 0, 0, 0))
    c.d.rectangle([0, 0, 1, 1], fill=(0, 0, 0, 0))
    for b in ([12, 156, 72, 206], [44, 162, 100, 210], [156, 156, 216, 206], [184, 162, 244, 210]): c.ell(b, W)

def cu_icecream(c):
    c.poly([(84, 132), (172, 132), (128, 238)], (240, 180, 100))
    for i in range(4): c.line([(96 + i * 16, 136), (128 + i * 6, 210)], 3); c.line([(160 - i * 16, 136), (128 - i * 6, 210)], 3)
    c.ell([70, 76, 186, 156], MINT); c.ell([86, 26, 170, 104], (255, 180, 215))
    c.ell([118, 10, 138, 32], RED); c.hi([100, 40, 114, 52]); face(c, 128, 112, .7, cheeks=False)

def cu_starface(c):
    c.poly(star(128, 136, 104, 46), SUN); c.hi([104, 74, 120, 88]); face(c, 128, 140, 1.0)

# ----------------------------------------------------------------- MATERIALS
def m_washi(c):
    pts = [(20, 100), (40, 92), (36, 104), (226, 92), (234, 100), (226, 112), (236, 124), (226, 160), (34, 172), (20, 160), (30, 148), (18, 136)]
    c.poly([(24, 96), (232, 88), (236, 156), (28, 168)], (255, 150, 200))
    for i in range(10):
        x = 34 + i * 20; c.poly([(x, 94), (x + 9, 94), (x + 12, 164), (x + 3, 164)], (255, 235, 245), 0)
    c.poly([(24, 96), (232, 88), (236, 156), (28, 168)], None, OW)

def m_clip(c):
    outer = heart_pts(128, 132, 6.0); c.poly(outer, None, 9)
    inner = heart_pts(128, 140, 4.0); c.poly(inner, None, 9)
    c.poly(outer, None, 4); c.d.polygon(c._p(outer), outline=(255, 120, 190), width=4 * S)
    c.d.polygon(c._p(inner), outline=(255, 120, 190), width=4 * S)

def m_polaroid(c):
    c.rr([50, 30, 206, 226], 4, CREAM); c.rr([66, 46, 190, 170], 2, (190, 225, 255), 4)
    c.ell([140, 60, 170, 90], (255, 240, 150), 0)
    c.poly([(66, 170), (110, 118), (150, 156), (170, 140), (190, 160), (190, 170)], (150, 210, 160), 0)

def m_paper(c):
    pts = [(40, 30), (216, 34), (210, 206), (196, 214), (182, 204), (168, 216), (152, 206), (138, 218), (122, 206), (108, 218), (92, 206), (76, 218), (60, 208), (46, 214)]
    c.poly(pts, W)
    for y in range(64, 200, 22): c.line([(52, y), (204, y)], 2, (150, 190, 240))
    c.line([(76, 40), (74, 204)], 2, (240, 120, 140))
    for y in (70, 120, 170): c.ell([48, y, 60, y + 12], (230, 225, 235), 2)

def m_sticky(c):
    c.poly([(40, 40), (216, 40), (216, 176), (176, 216), (40, 216)], (255, 236, 120))
    c.poly([(216, 176), (176, 176), (176, 216)], (240, 205, 70))
    c.rr([84, 24, 172, 52], 2, (255, 220, 240), 0)
    for y in (90, 122, 154): c.line([(64, y), (180 if y < 154 else 150, y)], 3, (220, 180, 60))

def m_pin(c):
    for pts in ([(52, 152), (204, 152)], [(52, 116), (196, 128)]):
        c.line(pts, 10, PLUM); c.line(pts, 4, GREY)
    c.arc([22, 106, 70, 162], 60, 300, 10, PLUM); c.arc([22, 106, 70, 162], 60, 300, 4, GREY)
    c.rr([182, 104, 232, 170], 14, PINK); c.hi([192, 112, 204, 126])

def m_ticket(c):
    c.poly([(22, 80), (234, 80), (234, 112), (222, 128), (234, 144), (234, 176), (22, 176), (22, 144), (34, 128), (22, 112)], (255, 170, 205))
    for y in range(90, 172, 12): c.dot(176, y, 2.4)
    c.rr([44, 104, 160, 152], 6, (255, 225, 238), 3); c.poly(star(205, 128, 16, 7), SUN, 3)

def m_pushpin(c):
    c.line([(128, 168), (128, 236)], 6, GREY); c.line([(128, 168), (128, 236)], 2, PLUM)
    c.ell([92, 140, 164, 176], (220, 40, 80)); c.rr([108, 80, 148, 150], 6, (235, 60, 95))
    c.ell([72, 30, 184, 100], RED); c.hi([92, 42, 114, 58])

def m_doily(c):
    for k in range(24):
        a = math.radians(k * 15); x, y = 128 + 98 * math.cos(a), 128 + 98 * math.sin(a)
        c.ell([x - 16, y - 16, x + 16, y + 16], W, 4)
    c.ell([34, 34, 222, 222], W, 0)
    for k in range(12):
        a = math.radians(k * 30); x, y = 128 + 72 * math.cos(a), 128 + 72 * math.sin(a)
        c.ell([x - 7, y - 7, x + 7, y + 7], (245, 235, 245), 3)
    c.ell([84, 84, 172, 172], (255, 240, 248), 3)


ITEMS = [
    ('gems', 'gem-heart', 'pink heart rhinestone', gem_heart), ('gems', 'gem-diamond', 'diamond', gem_diamond),
    ('gems', 'gem-oval', 'lilac oval gem', gem_oval), ('gems', 'gem-star', 'star gem', gem_star),
    ('gems', 'gem-drop', 'aqua teardrop', gem_drop), ('gems', 'gem-square', 'mint square gem', gem_square),
    ('gems', 'gem-pearl', 'pearl', gem_pearl), ('gems', 'gem-row', 'rhinestone row', gem_row),
    ('gems', 'gem-butterfly', 'gem butterfly', gem_butterfly),
    ('charms', 'charm-clip', 'butterfly clip', ch_clip), ('charms', 'charm-padlock', 'heart padlock', ch_padlock),
    ('charms', 'charm-cherry', 'cherry charm', ch_cherry), ('charms', 'charm-keychain', 'star keychain', ch_keychain),
    ('charms', 'charm-ring', 'flower ring', ch_ring), ('charms', 'charm-bow', 'pink bow', ch_bow),
    ('charms', 'charm-locket', 'heart locket', ch_locket), ('charms', 'charm-bracelet', 'bead bracelet', ch_bracelet),
    ('charms', 'charm-tiara', 'tiara', ch_tiara),
    ('y2k', 'y2k-flip', 'flip phone', y_flip), ('y2k', 'y2k-mp3', 'mp3 player', y_mp3),
    ('y2k', 'y2k-camera', 'digicam', y_camera), ('y2k', 'y2k-cd', 'cd', y_cd),
    ('y2k', 'y2k-handheld', 'handheld game', y_handheld), ('y2k', 'y2k-computer', 'bubble computer', y_computer),
    ('y2k', 'y2k-pet', 'virtual pet', y_pet), ('y2k', 'y2k-cassette', 'cassette', y_cassette),
    ('y2k', 'y2k-pager', 'pager', y_pager),
    ('cute', 'cute-bunny', 'bunny', cu_bunny), ('cute', 'cute-kitten', 'kitten', cu_kitten),
    ('cute', 'cute-strawberry', 'strawberry', cu_strawberry), ('cute', 'cute-cupcake', 'cupcake', cu_cupcake),
    ('cute', 'cute-daisy', 'happy daisy', cu_daisy), ('cute', 'cute-cloud', 'happy cloud', cu_cloud),
    ('cute', 'cute-rainbow', 'rainbow', cu_rainbow), ('cute', 'cute-icecream', 'ice cream', cu_icecream),
    ('cute', 'cute-star', 'star friend', cu_starface),
    ('materials', 'mat-washi', 'washi tape', m_washi), ('materials', 'mat-clip', 'heart paperclip', m_clip),
    ('materials', 'mat-polaroid', 'instant photo', m_polaroid), ('materials', 'mat-paper', 'notebook scrap', m_paper),
    ('materials', 'mat-sticky', 'sticky note', m_sticky), ('materials', 'mat-pin', 'safety pin', m_pin),
    ('materials', 'mat-ticket', 'ticket stub', m_ticket), ('materials', 'mat-pushpin', 'pushpin', m_pushpin),
    ('materials', 'mat-doily', 'paper doily', m_doily),
]


GRID = 36                  # pixel-art resolution: longest side, in "pixels"


def own_palette(img, n=18):
    """the sticker's own flat colours (plus plum + white), so pixels snap to real fills"""
    small = img.resize((256, 256), Image.Resampling.BOX)
    a = np.asarray(small)
    opaque = a[..., 3] > 250
    rgb = Image.fromarray(a[..., :3].astype(np.uint8))
    q = rgb.quantize(colors=n, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[:n * 3], float).reshape(-1, 3)
    used = np.unique(np.asarray(q)[opaque])
    return np.vstack([pal[used], [PLUM, W]])


def finish(img, size):
    """Y2K pixel art: shrink to a GRID-pixel sprite, snap every pixel to the sticker's own
    flat colours, add a 1px plum outline and a white die-cut, then scale up with hard
    nearest-neighbour edges (whole-number zoom so pixels stay square)."""
    from scipy import ndimage
    img = img.crop(img.getbbox())
    pal = own_palette(img)
    w, h = img.size; k = GRID / max(w, h)
    small = img.resize((max(1, round(w * k)), max(1, round(h * k))), Image.Resampling.BOX)
    a = np.asarray(small).astype(float)
    alpha = a[..., 3] >= 110
    al = a[..., 3:4] / 255
    rgb = np.clip(np.where(al > 0, a[..., :3] / np.maximum(al, 1e-3), 0), 0, 255)
    q = pal[((rgb[..., None, :] - pal[None, None]) ** 2).sum(-1).argmin(-1)]
    pad = 3
    A = np.pad(alpha, pad); Q = np.pad(q, ((pad, pad), (pad, pad), (0, 0)))
    ring1 = ndimage.binary_dilation(A, np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]])) & ~A
    ring2 = ndimage.binary_dilation(A | ring1, np.ones((3, 3))) & ~(A | ring1)
    out = np.zeros(A.shape + (4,), np.uint8)
    out[A, :3] = Q[A]; out[A, 3] = 255
    out[ring1, :3] = PLUM; out[ring1, 3] = 255
    out[ring2, :3] = W; out[ring2, 3] = 255
    im = Image.fromarray(out); im = im.crop(im.getbbox())
    zoom = max(1, size // max(im.size))
    return im.resize((im.width * zoom, im.height * zoom), Image.Resampling.NEAREST)


manifest = []
for cat, sid, label, fn in ITEMS:
    c = C(); fn(c)
    full = finish(c.im, 256); thumb = finish(c.im, 128)
    full.save(f'{OUT}/full/{sid}.webp', lossless=True, method=6)
    thumb.save(f'{OUT}/thumbs/{sid}.webp', lossless=True, method=6)
    manifest.append({'id': sid, 'label': label, 'category': cat, 'aspect': round(full.width / full.height, 3)})
print(json.dumps(manifest))
