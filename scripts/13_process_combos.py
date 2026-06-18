import pandas as pd
import json
import os
import re
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from sanitizer import sanitize_name, standardize_symbols

VERSION    = '2026-2027'
RAW_DIR    = os.path.normpath(os.path.join(current_dir, '..', 'raw_data'))
DATA_DIR   = os.path.normpath(os.path.join(current_dir, '..', 'src', 'data', VERSION))

COMBO_FILE      = os.path.join(RAW_DIR,  f'combos_{VERSION}.xlsx')
SKILLS_FILE     = os.path.join(DATA_DIR, 'skills.json')          # shared across versions
SKILLS_FILE_FALLBACK = os.path.normpath(os.path.join(current_dir, '..', 'src', 'data', 'skills.json'))
CHAR_MAP_FILE   = os.path.join(DATA_DIR, 'character_mapping.json')
CHARACTERS_FILE = os.path.join(DATA_DIR, 'characters.json')

def load_json(path):
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def parse_rewards(reward_str, skills_db):
    result = {"skills": [], "stats": {}}
    if not reward_str:
        return result

    reward_str = standardize_symbols(reward_str)

    for m in re.finditer(r'([^\d\+\-\s\t,，]+)Lv(\d+)', reward_str):
        s_name     = standardize_symbols(m.group(1).strip())
        s_lv       = int(m.group(2))
        is_verified = s_name in skills_db
        if not is_verified:
            print(f"🔍 [Typo Check] Skill '{s_name}' not in skills.json")
        result["skills"].append({"name": s_name, "level": s_lv, "verified": is_verified})

    return result

def process_combos(skills_db, mapping_db, characters_db):
    if not os.path.exists(COMBO_FILE):
        print(f"❌ Combo file not found: {COMBO_FILE}")
        return {}, {}

    df = pd.read_excel(COMBO_FILE, header=None)
    combos      = {}
    maps        = {}
    current_map = "Unknown"

    for _, row in df.iterrows():
        cells = [str(c).strip() if pd.notna(c) else "" for c in row]
        if not any(cells):
            continue

        # --- Map header ---
        map_match = re.search(r'【(.+?)】', cells[0])
        if map_match:
            current_map = map_match.group(1).replace('MAXコンボ', '').strip()
            row_full    = " ".join(cells)
            max_match   = re.search(r'MAXコンボ[數数](\d+)', row_full)
            maps[current_map] = {
                "max_combos":  int(max_match.group(1)) if max_match else 0,
                "combo_names": []
            }
            continue

        # --- Combo row (must contain &) ---
        combo_raw  = ""
        reward_raw = ""

        for i, cell in enumerate(cells):
            if '&' in cell:
                split_match = re.search(r'(.+?)(精神|筋力|技術|敏捷|変化|.+?Lv\d+.*)', cell)
                if split_match:
                    combo_raw  = split_match.group(1)
                    reward_raw = split_match.group(2) + " ".join(cells[i+1:])
                else:
                    combo_raw  = cell
                    reward_raw = " ".join(cells[i+1:])
                break

        if not combo_raw:
            continue

        char_names = [sanitize_name(c) for c in combo_raw.split('&')]

        for name in char_names:
            if name not in mapping_db.get("by_name", {}):
                print(f"⚠️  '{name}' missing from character_mapping.json")
            if name not in characters_db:
                print(f"❌  '{name}' missing from characters.json")

        combo_key          = "&".join(char_names)
        combos[combo_key]  = {
            "characters": char_names,
            "map":        current_map,
            "rewards":    parse_rewards(reward_raw, skills_db)
        }

        if current_map in maps:
            maps[current_map]["combo_names"].append(char_names)

    return combos, maps

def run():
    print(f"--- 🚀 [{VERSION}] Starting Combo Processing ---")

    skills_db    = load_json(SKILLS_FILE) or load_json(SKILLS_FILE_FALLBACK)
    mapping_db   = load_json(CHAR_MAP_FILE)
    characters_db = load_json(CHARACTERS_FILE)

    combo_dict, map_dict = process_combos(skills_db, mapping_db, characters_db)

    os.makedirs(DATA_DIR, exist_ok=True)

    combos_out = os.path.join(DATA_DIR, 'combos.json')
    maps_out   = os.path.join(DATA_DIR, 'maps.json')

    with open(combos_out, 'w', encoding='utf-8') as f:
        json.dump(combo_dict, f, ensure_ascii=False, indent=2)
    with open(maps_out, 'w', encoding='utf-8') as f:
        json.dump(map_dict, f, ensure_ascii=False, indent=2)

    print(f"[{VERSION}] ✅ {len(combo_dict)} combos, {len(map_dict)} maps → {DATA_DIR}")

if __name__ == "__main__":
    run()
