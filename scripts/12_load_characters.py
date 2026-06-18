import pandas as pd
import json
import os
import re
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from sanitizer import sanitize_name, parse_rewards_global

VERSION    = '2026-2027'
INPUT_FILE = os.path.normpath(os.path.join(current_dir, '..', 'raw_data', f'characters_{VERSION}.xlsx'))
OUTPUT_DIR = os.path.normpath(os.path.join(current_dir, '..', 'src', 'data', VERSION))
OUTPUT_PATH = os.path.join(OUTPUT_DIR, 'characters.json')

def run():
    if not os.path.exists(INPUT_FILE):
        print(f"❌ File not found: {INPUT_FILE}")
        print(f"   Place the character sheet at: {INPUT_FILE}")
        return

    df = pd.read_excel(INPUT_FILE, header=None)
    characters_map = {}
    current_map = "Unknown"

    for _, row in df.iterrows():
        cells = [str(c).strip() if pd.notna(c) else "" for c in row]
        row_str = "".join(cells)

        if not any(cells):
            continue

        # --- Map header detection ---
        # Supports both 【MapName】出現キャラ (old) and 【MapName】 alone (new)
        map_match = re.search(r'【(.+?)】', row_str)
        if map_match:
            current_map = map_match.group(1).replace('出現キャラ', '').strip()
            continue

        # --- Character row ---
        pos      = cells[0]
        raw_name = cells[1] if len(cells) > 1 else ""

        if len(pos) > 2 and not raw_name:
            raw_name = pos
            pos = ""

        is_mgr = any(k in raw_name or k in pos for k in ["マネージャー", "マネー", "マネ"])
        name   = sanitize_name(raw_name)

        if name in ("", "nan") or "【" in name or name in ("名前", "キャラ名"):
            continue

        final_pos  = "マ" if is_mgr else pos
        reward_raw = cells[2] if len(cells) > 2 and cells[2] not in ("", "nan") else ""

        if not reward_raw:
            name_parts = raw_name.split(None, 1)
            if len(name_parts) > 1:
                name       = sanitize_name(name_parts[0])
                reward_raw = name_parts[1]

        char_data = {
            "name":          name,
            "position":      final_pos,
            "encounter_map": current_map
        }

        if is_mgr:
            char_data["description"] = reward_raw.replace('\n', ' ').strip()
        else:
            char_data["rewards"] = parse_rewards_global(reward_raw)

        characters_map[name] = char_data

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(characters_map, f, ensure_ascii=False, indent=2)

    print(f"[{VERSION}] ✅ {len(characters_map)} characters → {OUTPUT_PATH}")

if __name__ == "__main__":
    run()
