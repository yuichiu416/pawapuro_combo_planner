import pandas as pd
import json
import os
import re
import sys

# 引入 sanitizer 確保名稱清洗規則統一
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
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def parse_rewards(reward_str, skills_db):
    result = {"skills": [], "stats": {}}
    if not reward_str: return result

    # 1. 處理技能
    # 先對整個獎勵字串做初步符號標準化
    from sanitizer import standardize_symbols
    reward_str = standardize_symbols(reward_str)

    skill_matches = re.finditer(r'([^\d\+\-\s\t,，]+)Lv(\d+)', reward_str)
    found_skills = []
    
    for m in skill_matches:
        s_name = m.group(1).strip()
        # 再次確保擷取出的技能名符合 Source of Truth 的符號
        s_name = standardize_symbols(s_name) 
        s_lv = int(m.group(2))
        
        is_verified = s_name in skills_db
        if not is_verified:
            # 這裡會噴出 Typo 提醒，方便你檢查是否還有漏網之魚的符號
            print(f"🔍 [Typo Check] Skill '{s_name}' not match in skills.json")
            
        result["skills"].append({
            "name": s_name,
            "level": s_lv,
            "verified": is_verified
        })
        found_skills.append(m.group(0))
    
    # ... (後續處理 stats 的邏輯保持不變)
    return result
def process_combos(skills_db, mapping_db, characters_db):
    combo_file = os.path.join(RAW_DIR, 'combos.xlsx')
    if not os.path.exists(combo_file):
        print(f"❌ Error: {combo_file} not found")
        return [], {}

    df = pd.read_excel(combo_file, header=None)
    combos, maps = [], {}
    current_map = "Unknown"

    for _, row in df.iterrows():
        cells = [str(c).strip() if pd.notna(c) else "" for c in row]
        if not any(cells): continue

        # 1. 地圖標題偵測
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

        # 2. 尋找包含 & 的 Combo 行
        combo_raw = ""
        reward_raw = ""
        
        # 尋找哪一個 cell 含有 '&'
        for i, cell in enumerate(cells):
            if '&' in cell:
                # 靈活切割：把 '&' 之後的第一個數值/Lv 當作獎勵開始點
                # 例如：カグヤ&小井成タマモ精神+15
                split_match = re.search(r'(.+?)(精神|筋力|技術|敏捷|変化|.+?Lv\d+.*)', cell)
                if split_match:
                    combo_raw = split_match.group(1)
                    reward_raw = split_match.group(2) + " ".join(cells[i+1:])
                else:
                    combo_raw = cell
                    reward_raw = " ".join(cells[i+1:])
                break

        if combo_raw:
            # 使用統一的 sanitize_name (保留男・矢部的點)
            char_names = [sanitize_name(c) for c in combo_raw.split('&')]
            
            # 驗證角色是否存在
            for name in char_names:
                if name not in mapping_db.get("by_name", {}):
                    print(f"⚠️ Warning: '{name}' missing from mapping (ID/Img will fail)")
                if name not in characters_db:
                    print(f"❌ Alert: '{name}' missing from characters.json (Excel character sheet)")

            combo_data = {
                "char_names": char_names,
                "map": current_map,
                "rewards": parse_rewards(reward_raw, skills_db)
            }
            combos.append(combo_data)
            
            if current_map in maps:
                maps[current_map]["combo_names"].append(char_names)

    return combos, maps

def run():
    print("--- 🚀 Starting Combo Processing ---")
    skills_db = load_json_db(SKILLS_FILE)
    mapping_db = load_json_db(CHAR_MAP_FILE)
    characters_db = load_json_db(CHARACTERS_FILE)

    combo_list, map_dict = process_combos(skills_db, mapping_db, characters_db)
    
    with open(os.path.join(DATA_DIR, 'combos.json'), 'w', encoding='utf-8') as f:
        json.dump(combo_list, f, ensure_ascii=False, indent=2)
    with open(os.path.join(DATA_DIR, 'maps.json'), 'w', encoding='utf-8') as f:
        json.dump(map_dict, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Finished: {len(combo_list)} combos processed.")

if __name__ == "__main__":
    run()