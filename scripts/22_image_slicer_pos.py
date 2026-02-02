import cv2
import os
import glob

# 使用你之前測試出的「完美座標」
GRID_START_X = 94 
GRID_START_Y = 168 
ICON_W = 102        
ICON_H = 102        
GAP_X = 18          
GAP_Y = 18          

def slice_new_version():
    input_dir = os.path.join('..', 'raw_data', 'screenshots_pos')
    output_dir = os.path.join('..', 'raw_data', 'icons_pos_split')
    
    if not os.path.exists(output_dir): os.makedirs(output_dir)
    
    files = sorted([f for f in os.listdir(input_dir) if f.lower().endswith(('.png', '.jpg'))])
    
    total = 0
    for file_idx, filename in enumerate(files):
        img = cv2.imread(os.path.join(input_dir, filename))
        if img is None: continue
        for row in range(4):
            for col in range(4):
                x = GRID_START_X + (col * (ICON_W + GAP_X))
                y = GRID_START_Y + (row * (ICON_H + GAP_Y))
                char_id = (file_idx * 16) + (row * 4) + col + 1
                if char_id > 402: break
                crop = img[y:y+ICON_H, x:x+ICON_W]
                cv2.imwrite(os.path.join(output_dir, f"pos_temp_{char_id:03d}.png"), crop)
                total += 1
    print(f"Sliced {total} new icons into icons_pos_split")

if __name__ == "__main__":
    slice_new_version()