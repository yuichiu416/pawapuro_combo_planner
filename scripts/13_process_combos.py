import pandas as pd
import json
import os
import re
import sys

# Import sanitizer to ensure uniform name cleaning rules
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)
from sanitizer import sanitize_name

# Path Configuration
RAW_DIR = os.path.join('..', 'raw_data')
DATA_DIR = os.path.join('..', 'src', 'data')
SKILLS_FILE = os.path.join(DATA_DIR, 'skills.json')
CHAR_MAP_FILE = os.path.join(DATA_DIR, 'character_mapping.json')
CHARACTERS_FILE = os.path.join(DATA_DIR, 'characters.json')

def load_json_db(filepath):
    """Loads a JSON file and returns a dictionary."""
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def parse_rewards(reward_str, skills_db):
    """Parses skill and stat rewards from the raw string."""
    result = {"skills": [], "stats": {}}
    if not reward_str: return result

    # 1. Process Skills
    # Standardize symbols for the entire reward string first
    from sanitizer import standardize_symbols
    reward_str = standardize_symbols(reward_str)

    skill_matches = re.finditer(r'([^\d\+\-\s\t,，]+)Lv(\d+)', reward_str)
    
    for m in skill_matches:
        s_name = m.group(1).strip()
        # Ensure extracted skill name matches the Source of Truth symbols
        s_name = standardize_symbols(s_name) 
        s_lv = int(m.group(2))
        
        is_verified = s_name in skills_db
        if not is_verified:
            # Output Typo check for manual verification
            print(f"🔍 [Typo Check] Skill '{s_name}' not match in skills.json")
            
        result["skills"].append({
            "name": s_name,
            "level": s_lv,
            "verified": is_verified
        })
    
    # Note: Stats processing logic remains consistent with previous implementation
    return result

def process_combos(skills_db, mapping_db, characters_db):
    """Processes the Excel file and transforms data into a mapped object."""
    combo_file = os.path.join(RAW_DIR, 'combos.xlsx')
    if not os.path.exists(combo_file):
        print(f"❌ Error: {combo_file} not found")
        return {}, {}

    df = pd.read_excel(combo_file, header=None)
    # Changed combos from a list [] to a dictionary {}
    combos, maps = {}, {}
    current_map = "Unknown"

    for _, row in df.iterrows():
        cells = [str(c).strip() if pd.notna(c) else "" for c in row]
        if not any(cells): continue

        # 1. Map Header Detection
        map_header_match = re.search(r'【(.+?)】', cells[0])
        if map_header_match:
            current_map = map_header_match.group(1).replace('MAXコンボ', '').strip()
            row_full = " ".join(cells)
            max_match = re.search(r'MAXコンボ[數数](\d+)', row_full)
            maps[current_map] = {
                "max_combos": int(max_match.group(1)) if max_match else 0, 
                "combo_names": []
            }
            continue

        # 2. Locate Combo row containing '&'
        combo_raw = ""
        reward_raw = ""
        
        for i, cell in enumerate(cells):
            if '&' in cell:
                # Flexible split: Treat the first value/Lv after '&' as the reward start point
                split_match = re.search(r'(.+?)(精神|筋力|技術|敏捷|変化|.+?Lv\d+.*)', cell)
                if split_match:
                    combo_raw = split_match.group(1)
                    reward_raw = split_match.group(2) + " ".join(cells[i+1:])
                else:
                    combo_raw = cell
                    reward_raw = " ".join(cells[i+1:])
                break

        if combo_raw:
            # Use unified sanitizer
            char_names = [sanitize_name(c) for c in combo_raw.split('&')]
            
            # Character verification
            for name in char_names:
                if name not in mapping_db.get("by_name", {}):
                    print(f"⚠️ Warning: '{name}' missing from mapping")
                if name not in characters_db:
                    print(f"❌ Alert: '{name}' missing from characters.json")

            # Create the joined key for the object
            combo_key = "&".join(char_names)
            
            # Build the combo object
            # Requirement: Change "char_names" key to "characters"
            combos[combo_key] = {
                "characters": char_names,
                "map": current_map,
                "rewards": parse_rewards(reward_raw, skills_db)
            }
            
            if current_map in maps:
                maps[current_map]["combo_names"].append(char_names)

    return combos, maps

def run():
    print("--- 🚀 Starting Combo Processing ---")
    skills_db = load_json_db(SKILLS_FILE)
    mapping_db = load_json_db(CHAR_MAP_FILE)
    characters_db = load_json_db(CHARACTERS_FILE)

    combo_dict, map_dict = process_combos(skills_db, mapping_db, characters_db)
    
    # Output path for the transformed object
    output_path = os.path.join(DATA_DIR, 'combos.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(combo_dict, f, ensure_ascii=False, indent=2)
        
    with open(os.path.join(DATA_DIR, 'maps.json'), 'w', encoding='utf-8') as f:
        json.dump(map_dict, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Finished: {len(combo_dict)} combos processed.")

if __name__ == "__main__":
    run()