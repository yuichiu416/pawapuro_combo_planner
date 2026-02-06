import pandas as pd
import json
import os
import re
import sys

# Add the current script's directory to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from sanitizer import sanitize_name, parse_rewards_global

# Path Configuration
INPUT_FILE = os.path.normpath(os.path.join(current_dir, '..', 'raw_data', 'characters.xlsx'))
OUTPUT_PATH = os.path.normpath(os.path.join(current_dir, '..', 'src', 'data', 'characters.json'))

def run():
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Error: File not found at {INPUT_FILE}")
        return

    df = pd.read_excel(INPUT_FILE, header=None)
    characters_map = {}
    current_map = "Unknown"

    for _, row in df.iterrows():
        cells = [str(c).strip() if pd.notna(c) else "" for c in row]
        row_str = "".join(cells)
        
        if not any(cells): continue

        # 1. Header Detection (Map)
        map_match = re.search(r'【(.+?)】', row_str)
        if map_match:
            current_map = map_match.group(1).replace('出現キャラ', '').strip()
            continue 

        # 2. Character Data & Position Detection
        pos = cells[0]
        raw_name = cells[1]
        
        if len(pos) > 2 and not raw_name:
            raw_name = pos
            pos = ""

        # Detect manager status
        is_mgr = any(k in raw_name or k in pos for k in ["マネージャー", "マネー", "マネ"])
        
        # Sanitize the name
        name = sanitize_name(raw_name)
        
        if name == "" or name == "nan" or "【" in name or name in ["名前", "キャラ名"]:
            continue

        # Override position if manager
        final_pos = "マ" if is_mgr else pos

        # 3. Reward / Description Handling
        reward_raw = cells[2] if len(cells) > 2 and cells[2] != "nan" else ""
        if not reward_raw:
            name_parts = raw_name.split(None, 1)
            if len(name_parts) > 1:
                name = sanitize_name(name_parts[0])
                reward_raw = name_parts[1]

        # 4. Populate logic branched by Manager status
        char_data = {
            "name": name,
            "position": final_pos,
            "encounter_map": current_map
        }

        if is_mgr:
            # Managers get a simple description string and NO rewards object
            char_data["description"] = reward_raw.replace('\n', ' ').strip()
        else:
            # Players get the parsed rewards object
            char_data["rewards"] = parse_rewards_global(reward_raw)

        characters_map[name] = char_data

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(characters_map, f, ensure_ascii=False, indent=2)

    print(f"✅ Success! Saved {len(characters_map)} characters.")

if __name__ == "__main__":
    run()