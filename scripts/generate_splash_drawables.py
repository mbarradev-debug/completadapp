"""
Generates Android splash screen drawables for all densities.
Run this after `npx expo prebuild --clean` to restore the custom splash design.

Usage:
    python3 scripts/generate_splash_drawables.py
"""
from PIL import Image, ImageDraw, ImageFont

FONT_PACIFICO = 'assets/fonts/Pacifico_Regular.ttf'
FONT_ELITE    = 'assets/fonts/SpecialElite_Regular.ttf'

DENSITIES = {
    'mdpi':    288,
    'hdpi':    432,
    'xhdpi':   576,
    'xxhdpi':  864,
    'xxxhdpi': 1152,
}


def fit_font(draw, text, font_path, start_size, max_width):
    size = start_size
    while size > 8:
        fnt = ImageFont.truetype(font_path, size)
        bb  = draw.textbbox((0, 0), text, font=fnt)
        if (bb[2] - bb[0]) <= max_width:
            return fnt, bb
        size -= 2
    fnt = ImageFont.truetype(font_path, size)
    return fnt, draw.textbbox((0, 0), text, font=fnt)


def generate():
    for density, size in DENSITIES.items():
        img   = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw  = ImageDraw.Draw(img)
        white = (255, 255, 255, 255)

        fnt_title, tb = fit_font(draw, 'Completadapp',   FONT_PACIFICO, int(size * 0.22), int(size * 0.65))
        fnt_sub,   sb = fit_font(draw, 'FUENTE DE SODA', FONT_ELITE,    int(size * 0.10), int(size * 0.42))

        tw, th = tb[2] - tb[0], tb[3] - tb[1]
        sw, sh = sb[2] - sb[0], sb[3] - sb[1]
        gap = int(size * 0.07)

        total_h = th + gap + sh
        ty = (size - total_h) // 2 - tb[1]
        tx = (size - tw) // 2 - tb[0]
        sy = ty + tb[1] + th + gap - sb[1]
        sx = (size - sw) // 2 - sb[0]

        draw.text((tx, ty), 'Completadapp',   font=fnt_title, fill=white)
        draw.text((sx, sy), 'FUENTE DE SODA', font=fnt_sub,   fill=white)

        path = f'android/app/src/main/res/drawable-{density}/splashscreen_logo.png'
        img.save(path, 'PNG')
        print(f'  {density}: {size}x{size}')

    # Also set splash background color to brand red
    import re, pathlib
    colors_path = pathlib.Path('android/app/src/main/res/values/colors.xml')
    if colors_path.exists():
        content = colors_path.read_text()
        content = re.sub(
            r'<color name="splashscreen_background">[^<]+</color>',
            '<color name="splashscreen_background">#C1272D</color>',
            content,
        )
        colors_path.write_text(content)
        print('  colors.xml: splashscreen_background → #C1272D')


if __name__ == '__main__':
    print('Generating Android splash drawables...')
    generate()
    print('Done.')
