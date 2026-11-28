"""Export the BellPals' animations as a sprite pack for games.

Replays the app's animations frame by frame, using the same sprites
(src/assets/bellpals) and pixel effects (src/components/Pixel.tsx and
TreatArt.tsx). Writes sprite sheets, single frames, JSON with frame timings,
GIF previews and the raw parts, plus a zip of the lot.

Run from prototype/ (needs Pillow):
    python3 scripts/export_animations.py [out_dir]
out_dir defaults to export/, which git ignores.
"""

import json
import math
import re
import shutil
import sys
import zipfile
from functools import reduce
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'src' / 'assets' / 'bellpals'
PACK = 'bellpals-animations'

# Kept in step with SPRITES in src/components/BellPalArt.tsx. px is one art pixel in
# sprite pixels; head_top and mouth are shares of the base pose's size.
CHARS = {
    'ding': dict(name='Ding', px=11.5, head_top=0.079, mouth=(0.503, 0.522), poses=['base', 'blink', 'open', 'sleep', 'jump', 'threeq', 'walk', 'side', 'back', 'sit']),
    'chime': dict(name='Chime', px=11.2, head_top=0.145, mouth=(0.507, 0.527), poses=['base', 'blink', 'open', 'sleep']),
    'jingle': dict(name='Jingle', px=10.8, head_top=0.236, mouth=(0.502, 0.596), poses=['base', 'blink', 'open', 'sleep']),
    'gong': dict(name='Gong', px=11.0, head_top=0.02, mouth=(0.5, 0.498), poses=['base', 'open', 'sleep']),
}

ANIMS = {
    'idle': 'Standing, bobbing and blinking (Gong doesn\'t blink)',
    'walk': 'Walking. Ding faces right: mirror it to walk left',
    'turn': 'Turning all the way round',
    'sit': 'Sitting and breathing',
    'sleep': 'Asleep, with z\'s floating up',
    'happy': 'Hopping with hearts (when tapped or fed)',
    'ring': 'Alarm going off: shaking and shouting',
    'hungry': 'Waiting for food, opening its mouth now and then',
    'reach': 'Mouth wide open as a treat comes close',
    'eat': 'Chewing and dropping crumbs',
}
DING_ONLY = ('turn', 'sit')
PLAIN = ('sleep', 'happy', 'ring', 'eat')  # also exported without effects
WHITE = ('sleep', 'ring')  # also exported with white z's and sound waves

CANVAS = (1100, 900)
ORIGIN = (550, 760)  # where the feet stand while drawing
BG = '#FAF9F7'  # the app's off-white
SHEET_COLS = 6
ATLAS_COLS = 10


# ---------- pixel art shared with the app ----------

def pixel_art():
    src = (ROOT / 'src' / 'components' / 'Pixel.tsx').read_text()
    pats = {m.group(1): re.findall(r"'([^']*)'", m.group(2)) for m in re.finditer(r'export const (\w+) = \[([^\]]*)\];', src)}
    colours = dict(re.findall(r"(\w): '(#[0-9A-Fa-f]{6})'", src[src.index('PIXEL_COLOURS'):]))
    ink = re.search(r"PIXEL_INK = '(#[0-9A-Fa-f]{6})'", src).group(1)
    colours.update({'O': ink, 'Z': ink, 'X': ink})  # z's and waves use currentColor, which is the ink
    for need in ['HEART', 'ZED', 'SPARKLE', 'WAVE', 'CROWN_SUPER', 'CROWN_MEGA']:
        assert need in pats, f'{need} not found in Pixel.tsx'
    return pats, colours


def treat_art():
    src = (ROOT / 'src' / 'components' / 'TreatArt.tsx').read_text()
    out = {}
    for m in re.finditer(r'(\w+): \{\s*rows: \[([^\]]*)\],\s*colours: \{([^}]*)\}', src):
        out[m.group(1)] = (re.findall(r"'([^']*)'", m.group(2)), dict(re.findall(r"(\w): '(#[0-9A-Fa-f]{6})'", m.group(3))))
    assert len(out) == 4, 'expected 4 treats in TreatArt.tsx'
    return out


def draw_pattern(img, rows, colours, x0, y0, s, mirror=False):
    d = ImageDraw.Draw(img)
    w = len(rows[0])
    for r, row in enumerate(rows):
        for c, ch in enumerate(row):
            if ch == '.':
                continue
            cc = w - 1 - c if mirror else c
            xa, ya = round(x0 + cc * s), round(y0 + r * s)
            xb, yb = round(x0 + (cc + 1) * s), round(y0 + (r + 1) * s)
            if xb > xa and yb > ya:
                d.rectangle([xa, ya, xb - 1, yb - 1], fill=colours[ch])


def pattern_image(rows, colours, s):
    img = Image.new('RGBA', (math.ceil(len(rows[0]) * s), math.ceil(len(rows) * s)), (0, 0, 0, 0))
    draw_pattern(img, rows, colours, 0, 0, s)
    return img


def faded(img, draw, alpha):
    """Draw an effect at the given opacity."""
    if alpha >= 1:
        draw(img)
        return
    layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    draw(layer)
    layer.putalpha(layer.getchannel('A').point(lambda v: round(v * alpha)))
    img.alpha_composite(layer)


# ---------- timelines ----------
# Each animation is a list of (spec, ms) on the same steps as the app's CSS
# (src/styles/app.css, "BellPal sprites"). Moves are in art pixels.

def timeline(key, anim):
    ding = key == 'ding'
    blink = 'blink' in CHARS[key]['poses']
    happy = 'jump' if ding else 'base'
    frames = []

    def add(ms, **spec):
        frames.append(({'pose': 'base', 'flip': False, 'dx': 0, 'dy': 0, 'scale': (1, 1), 'hearts': (), 'z': (), 'waves': (), 'crumbs': None, **spec}, ms))

    if anim == 'idle':  # bobs every 650 ms and blinks once a loop
        for t in range(20):
            add(130, pose='blink' if blink and t == 19 else 'base', dy=-1 if (t // 5) % 2 else 0)
    elif anim == 'walk':  # a step every 210 ms
        add(210, pose='threeq' if ding else 'base')
        add(210, pose='walk' if ding else 'base', dy=-1)
    elif anim == 'turn':  # a new view every 120 ms
        for pose, flip in [('base', False), ('threeq', False), ('side', False), ('back', False), ('side', True), ('threeq', True)]:
            add(120, pose=pose, flip=flip)
    elif anim == 'sit':  # a breath every 2.6 s
        add(1300, pose='sit')
        add(1300, pose='sit', scale=(1.02, 0.975))
    elif anim == 'sleep':  # breathing, three z's rising 0.6 s apart
        for t in range(8):
            zs = tuple((i, (t - 2 * i) % 8) for i in range(3) if 1 <= (t - 2 * i) % 8 <= 6)
            add(300, pose='sleep', scale=(1.02, 0.975) if t >= 4 else (1, 1), z=zs)
    elif anim == 'happy':  # two hops while three hearts rise
        hop = [((1.03, 0.96), 0), ((1, 1), -3), ((1, 1), -4), ((1, 1), -2), ((1, 1), 0), ((1, 1), 0)]
        for t in range(12):
            scale, dy = hop[t % 6]
            hearts = tuple((j, (t - d) % 12) for j, d in enumerate([0, 4, 7]) if 1 <= (t - d) % 12 <= 9)
            add(125, pose=happy, scale=scale, dy=dy, hearts=hearts)
    elif anim == 'ring':  # shakes every 120 ms, shouts every 180 ms, sound waves pulse every 240 ms
        for t in range(24):
            back = (t // 2) % 2 == 1
            waves = tuple((i, 1.0 if (t - 2 * i) % 8 < 4 else 0.25) for i in (1, 2))
            add(60, pose='open' if t % 6 >= 3 else happy, dx=-1 if back else 1, dy=-1 if back else 0, waves=waves)
    elif anim == 'hungry':  # bobs like idle, mouth open for part of each loop
        for t in range(20):
            add(130, pose='open' if 11 <= t <= 16 else 'base', dy=-1 if (t // 5) % 2 else 0)
    elif anim == 'reach':
        add(250, pose='open', dy=-1, scale=(1.03, 1.03))
        add(250, pose='open', dy=-2, scale=(1.03, 1.03))
    elif anim == 'eat':  # chomps every 80 ms with a squash, crumbs falling
        for t in range(8):
            add(80, pose='open' if t % 2 else 'base', scale=(1.05, 0.93) if (t // 2) % 2 == 0 else (1, 1), crumbs=t)
    return frames


def anims_for(key):
    return [a for a in ANIMS if key == 'ding' or a not in DING_ONLY]


def simplify(frames):
    """Join back-to-back identical frames, then drop a loop that repeats itself."""
    out = []
    for spec, ms in frames:
        if out and out[-1][0] == spec:
            out[-1] = (spec, out[-1][1] + ms)
        else:
            out.append((spec, ms))
    if len(out) > 1 and out[0][0] == out[-1][0]:  # the loop ends where it starts
        last = out.pop()
        out[0] = (out[0][0], out[0][1] + last[1])
    n = len(out)
    for p in range(1, n):
        if n % p == 0 and out == out[:p] * (n // p):
            return out[:p]
    return out


# ---------- drawing ----------

def load_poses(key):
    return {p: Image.open(ASSETS / f'{key}-{p}.png').convert('RGBA') for p in CHARS[key]['poses']}


def body(key, spec, poses):
    """Where the pose lands: (image, left, top), with the feet at ORIGIN."""
    u = CHARS[key]['px']
    pose = poses[spec['pose']]
    if spec['flip']:
        pose = ImageOps.mirror(pose)
    sx, sy = spec['scale']
    if (sx, sy) != (1, 1):  # scaled from the feet, like the app's transform-origin
        pose = pose.resize((round(pose.width * sx), round(pose.height * sy)), Image.NEAREST)
    return pose, ORIGIN[0] - round(pose.width / 2) + round(spec['dx'] * u), ORIGIN[1] - pose.height + round(spec['dy'] * u)


def render(key, spec, poses, pats, colours, fx=True, ink=None):
    c = CHARS[key]
    u = c['px']
    bw, bh = poses['base'].size
    ox, oy = ORIGIN
    img = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
    pose, x, y = body(key, spec, poses)
    img.alpha_composite(pose, (x, y))
    if not fx:
        return img

    cols = {**colours, 'Z': ink, 'X': ink} if ink else colours
    head_y = oy - bh * (1 - c['head_top'])
    for j, k in spec['hearts']:  # each rises 90% of its height
        draw_pattern(img, pats['HEART'], cols, ox + (-0.34, 0.22, -0.02)[j] * bw, head_y - 4 * u - 0.9 * 6 * u * k / 12, u)
    for i, k in spec['z']:
        s = u * (5 - i) / 5
        draw_pattern(img, pats['ZED'], cols, ox + 0.3 * bw + 3 * u * i, head_y + 2 * u - 5 * u * i - 0.9 * 5 * s * k / 8, s)
    for i, alpha in spec['waves']:
        wy = head_y + 0.2 * bh - i * u
        faded(img, lambda im: (draw_pattern(im, pats['WAVE'], cols, ox + 0.5 * bw + 3.5 * u * i - 2 * u, wy, u),
                               draw_pattern(im, pats['WAVE'], cols, ox - 0.5 * bw - 3.5 * u * i - u, wy, u, mirror=True)), alpha)
    if spec['crumbs'] is not None:
        mx = ox + (c['mouth'][0] - 0.5) * bw
        my = oy - bh * (1 - c['mouth'][1])
        size = 1.2 * u
        for n, dx in enumerate((-1.6, -0.6, 0.7, 1.5)):
            k = ((spec['crumbs'] * 80 - n * 50) // 160) % 4  # each falls in 4 steps, fading, 50 ms after the last
            x0 = mx + dx * 2 * u
            y0 = my + u * (1 + n % 2) + 2.6 * size * k / 4
            fill = '#F3C27A' if n % 2 == 0 else '#C98A3B'
            faded(img, lambda im: ImageDraw.Draw(im).rectangle([round(x0), round(y0), round(x0 + size) - 1, round(y0 + size) - 1], fill=fill), 1 - k / 4)
    return img


def draw_all(key, anims, poses, pats, colours, **kw):
    """Every frame cropped to what it draws, with its box on the canvas."""
    out = {}
    for a, frames in anims.items():
        out[a] = []
        for spec, _ in frames:
            im = render(key, spec, poses, pats, colours, **kw)
            box = im.getchannel('A').getbbox()
            assert box[0] > 0 and box[1] > 0 and box[2] < CANVAS[0] and box[3] < CANVAS[1], f'{key} {a} runs off the canvas'
            out[a].append((im.crop(box), box))
    return out


def cell_for(drawn):
    """One frame size for all of a BellPal's frames: the feet centred, sizes even so half size is exact."""
    boxes = [b for frames in drawn.values() for _, b in frames]
    half_w = max(ORIGIN[0] - min(b[0] for b in boxes), max(b[2] for b in boxes) - ORIGIN[0]) + 4
    half_w += half_w % 2
    above = ORIGIN[1] - min(b[1] for b in boxes) + 4
    above += above % 2
    below = max(b[3] for b in boxes) - ORIGIN[1] + 4
    below += below % 2
    return ORIGIN[0] - half_w, ORIGIN[1] - above, ORIGIN[0] + half_w, ORIGIN[1] + below


def place(crop, box, cell):
    im = Image.new('RGBA', (cell[2] - cell[0], cell[3] - cell[1]), (0, 0, 0, 0))
    im.alpha_composite(crop, (box[0] - cell[0], box[1] - cell[1]))
    return im


def half(img):
    return img.resize((img.width // 2, img.height // 2), Image.NEAREST)


def shadow_image(w, h):
    """The soft oval the BellPals stand on in the app."""
    w, h = max(8, round(w)), max(4, round(h))
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    px = img.load()
    for yy in range(h):
        for xx in range(w):
            d = math.hypot((xx + 0.5 - w / 2) / (w / 2), (yy + 0.5 - h / 2) / (h / 2))
            if d < 1:
                px[xx, yy] = (40, 22, 30, round(61 * (1 - d)))
    return img


# ---------- writing ----------

def aseprite_json(image, size, frames, tags, bellpal):
    """Aseprite's JSON (hash keyed by frame number): Phaser's Aseprite loader and PixiJS both read it."""
    keyed = {}
    for i, ((x, y, w, h), ms) in enumerate(frames):
        keyed[str(i)] = {'frame': {'x': x, 'y': y, 'w': w, 'h': h}, 'rotated': False, 'trimmed': False,
                         'spriteSourceSize': {'x': 0, 'y': 0, 'w': w, 'h': h}, 'sourceSize': {'w': w, 'h': h}, 'duration': ms}
    return {
        'frames': keyed,
        'animations': {name: [str(i) for i in range(a, b + 1)] for name, a, b in tags},
        'meta': {
            'app': 'BellPals scripts/export_animations.py',
            'version': '1.0',
            'image': image,
            'format': 'RGBA8888',
            'size': {'w': size[0], 'h': size[1]},
            'scale': '1',
            'frameTags': [{'name': name, 'from': a, 'to': b, 'direction': 'forward'} for name, a, b in tags],
            'layers': [{'name': 'BellPal', 'opacity': 255, 'blendMode': 'normal'}],
            'slices': [],
            'bellpal': bellpal,
        },
    }


def grid_sheet(images, cols):
    w, h = images[0].size
    cols = min(cols, len(images))
    rows = math.ceil(len(images) / cols)
    sheet = Image.new('RGBA', (cols * w, rows * h), (0, 0, 0, 0))
    rects = []
    for i, im in enumerate(images):
        x, y = (i % cols) * w, (i // cols) * h
        sheet.alpha_composite(im, (x, y))
        rects.append((x, y, w, h))
    return sheet, rects, (cols, rows)


def save_png(img, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, optimize=True)


def write_json(data, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=1) + '\n')


def main():
    out_root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else ROOT / 'export'
    out = out_root / PACK
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    pats, colours = pixel_art()
    treats = treat_art()

    catalogue = {}
    previews = {}
    for key, c in CHARS.items():
        poses = load_poses(key)
        bw, bh = poses['base'].size
        u = c['px']
        anims = {a: simplify(timeline(key, a)) for a in anims_for(key)}
        drawn = draw_all(key, anims, poses, pats, colours)
        cell = cell_for(drawn)
        size = (cell[2] - cell[0], cell[3] - cell[1])
        pivot = (ORIGIN[0] - cell[0], ORIGIN[1] - cell[1])
        mouth = (round(ORIGIN[0] + (c['mouth'][0] - 0.5) * bw - cell[0]), round(ORIGIN[1] - bh * (1 - c['mouth'][1]) - cell[1]))
        head_h = bh * (1 - c['head_top'])  # feet to the top of the head, base pose

        def head_track(a):  # the top of the head in each frame, following the body like the app's crowns do
            return [[pivot[0] + round(s['dx'] * u), round(pivot[1] + s['dy'] * u - head_h * s['scale'][1])] for s, _ in anims[a]]

        def about(div, **more):
            return {
                'name': c['name'],
                **more,
                'frameSize': {'w': size[0] // div, 'h': size[1] // div},
                'pivot': {'x': pivot[0] // div, 'y': pivot[1] // div, 'about': 'where the feet stand'},
                'pivotNormalized': {'x': 0.5, 'y': round(pivot[1] / size[1], 4)},
                'pivotFromBottomLeft': {'x': 0.5, 'y': round(1 - pivot[1] / size[1], 4)},
                'mouth': {'x': mouth[0] // div, 'y': mouth[1] // div, 'about': 'base pose, for feeding'},
                'headTop': {'x': pivot[0] // div, 'y': round(pivot[1] - head_h) // div, 'about': 'base pose, for hats and crowns'},
                'artPixel': round(u / div, 2),
                'walkFacing': 'right' if key == 'ding' else 'front',
            }

        variants = [('', drawn)]
        variants += [('-plain', draw_all(key, {a: anims[a] for a in PLAIN}, poses, pats, colours, fx=False))]
        variants += [('-white', draw_all(key, {a: anims[a] for a in WHITE}, poses, pats, colours, ink='#FFFFFF'))]
        full = {}
        for suffix, frames_by_anim in variants:
            for a, frames in frames_by_anim.items():
                ims = [place(crop, box, cell) for crop, box in frames]
                full[(a, suffix)] = ims
                for div, folder in [(1, 'sheets'), (2, 'sheets-half')]:
                    sheet, rects, (cols, rows) = grid_sheet(ims if div == 1 else [half(im) for im in ims], SHEET_COLS)
                    name = f'{key}-{a}{suffix}'
                    save_png(sheet, out / folder / f'{name}.png')
                    data = aseprite_json(f'{name}.png', sheet.size, [(r, ms) for r, (_, ms) in zip(rects, anims[a])], [(a, 0, len(ims) - 1)],
                                         about(div, animation=a, grid={'columns': cols, 'rows': rows}))
                    write_json(data, out / folder / f'{name}.json')

        for a in anims:
            for i, im in enumerate(full[(a, '')]):
                save_png(im, out / 'frames' / key / a / f'{key}-{a}-{i:02d}.png')

        # one half-size atlas per BellPal with every animation (fits a 4096 px texture)
        order, tags = [], []
        for a in anims:
            tags.append((a, len(order), len(order) + len(anims[a]) - 1))
            order += [(half(im), ms) for im, (_, ms) in zip(full[(a, '')], anims[a])]
        atlas, rects, _ = grid_sheet([im for im, _ in order], ATLAS_COLS)
        assert max(atlas.size) <= 4096, f'{key} atlas is {atlas.size}'
        save_png(atlas, out / 'atlases' / f'{key}.png')
        write_json(aseprite_json(f'{key}.png', atlas.size, [(r, ms) for r, (_, ms) in zip(rects, order)], tags, about(2)), out / 'atlases' / f'{key}.json')

        # GIF previews: half size, on the app's off-white, with the ground shadow
        shadow = shadow_image(bw * 0.84 / 2, u * 2.8 / 2)
        for a in anims:
            pics = []
            for im in full[(a, '')]:
                bg = Image.new('RGBA', (size[0] // 2, size[1] // 2), BG)
                bg.alpha_composite(shadow, (pivot[0] // 2 - shadow.width // 2, pivot[1] // 2 - shadow.height // 2))
                bg.alpha_composite(half(im))
                pics.append(bg.convert('RGB'))
            durations = [ms for _, ms in anims[a]]
            (out / 'gifs').mkdir(exist_ok=True)
            pics[0].save(out / 'gifs' / f'{key}-{a}.gif', save_all=True, append_images=pics[1:], duration=durations, loop=0, optimize=True, disposal=1)
            previews[(key, a)] = (pics, durations)

        # parts: the still poses (with the painted blink, sleep and open-mouth frames) and the shadow
        for p, im in poses.items():
            save_png(im, out / 'parts' / key / f'{key}-{p}.png')
        save_png(shadow_image(bw * 0.84, u * 2.8), out / 'parts' / key / f'{key}-shadow.png')

        catalogue[key] = {
            **about(1),
            'animations': {
                a: {
                    'frames': len(fr),
                    'loopMs': sum(ms for _, ms in fr),
                    'tickMs': reduce(math.gcd, [ms for _, ms in fr]),
                    'durationsMs': [ms for _, ms in fr],
                    'ticks': [ms // reduce(math.gcd, [m for _, m in fr]) for _, ms in fr],
                    'headTop': head_track(a),
                }
                for a, fr in anims.items()
            },
        }

    # effects shared by every BellPal, at the app's size (one art pixel = 11 px)
    fx = out / 'parts' / 'fx'
    for name, rows in [('heart', 'HEART'), ('zed', 'ZED'), ('sparkle', 'SPARKLE'), ('wave', 'WAVE'), ('crown-super', 'CROWN_SUPER'), ('crown-mega', 'CROWN_MEGA')]:
        save_png(pattern_image(pats[rows], colours, 11), fx / f'{name}.png')
    white = {**colours, 'Z': '#FFFFFF', 'X': '#FFFFFF'}
    save_png(pattern_image(pats['ZED'], white, 11), fx / 'zed-white.png')
    save_png(pattern_image(pats['WAVE'], white, 11), fx / 'wave-white.png')
    for name, (rows, cols) in treats.items():
        save_png(pattern_image(rows, cols, 11), out / 'parts' / 'treats' / f'{name}.png')

    write_json({'units': 'full-size pixels, from the top left of each frame (halve them for the half-size files)', 'bellpals': catalogue}, out / 'catalogue.json')
    write_overview(out, previews)
    (out / 'preview.html').write_text(preview_html(out, catalogue))
    (out / 'README.md').write_text(readme(catalogue))

    zip_path = out_root / f'{PACK}.zip'
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in sorted(out.rglob('*')):
            if f.is_file():
                z.write(f, f.relative_to(out_root))
    count = sum(1 for f in out.rglob('*') if f.is_file())
    print(f'{count} files in {out}\n{zip_path} ({zip_path.stat().st_size / 1e6:.1f} MB)')


def load_font(size):
    for path in ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf']:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            pass
    return ImageFont.load_default()


def write_overview(out, previews):
    """Every BellPal doing every animation: an animated GIF and a still PNG."""
    keys, cols = list(CHARS), list(ANIMS)
    cell, label_h, head_w, tick, total = 124, 30, 84, 60, 2880
    font = load_font(14)
    biggest = max(max(p[0][0].size) for p in previews.values())
    f = (cell - 8) / biggest
    thumbs = {k: ([p.resize((round(p.width * f), round(p.height * f)), Image.NEAREST) for p in pics], durs) for k, (pics, durs) in previews.items()}

    def sheet(pick):
        img = Image.new('RGB', (head_w + cell * len(cols), label_h + cell * len(keys)), BG)
        d = ImageDraw.Draw(img)
        for ci, a in enumerate(cols):
            d.text((head_w + ci * cell + cell / 2, label_h / 2 + 2), a, fill='#6A6A6A', font=font, anchor='mm')
        for ri, key in enumerate(keys):
            d.text((12, label_h + ri * cell + cell / 2), CHARS[key]['name'], fill='#222222', font=font, anchor='lm')
            for ci, a in enumerate(cols):
                if (key, a) in thumbs:
                    pic = pick(*thumbs[(key, a)])
                    img.paste(pic, (head_w + ci * cell + (cell - pic.width) // 2, label_h + ri * cell + (cell - pic.height) // 2))
        return img

    def at(ms):
        def pick(pics, durs):
            t, i = ms % sum(durs), 0
            while t >= durs[i]:
                t -= durs[i]
                i += 1
            return pics[i]
        return pick

    frames = [sheet(at(t)) for t in range(0, total, tick)]
    # one palette for every frame keeps the GIF small
    sample = Image.new('RGB', (frames[0].width, frames[0].height * 4))
    for i in range(4):
        sample.paste(frames[i * len(frames) // 4], (0, frames[0].height * i))
    palette = sample.quantize(colors=256, method=Image.Quantize.MEDIANCUT)
    frames = [fr.quantize(palette=palette, dither=Image.Dither.NONE) for fr in frames]
    frames[0].save(out / 'overview.gif', save_all=True, append_images=frames[1:], duration=tick, loop=0)
    sheet(lambda pics, durs: pics[min(len(pics) - 1, len(pics) * 2 // 5)]).save(out / 'overview.png', optimize=True)


def preview_html(out, catalogue):
    data = {}
    for key in catalogue:
        atlas = json.loads((out / 'atlases' / f'{key}.json').read_text())
        frames = list(atlas['frames'].values())
        data[key] = {
            'image': f'atlases/{key}.png',
            'name': catalogue[key]['name'],
            'anims': {t['name']: [[f['frame']['x'], f['frame']['y'], f['frame']['w'], f['frame']['h'], f['duration']] for f in frames[t['from']: t['to'] + 1]]
                      for t in atlas['meta']['frameTags']},
        }
    return PREVIEW.replace('__DATA__', json.dumps(data, separators=(',', ':')))


def readme(catalogue):
    anim_rows = []
    for a, what in ANIMS.items():
        loops = {catalogue[k]['name']: catalogue[k]['animations'][a]['loopMs'] for k in catalogue if a in catalogue[k]['animations']}
        usual = max(set(loops.values()), key=list(loops.values()).count)
        odd = ', '.join(f'{name} {ms / 1000:g} s' for name, ms in loops.items() if ms != usual)
        anim_rows.append(f"| `{a}` | {what} | {'Ding only' if a in DING_ONLY else 'All four'} | {usual / 1000:g} s{f' ({odd})' if odd else ''} |")
    size_rows = [f"| {v['name']} | {v['frameSize']['w']} × {v['frameSize']['h']} | {v['frameSize']['w'] // 2} × {v['frameSize']['h'] // 2} | "
                 f"{v['pivot']['x']}, {v['pivot']['y']} | {v['mouth']['x']}, {v['mouth']['y']} | {v['headTop']['x']}, {v['headTop']['y']} |"
                 for v in catalogue.values()]
    example = catalogue['ding']['pivotNormalized']['y']
    return (README.replace('__ANIMS__', '\n'.join(anim_rows)).replace('__SIZES__', '\n'.join(size_rows))
            .replace('__PIVOT_Y__', f'{example:g}'))


PREVIEW = r"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BellPals Animations</title>
<style>
:root { --bg: #faf9f7; --card: #ffffff; --ink: #222222; --muted: #6a6a6a; --line: #ebebeb; --stage: #fbf3e4; --night: #1d1f45; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #171615; --card: #22211f; --ink: #f3f1ee; --muted: #aaa5a0; --line: #34312e; --stage: #2b2925; color-scheme: dark; } }
:root[data-theme="dark"] { --bg: #171615; --card: #22211f; --ink: #f3f1ee; --muted: #aaa5a0; --line: #34312e; --stage: #2b2925; color-scheme: dark; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.45 system-ui, -apple-system, 'Segoe UI', sans-serif; }
main { max-width: 1240px; margin: 0 auto; padding: 24px 16px 40px; display: grid; gap: 20px; }
h1 { margin: 0; font-size: 26px; letter-spacing: -0.4px; }
p { margin: 0; color: var(--muted); max-width: 70ch; }
.bar { display: flex; flex-wrap: wrap; gap: 8px; }
.bar button { font: inherit; font-weight: 600; padding: 8px 14px; border-radius: 999px; border: 1px solid var(--line); background: var(--card); color: var(--ink); cursor: pointer; }
.bar button[aria-pressed="true"] { background: var(--ink); color: var(--bg); border-color: var(--ink); }
#list { display: grid; gap: 20px; }
section { background: var(--card); border: 1px solid var(--line); border-radius: 20px; padding: 16px; display: grid; gap: 12px; min-width: 0; }
h2 { margin: 0; font-size: 18px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(128px, 1fr)); gap: 12px; }
figure { margin: 0; display: grid; gap: 6px; justify-items: center; }
canvas { width: 100%; max-width: 170px; aspect-ratio: 1; border-radius: 14px; background: var(--stage); image-rendering: pixelated; }
.night canvas { background: var(--night); }
.clear canvas { background: repeating-conic-gradient(#d9d6d1 0 25%, #f4f2ef 0 50%) 0 0 / 16px 16px; }
figcaption { font-size: 13px; font-weight: 600; text-align: center; }
figcaption small { display: block; color: var(--muted); font-weight: 500; }
code { font-size: 0.92em; }
</style>
</head>
<body>
<main>
  <h1>BellPals animations</h1>
  <p>Every animation in this pack, played from the half-size atlases in <code>atlases/</code> with the frame timings from their JSON. The z's and sound waves are dark, so on a dark background like Night, use the <code>-white</code> sheets.</p>
  <div class="bar" role="group" aria-label="Background">
    <button type="button" data-bg="" aria-pressed="true">Light</button>
    <button type="button" data-bg="night" aria-pressed="false">Night</button>
    <button type="button" data-bg="clear" aria-pressed="false">Transparent</button>
  </div>
  <div id="list"></div>
</main>
<script>
const DATA = __DATA__;
const list = document.getElementById('list');
const players = [];
for (const pal of Object.values(DATA)) {
  const sec = document.createElement('section');
  const h = document.createElement('h2');
  h.textContent = pal.name;
  const grid = document.createElement('div');
  grid.className = 'grid';
  sec.append(h, grid);
  const img = new Image();
  img.src = pal.image;
  for (const [name, frames] of Object.entries(pal.anims)) {
    const fig = document.createElement('figure');
    const cv = document.createElement('canvas');
    const side = Math.max(frames[0][2], frames[0][3]);
    cv.width = side;
    cv.height = side;
    cv.setAttribute('role', 'img');
    cv.setAttribute('aria-label', `${pal.name}: ${name}`);
    const total = frames.reduce((s, f) => s + f[4], 0);
    const cap = document.createElement('figcaption');
    cap.textContent = name;
    const small = document.createElement('small');
    small.textContent = `${frames.length} frames · ${(total / 1000).toFixed(2)} s loop`;
    cap.append(small);
    fig.append(cv, cap);
    grid.append(fig);
    players.push({ cv, ctx: cv.getContext('2d'), img, frames, total, side });
  }
  list.append(sec);
}
const still = matchMedia('(prefers-reduced-motion: reduce)');
function tick(now) {
  for (const p of players) {
    if (!p.img.complete || !p.img.naturalWidth) continue;
    let t = still.matches ? 0 : now % p.total;
    let i = 0;
    while (t >= p.frames[i][4]) { t -= p.frames[i][4]; i++; }
    const [x, y, w, h] = p.frames[i];
    p.ctx.imageSmoothingEnabled = false;
    p.ctx.clearRect(0, 0, p.side, p.side);
    p.ctx.drawImage(p.img, x, y, w, h, (p.side - w) / 2, (p.side - h) / 2, w, h);
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
document.querySelectorAll('[data-bg]').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('[data-bg]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  list.className = b.dataset.bg;
}));
</script>
</body>
</html>
"""

README = """# BellPals animations

Sprite sheets of the four BellPals (Ding, Chime, Jingle and Gong), ready to use in a game. They're exported from the BellPals prototype, so they move like they do in the app: in whole art pixels, with a stepped rhythm like a little LCD pet.

Open `preview.html` to watch every animation, or look at `overview.gif`.

## What's in the pack

| Folder | What it is |
|---|---|
| `sheets/` | A sprite sheet for each animation at full size (the size the app uses), up to 6 frames a row. Each has a JSON file with the frame boxes and how long each frame shows. |
| `sheets-half/` | The same sheets at half size. |
| `atlases/` | One half-size atlas per BellPal with all its animations, and a JSON file that names each animation's frames. Each fits in a 4096 px texture. |
| `frames/` | Every frame as its own full-size PNG, in `frames/<bellpal>/<animation>/`. |
| `gifs/` | A half-size animated preview of every animation. |
| `parts/` | The still poses and ground shadow of each BellPal, the effects (hearts, z's, sound waves, sparkles, Super and Mega crowns) and the four treats, for making your own animations. |
| `catalogue.json` | Frame counts, timings, sizes and anchor points for everything. |

Sheets ending in `-plain` have no effects (no hearts, z's, sound waves or crumbs), so you can add your own. Sheets ending in `-white` draw the z's and sound waves in white, for dark backgrounds (in the app, they're white on the dark ringing screen).

## Animations

| Name | What it shows | Who | Loop |
|---|---|---|---|
__ANIMS__

All the animations loop. Frames show for different lengths of time (an idle frame holds for 650 ms, a ringing one for 60 ms), so use each frame's `duration` from the JSON. Every frame lasts a whole number of ticks: if your engine plays frames at one fixed speed, set it to 1000 ÷ `tickMs` frames a second and hold each frame for its `ticks` (both are in `catalogue.json`).

Only Ding has walking, turning and sitting poses; the others walk by bouncing their one pose. For the Super and Mega forms, the app adds a crown on the head (and sparkles around Mega) and draws the BellPal a little bigger. The crowns are in `parts/fx/`. `catalogue.json` lists the top of the head in every frame (`headTop`), so a crown can move with the body: centre it there, sunk about one art pixel into the head.

## Sizes and anchor points

All of a BellPal's frames are the same size, with the feet in the same place, so switching animations never makes it jump. Set your sprite's pivot (also called anchor or origin) to the feet. Positions are in pixels from the top left of a full-size frame.

| BellPal | Frame, full size | Frame, half size | Feet (pivot) | Mouth | Top of head |
|---|---|---|---|---|---|
__SIZES__

For the half-size files, halve these numbers (frame sizes and feet halve exactly). As shares of the frame, the feet are at `pivotNormalized` in the JSON: for Ding, 0.5 across and __PIVOT_Y__ down. Unity measures pivots from the bottom left, so use `pivotFromBottomLeft` there. The feet are always in the middle across, so mirrored frames line up too: Ding's `walk` faces right, so mirror it to walk left. The others face the front.

One art pixel is about 11 px at full size. The art started as generated pixel art that isn't on an exact pixel grid, so it can't be shrunk to true one-to-one pixels without distorting it. Use nearest-neighbour filtering to keep the pixels crisp when you scale it: Filter Mode Point in Unity, Texture Filter Nearest in Godot, `pixelArt: true` in Phaser, or `image-rendering: pixelated` in CSS.

## Loading it

The JSON files use Aseprite's format (frames as a hash keyed by frame number, with `meta.frameTags`), which many tools can read.

**Phaser 3.60 or later**

```js
// in preload()
this.load.aseprite('ding', 'atlases/ding.png', 'atlases/ding.json');

// in create()
const ding = this.add.sprite(200, 300, 'ding').setOrigin(0.5, __PIVOT_Y__); // pivotNormalized
ding.anims.createFromAseprite('ding');
ding.play({ key: 'idle', repeat: -1 });
```

**PixiJS 8**

```js
const sheet = await Assets.load('atlases/ding.json');
const tag = sheet.data.meta.frameTags.find((t) => t.name === 'idle');
const ding = new AnimatedSprite(
  sheet.animations.idle.map((texture, i) => ({ texture, time: sheet.data.frames[tag.from + i].duration })),
);
ding.anchor.set(0.5, __PIVOT_Y__); // pivotNormalized
ding.play();
```

**Godot 4.** Add an AnimatedSprite2D. In its SpriteFrames panel, choose "Add frames from sprite sheet", pick a sheet from `sheets/` and set the grid to the `columns` and `rows` in its JSON. Set the animation's speed to 1000 ÷ `tickMs` FPS and each frame's duration to its `ticks`. Turn off Centered and set Offset to minus the feet position, so the node's position is where the feet stand.

**Unity.** Import a sheet from `sheets/`, set Sprite Mode to Multiple and Filter Mode to Point, then in the Sprite Editor slice it with Grid By Cell Size, using the frame size above and a custom pivot set to `pivotFromBottomLeft`.

**GameMaker, Construct, Defold and others.** Import a sheet from `sheets/` as a grid using the frame size above, or use the single PNGs in `frames/`.

## Making changes

The z's and sound waves are drawn in the BellPals' dark ink (#3B1D2F), as in the app. To re-export after changing the art, run `python3 scripts/export_animations.py` in the BellPals repo's `prototype/` folder.
"""


if __name__ == '__main__':
    main()
