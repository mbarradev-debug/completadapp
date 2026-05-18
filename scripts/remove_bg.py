#!/usr/bin/env python3
"""
Remove checkerboard background from pixel art PNGs.

The checkerboard has two gray shades (~68 and ~124). A plain distance-based
flood-fill stops at the boundary between them. Instead we classify pixels as
"background" using a grayscale + brightness test, then flood-fill through that
connected region starting from all 4 corners.
"""
import sys
from collections import deque
from PIL import Image


def is_bg(px, max_channel_spread=12, lo=40, hi=140):
    """Return True if the pixel looks like the gray checkerboard.

    Conditions:
      - Nearly achromatic: difference between max and min channel < max_channel_spread
      - Brightness in the checkerboard range [lo, hi]
    """
    r, g, b = int(px[0]), int(px[1]), int(px[2])
    spread = max(r, g, b) - min(r, g, b)
    avg = (r + g + b) / 3
    return spread <= max_channel_spread and lo <= avg <= hi


def remove_background(input_path, output_path):
    img = Image.open(input_path).convert('RGBA')
    pixels = img.load()
    w, h = img.size

    visited = set()
    queue = deque([(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)])

    while queue:
        x, y = queue.popleft()
        if (x, y) in visited:
            continue
        if x < 0 or x >= w or y < 0 or y >= h:
            continue
        visited.add((x, y))

        px = pixels[x, y]
        if is_bg(px):
            pixels[x, y] = (0, 0, 0, 0)
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if (nx, ny) not in visited:
                    queue.append((nx, ny))

    img.save(output_path, 'PNG')
    print(f'  saved → {output_path}')


if __name__ == '__main__':
    for path in sys.argv[1:]:
        print(f'processing {path}')
        remove_background(path, path)
