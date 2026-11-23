"""Turn the BellPal character art into the app's pixel sprites.

Reads art/source/*.webp (transparent PNG/WebP exports) and writes small
palette PNGs to src/assets/bellpals/. Each sprite is cut out, its colours are
flattened to a small palette (generated "pixel art" is noisy), and stray
single pixels are cleaned up. It also paints the extra animation frames the
art doesn't include: blinking, sleeping eyes and an open mouth for eating.

Run from prototype/:  python3 scripts/make_sprites.py   (needs numpy, Pillow)

When the final art arrives, replace the files in art/source/ and update the
eye and mouth boxes in FACES (pixel positions in the output sprites).
Ding comes from its pose sheet (ding-sheet.webp) so every pose matches;
ding-hero.webp, a larger single bear with a brown outline, isn't used yet.
"""

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'art' / 'source'
OUT = ROOT / 'src' / 'assets' / 'bellpals'
rng = np.random.default_rng(7)

# Single-pose characters, and how much to shrink them so one "art pixel" is about 11 px.
SINGLES = {'chime': 0.40, 'gong': 0.44, 'jingle': 0.45}
# Ding's sprite sheet: 4 columns x 2 rows of poses.
DING_POSES = ['front', 'threeq', 'side', 'back', 'walk', 'jump', 'sit', 'sleep']


# ---------- cut-out ----------

def components(mask):
    h, w = mask.shape
    lab = np.zeros((h, w), np.int32)
    sizes = {}
    n = 0
    for y0, x0 in zip(*np.nonzero(mask)):
        if lab[y0, x0]:
            continue
        n += 1
        q = deque([(y0, x0)])
        lab[y0, x0] = n
        count = 0
        while q:
            y, x = q.popleft()
            count += 1
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)):
                yy, xx = y + dy, x + dx
                if 0 <= yy < h and 0 <= xx < w and mask[yy, xx] and not lab[yy, xx]:
                    lab[yy, xx] = n
                    q.append((yy, xx))
        sizes[n] = count
    return lab, sizes


def cut_out(a, min_keep):
    """Drop faint alpha and loose bits (like the "zz" beside the sleeping pose), then crop."""
    a = a.copy()
    a[a[..., 3] < 24, 3] = 0
    lab, sizes = components(a[..., 3] > 0)
    biggest = max(sizes.values())
    keep = [k for k, v in sizes.items() if v >= biggest * min_keep]
    a[~np.isin(lab, keep), 3] = 0
    ys, xs = np.nonzero(a[..., 3] > 0)
    return a[ys.min(): ys.max() + 1, xs.min(): xs.max() + 1]


# ---------- palette ----------

def to_lab(rgb):
    c = rgb / 255.0
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    m = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ m.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[:, 1] - 16, 500 * (f[:, 0] - f[:, 1]), 200 * (f[:, 1] - f[:, 2])], 1)


def palette(images, k=20, merge_de=5.0):
    """Cluster colours in Lab. Farthest-point seeding keeps small accents (bells, stars)."""
    px = np.concatenate([im[..., :3][im[..., 3] > 128] for im in images], 0).astype(np.float64)
    sub = px[rng.choice(len(px), size=min(len(px), 60000), replace=False)]
    lab = to_lab(sub)
    centres = [lab[rng.integers(len(lab))]]
    d2 = ((lab - centres[0]) ** 2).sum(1)
    for _ in range(1, k):
        i = int(d2.argmax())
        centres.append(lab[i])
        d2 = np.minimum(d2, ((lab - lab[i]) ** 2).sum(1))
    centres = np.array(centres)
    for _ in range(25):
        member = ((lab[:, None, :] - centres[None]) ** 2).sum(-1).argmin(1)
        for j in range(k):
            if (member == j).any():
                centres[j] = lab[member == j].mean(0)
    pal, count, cl = [], [], []
    for j in range(k):
        m = member == j
        if m.sum() >= 3:
            pal.append(sub[m].mean(0))
            count.append(m.sum())
            cl.append(centres[j])
    pal, count, cl = np.array(pal), np.array(count, float), np.array(cl)
    while True:  # merge near-identical shades (noise) into the more common one
        d = np.sqrt(((cl[:, None] - cl[None]) ** 2).sum(-1))
        np.fill_diagonal(d, 1e9)
        i, j = np.unravel_index(d.argmin(), d.shape)
        if d[i, j] >= merge_de:
            break
        if count[i] < count[j]:
            i, j = j, i
        keep = np.ones(len(pal), bool)
        keep[j] = False
        count[i] += count[j]
        pal, count, cl = pal[keep], count[keep], cl[keep]
    return pal.round().astype(np.int32)


def to_indices(a, pal):
    labp = to_lab(pal.astype(np.float64))
    rgb = a[..., :3].reshape(-1, 3).astype(np.float64)
    idx = ((to_lab(rgb)[:, None, :] - labp[None]) ** 2).sum(-1).argmin(1).reshape(a.shape[:2])
    return idx, a[..., 3] >= 128


def flatten(a, pal, scale):
    idx, alpha = to_indices(a, pal)
    t = len(pal)
    # A majority filter removes single-pixel speckle inside flat areas.
    full = np.asarray(Image.fromarray(np.where(alpha, idx, t).astype(np.uint8), 'L').filter(ImageFilter.ModeFilter(5))).astype(np.int32)
    if scale != 1.0:
        h, w = full.shape
        nh, nw = round(h * scale), round(w * scale)
        ys = (np.arange(nh + 1) / scale).astype(int)
        xs = (np.arange(nw + 1) / scale).astype(int)
        out = np.zeros((nh, nw), np.int32)
        for y in range(nh):
            rows = full[ys[y]: max(ys[y + 1], ys[y] + 1)]
            for x in range(nw):
                cell = rows[:, xs[x]: max(xs[x + 1], xs[x] + 1)].ravel()
                out[y, x] = np.bincount(cell, minlength=t + 1).argmax()
        full = out
    return full  # palette indices, transparent = len(pal)


# ---------- extra frames ----------

# Pixel positions (x0, y0, x1, y1) in the output sprites; b = size of one art pixel.
FACES = {
    'ding': dict(eyes=[(70, 137, 116, 187), (177, 137, 220, 187)], mouth=(127, 177, 164, 196), b=11.5,
                 blink=[0, 1], sleep=None, mouth_pat=['DDDD', 'DTTD', '.DD.'], mouth_top=176),
    'chime': dict(eyes=[(76, 176, 124, 227), (183, 187, 229, 223)], brow=(184, 166, 208, 182), mouth=(134, 217, 176, 241), b=11.2,
                  blink=[0], sleep=8.6, mouth_pat=['DDDD', 'DTTD', '.DD.'], mouth_top=216),
    'gong': dict(eyes=[(151, 185, 216, 219), (275, 185, 340, 219)], mouth=(224, 218, 267, 243), b=11.0,
                 blink=[], sleep=11.0, mouth_pat=['DDDD', 'DTTD', '.DD.'], mouth_top=217),
    'jingle': dict(eyes=[(76, 247, 119, 293), (181, 247, 224, 293)], mouth=(137, 297, 164, 310), b=10.8,
                   blink=[0, 1], sleep=6.6, mouth_pat=['DDD', 'DTD', '.D.'], mouth_top=296),
}
BLINK = ['XXX']
SLEEPY = ['X...X', '.XXX.']


def nearest(pal, rgb):
    return int(((pal - np.array(rgb)) ** 2).sum(1).argmin())


def paint(idx, x0, y0, cw, ch, pattern, colours):
    for r, row in enumerate(pattern):
        for c, ch_ in enumerate(row):
            if ch_ != '.':
                idx[round(y0 + r * ch): round(y0 + (r + 1) * ch), round(x0 + c * cw): round(x0 + (c + 1) * cw)] = colours[ch_]


TONGUE = (232, 108, 112)


def with_tongue(pal, frames):
    """Make sure the palette has a tongue red; adding one moves the transparent index."""
    if ((pal[nearest(pal, TONGUE)] - TONGUE) ** 2).sum() <= 40 ** 2:
        return pal, frames
    old = len(pal)
    pal = np.vstack([pal, TONGUE])
    return pal, {k: np.where(v == old, len(pal), v) for k, v in frames.items()}


def face_frames(base, pal, spec):
    face = nearest(pal, (252, 232, 214))
    blush = nearest(pal, (246, 168, 150))
    dark = nearest(pal, (60, 30, 45))
    tongue = nearest(pal, TONGUE)
    # Face and blush shades survive erasing; eye ink, glints and old mouths go.
    skin = [i for i in range(len(pal))
            if min(((pal[i] - pal[face]) ** 2).sum(), ((pal[i] - pal[blush]) ** 2).sum()) < 28 ** 2
            and ((pal[i] - (255, 255, 255)) ** 2).sum() > 14 ** 2]
    b = spec['b']

    def erase(img, box):
        x0, y0, x1, y1 = box
        sub = img[y0:y1, x0:x1]
        opaque = sub != len(pal)
        sub[opaque & ~np.isin(sub, skin)] = face

    def eye(img, box, pattern, cw):
        x0, y0, x1, y1 = box
        cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        paint(img, cx - len(pattern[0]) * cw / 2, cy - len(pattern) * b / 2 + b * 0.35, cw, b, pattern, {'X': dark})

    frames = {'base': base}
    if spec['blink']:
        img = base.copy()
        for i in spec['blink']:
            erase(img, spec['eyes'][i])
            eye(img, spec['eyes'][i], BLINK, b)
        frames['blink'] = img
    if spec['sleep']:
        img = base.copy()
        for box in spec['eyes']:
            erase(img, box)
            eye(img, box, SLEEPY, spec['sleep'])
        if 'brow' in spec:
            erase(img, spec['brow'])
        frames['sleep'] = img
    img = base.copy()
    erase(img, spec['mouth'])
    x0, _, x1, _ = spec['mouth']
    pat = spec['mouth_pat']
    paint(img, (x0 + x1) / 2 - len(pat[0]) * b / 2, spec['mouth_top'], b, b, pat, {'D': dark, 'T': tongue})
    frames['open'] = img
    return frames


def save(idx, pal, path):
    t = len(pal)
    im = Image.fromarray(idx.astype(np.uint8), 'P')
    flat = [int(v) for v in pal.ravel()] + [0, 0, 0]
    im.putpalette(flat + [0] * (768 - len(flat)))
    im.save(path, optimize=True, transparency=t)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    groups = {}
    for name in SINGLES:
        a = np.asarray(Image.open(SRC / f'{name}.webp').convert('RGBA'))
        groups[name] = {'base': cut_out(a, 0.02)}
    sheet = np.asarray(Image.open(SRC / 'ding-sheet.webp').convert('RGBA'))
    h, w = sheet.shape[:2]
    groups['ding'] = {}
    for i, pose in enumerate(DING_POSES):
        r, c = divmod(i, 4)
        cell = sheet[int(r * h / 2): int((r + 1) * h / 2), int(c * w / 4): int((c + 1) * w / 4)]
        groups['ding']['base' if pose == 'front' else pose] = cut_out(cell, 0.2)

    written = []
    for key, poses in groups.items():
        pal = palette(list(poses.values()))
        flat = {pose: flatten(a, pal, SINGLES.get(key, 1.0)) for pose, a in poses.items()}
        pal, flat = with_tongue(pal, flat)
        frames = face_frames(flat.pop('base'), pal, FACES[key])
        frames.update(flat)
        for frame, idx in frames.items():
            path = OUT / f'{key}-{frame}.png'
            save(idx, pal, path)
            written.append(f'{path.name} {idx.shape[1]}x{idx.shape[0]}')
    print('\n'.join(written))


if __name__ == '__main__':
    main()
