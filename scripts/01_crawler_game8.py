import json
import os
import re
import sys

MANUAL_SKILLS = {
    "天才": {
        "name": "天才",
        "type": "gold",
        "category": "all",
        "description": "All stats significantly increased."
    }
}

def standardize(text):
    if not text: return ""
    return text.replace("○", "◯").replace("◎", "◯").replace("彈", "弾").strip()

def parse_file():
    # Paths relative to scripts/ folder
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    input_path = os.path.join(base_dir, 'raw_data', 'skills.txt')
    output_path = os.path.join(base_dir, 'src', 'data', 'skills.json')
    
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found.")
        sys.exit(1)

    skills_map = {}
    current_pos = "all"
    current_type = "blue"

    header_keywords = {
        "投手の金特": ("pitcher", "gold"),
        "野手の金特": ("fielder", "gold"),
        "捕手の金特": ("fielder", "gold"),
        "金特": ("all", "gold"),
        "投手の青特": ("pitcher", "blue"),
        "野手の青特": ("fielder", "blue"),
        "青特": ("all", "blue"),
        "投手の赤特": ("pitcher", "red"),
        "野手の赤特": ("fielder", "red"),
        "赤特": ("all", "red"),
        "青赤特能": ("all", "blue"),
        "数値によって色が変わる": ("all", "blue")
    }

    try:
        with open(input_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line: continue

                # Header detection
                is_header = False
                if "一覧" in line:
                    for key, (pos, sk_type) in header_keywords.items():
                        if key in line:
                            current_pos, current_type = pos, sk_type
                            is_header = True
                            break
                if is_header: continue

                # Noise filtering
                if any(line.startswith(x) for x in ["※", "特能", "効果", "▼"]): continue

                # Data capture
                match = re.match(r'^(\S+)\s+(.+)$', line)
                if match:
                    name = standardize(match.group(1))
                    desc = standardize(match.group(2))
                    if "効果" in name or len(name) < 2: continue

                    skills_map[name] = {
                        "name": name,
                        "type": current_type,
                        "category": current_pos,
                        "description": desc
                    }

        # Merge Manual Data
        for name, data in MANUAL_SKILLS.items():
            skills_map[name] = data

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(skills_map, f, ensure_ascii=False, indent=2)
        print(f"Done: {len(skills_map)} skills saved.")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    parse_file()