import cv2
import os
import glob

# Path Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_DIR = os.path.join(BASE_DIR, '..', 'raw_data', 'screenshots')
OUTPUT_DIR = os.path.join(BASE_DIR, '..', 'public', 'assets', 'icons_split')

# Updated Coordinates based on your OUTPUT images
GRID_START_X = 94   # 從 66 增加到 70 (向右移，徹底甩掉左側白邊)
GRID_START_Y = 168  # 從 188 減少到 185 (向上移，給頭部多一點空間)
ICON_W = 102        # 稍微縮小寬度，確保不會碰到右邊框
ICON_H = 102        # 調整高度，包住下方的編號
GAP_X = 18          # 增加水平間距
GAP_Y = 18          # 增加垂直間距

def slice_calibrated():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    files = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith(('.png', '.jpg'))]
    files.sort()

    if not files:
        print("No screenshots found in raw_data/screenshots")
        return

    total = 0
    for file_idx, filename in enumerate(files):
        img = cv2.imread(os.path.join(INPUT_DIR, filename))
        if img is None: continue
        
        # Ensure processing at 720p
        if img.shape[1] != 1280:
            img = cv2.resize(img, (1280, 720))

        for row in range(4):
            for col in range(4):
                # Calculate precise crop area
                x = GRID_START_X + (col * (ICON_W + GAP_X))
                y = GRID_START_Y + (row * (ICON_H + GAP_Y))
                
                # Global character ID (1-402)
                char_id = (file_idx * 16) + (row * 4) + col + 1
                
                crop = img[y:y+ICON_H, x:x+ICON_W]
                
                save_name = f"icon_{char_id:03d}.png"
                cv2.imwrite(os.path.join(OUTPUT_DIR, save_name), crop)
                total += 1

    print(f"Success! {total} icons extracted with calibrated coordinates.")

if __name__ == "__main__":
    slice_calibrated()