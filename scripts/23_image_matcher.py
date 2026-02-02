import cv2
import os
import glob
import numpy as np
from skimage.metrics import structural_similarity as ssim
import shutil

def integrate_and_shrink_pool():
    base = os.path.dirname(os.path.abspath(__file__))
    
    # 指向你剛才說 match 成功的兩個資料夾
    ref_dir = os.path.abspath(os.path.join(base, '..', 'raw_data', 'icons_split'))
    new_dir = os.path.abspath(os.path.join(base, '..', 'raw_data', 'icons_pos_split'))
    
    # 1. 建立參考池 (Reference Pool)
    # 只抓 icon_001.png 這種原檔，避開已經產生的 _pos 檔
    ref_files = [f for f in glob.glob(os.path.join(ref_dir, "icon_*.png")) if "_pos" not in f]
    
    pool = []
    print(f"Loading {len(ref_files)} standard icons into the pool...")
    for path in ref_files:
        # 使用 imdecode 處理可能的路徑編碼問題
        img = cv2.imdecode(np.fromfile(path, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
        if img is not None:
            img = cv2.GaussianBlur(img, (3, 3), 0) # 輕微模糊增加比對穩定度
            pool.append({"filename": os.path.basename(path), "img": img})

    # 2. 處理待配對的新圖
    new_files = glob.glob(os.path.join(new_dir, "*.png"))
    new_files.sort() # 排序一下看起來比較療癒
    
    print(f"Starting match for {len(new_files)} icons...")
    match_count = 0

    for new_path in new_files:
        new_img = cv2.imdecode(np.fromfile(new_path, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
        if new_img is None: continue
        new_img = cv2.GaussianBlur(new_img, (3, 3), 0)

        best_s = -1.0
        best_match_idx = -1

        # 核心：與剩餘的 Pool 比對
        for idx, ref in enumerate(pool):
            target_h, target_w = new_img.shape
            ref_resized = cv2.resize(ref["img"], (target_w, target_h))
            
            s, _ = ssim(new_img, ref_resized, full=True)
            
            if s > best_s:
                best_s = s
                best_match_idx = idx

        # 3. 成功配對後的處理
        if best_match_idx != -1 and best_s > 0.70: # 門檻設為 70%
            # 從 Pool 中彈出 (Pop) 該對象，達成刪去法
            matched_item = pool.pop(best_match_idx)
            
            # 取得原名 (icon_001) 並加上 _pos
            original_name = os.path.splitext(matched_item["filename"])[0]
            final_name = f"{original_name}_pos.png"
            final_path = os.path.join(ref_dir, final_name)
            
            # 複製並重新命名到 icons_split
            shutil.copy2(new_path, final_path)
            
            match_count += 1
            if match_count % 10 == 0:
                print(f"Progress: {match_count}/402 | Pool remaining: {len(pool)}")
        else:
            print(f"FAIL: {os.path.basename(new_path)} (No confidence match)")

    print(f"\nIntegration Complete! {match_count} icons added to {ref_dir}")

if __name__ == "__main__":
    integrate_and_shrink_pool()