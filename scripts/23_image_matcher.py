import cv2
import os
import sys
import glob
import numpy as np
from skimage.metrics import structural_similarity as ssim
import shutil

# Pass the game version as an argument, e.g.: python 23_image_matcher.py 2026-2027
VERSION = sys.argv[1] if len(sys.argv) > 1 else '2026-2027'

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
# no-icon folder (output of 21_image_slicer.py)
REF_DIR   = os.path.abspath(os.path.join(BASE_DIR, '..', 'public', 'assets', f'icons_split_{VERSION}'))
# pos-icon folder (output of 22_image_slicer_pos.py)
NEW_DIR   = os.path.abspath(os.path.join(BASE_DIR, '..', 'raw_data', f'icons_pos_split_{VERSION}'))

SSIM_THRESHOLD = 0.70

def integrate_and_shrink_pool():
    if not os.path.exists(REF_DIR):
        print(f"ERROR: ref dir not found: {REF_DIR}")
        print("Run 21_image_slicer.py first.")
        return
    if not os.path.exists(NEW_DIR):
        print(f"ERROR: pos dir not found: {NEW_DIR}")
        print("Run 22_image_slicer_pos.py first.")
        return

    # Build reference pool from plain icon_NNN.png (no _pos files)
    ref_files = [f for f in glob.glob(os.path.join(REF_DIR, "icon_*.png")) if "_pos" not in f]
    pool = []
    print(f"[{VERSION}] Loading {len(ref_files)} standard icons into pool...")
    for path in sorted(ref_files):
        img = cv2.imdecode(np.fromfile(path, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
        if img is not None:
            img = cv2.GaussianBlur(img, (3, 3), 0)
            pool.append({"filename": os.path.basename(path), "img": img})

    new_files = sorted(glob.glob(os.path.join(NEW_DIR, "*.png")))
    total = len(new_files)
    print(f"[{VERSION}] Matching {total} pos icons...")

    match_count = 0
    fail_count  = 0

    for new_path in new_files:
        new_img = cv2.imdecode(np.fromfile(new_path, dtype=np.uint8), cv2.IMREAD_GRAYSCALE)
        if new_img is None:
            continue
        new_img = cv2.GaussianBlur(new_img, (3, 3), 0)

        best_score = -1.0
        best_idx   = -1

        for idx, ref in enumerate(pool):
            h, w = new_img.shape
            ref_resized = cv2.resize(ref["img"], (w, h))
            score, _ = ssim(new_img, ref_resized, full=True)
            if score > best_score:
                best_score = score
                best_idx   = idx

        if best_idx != -1 and best_score >= SSIM_THRESHOLD:
            matched = pool.pop(best_idx)
            base_name  = os.path.splitext(matched["filename"])[0]  # icon_001
            final_name = f"{base_name}_pos.png"
            shutil.copy2(new_path, os.path.join(REF_DIR, final_name))
            match_count += 1
            if match_count % 20 == 0:
                print(f"  {match_count}/{total} matched | pool remaining: {len(pool)}")
        else:
            print(f"  FAIL: {os.path.basename(new_path)} (best score: {best_score:.3f})")
            fail_count += 1

    print(f"\n[{VERSION}] Done — {match_count} matched, {fail_count} failed → {REF_DIR}")
    if pool:
        print(f"  Unmatched in pool: {[p['filename'] for p in pool]}")

if __name__ == "__main__":
    integrate_and_shrink_pool()
