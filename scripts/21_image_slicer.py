import cv2
import os
import sys

# Pass the game version as an argument, e.g.: python 21_image_slicer.py 2026-2027
VERSION = sys.argv[1] if len(sys.argv) > 1 else '2026-2027'

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_DIR = os.path.join(BASE_DIR, '..', 'raw_data', 'screenshots', 'no_icon')
OUTPUT_DIR = os.path.join(BASE_DIR, '..', 'public', 'assets', f'icons_split_{VERSION}')

# Grid coordinates — calibrated for 1280x720 screenshots
GRID_START_X = 89
GRID_START_Y = 153
ICON_W = 104
ICON_H = 104
GAP_X  = 19
GAP_Y  = 19
COLS   = 4
ROWS   = 4

def slice_calibrated():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    files = sorted([f for f in os.listdir(INPUT_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg'))],
    key=lambda f: int(os.path.splitext(f)[0])
)

    if not files:
        print(f"No screenshots found in {INPUT_DIR}")
        return

    total = 0
    for file_idx, filename in enumerate(files):
        img = cv2.imread(os.path.join(INPUT_DIR, filename))
        if img is None:
            continue

        # Normalise to 1280x720
        if img.shape[1] != 1280:
            img = cv2.resize(img, (1280, 720))

        for row in range(ROWS):
            for col in range(COLS):
                x = GRID_START_X + (col * (ICON_W + GAP_X))
                y = GRID_START_Y + (row * (ICON_H + GAP_Y))
                char_id = (file_idx * COLS * ROWS) + (row * COLS) + col + 1

                crop = img[y:y+ICON_H, x:x+ICON_W]
                save_name = f"icon_{char_id:03d}.png"
                cv2.imwrite(os.path.join(OUTPUT_DIR, save_name), crop)
                total += 1

    print(f"[{VERSION}] {total} icons extracted → {OUTPUT_DIR}")

if __name__ == "__main__":
    slice_calibrated()
