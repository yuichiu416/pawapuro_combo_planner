import json
import os
import re
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from sanitizer import sanitize_name

# ============================================================
# 2026-2027 CHARACTER LIST
# Format: <id> <name>画像 ...
# Replace this block each new version. IDs must match the
# in-game 図鑑 order (No.001, No.002, ...) exactly.
# ============================================================
raw_data = """
PASTE_2026_2027_CHARACTER_LIST_HERE
"""

VERSION    = '2026-2027'
OUTPUT_DIR = os.path.normpath(os.path.join(current_dir, '..', 'src', 'data', VERSION))

def solve_mapping():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(OUTPUT_DIR, 'character_mapping.json')

    final_json = {"by_id": {}, "by_name": {}}

    lines = [line.strip() for line in raw_data.strip().split('\n') if line.strip()]

    for line in lines:
        if '画像' not in line:
            continue
        try:
            raw_content = line.split('画像')[0].strip()
            match = re.match(r'^(\d+)\s*(.*)$', raw_content)
            if not match:
                continue

            original_id = match.group(1)
            raw_name    = match.group(2)
            clean_name  = sanitize_name(raw_name)

            if not clean_name:
                continue

            char_info = {
                "id":           int(original_id),
                "name":         clean_name,
                "img_standard": f"icon_{int(original_id):03d}.png",
                "img_pos":      f"icon_{int(original_id):03d}_pos.png"
            }

            final_json["by_id"][str(original_id)] = char_info
            final_json["by_name"][clean_name]      = char_info

        except Exception as e:
            print(f"❌ Error processing line: {line}\n{e}")

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(final_json, f, ensure_ascii=False, indent=2)

    print(f"[{VERSION}] ✅ Mapping generated: {len(final_json['by_id'])} characters → {output_path}")

if __name__ == "__main__":
    solve_mapping()
