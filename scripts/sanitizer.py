import re

def sanitize_name(name):
    """
    Cleans character names by removing brackets, manager titles, and extra spaces.
    """
    if not isinstance(name, str): return str(name)
    name = re.sub(r'[\(\（].*?[\)\）]', '', name)
    name = name.replace("−", "-").replace("—", "-").replace("－", "-")
    # Remove manager-related suffixes
    name = re.sub(r'(マネージャー|マネー|マネ)$', '', name.strip())
    name = name.replace(" ", "").replace("　", "")
    return name.strip()

def standardize_symbols(text):
    """
    Standardizes symbols like circles and specific Kanji to maintain consistency.
    """
    if not text: return text
    
    # 1. Standardize circles (〇, ０, etc -> ◯)
    symbols_to_fix = ["〇", "0", "０", "O", "○", "◎"]
    for s in symbols_to_fix:
        text = text.replace(s, "◯")
    
    # 2. Fix Kanji variations (e.g., 彈 -> 弾)
    text = text.replace("彈", "弾")
    
    # 3. Standardize hyphens
    text = text.replace("−", "-").replace("—", "-").replace("－", "-")
    
    return text

def parse_rewards_global(reward_str):
    """
    Consolidated reward parser for both Character and Combo scripts.
    Maintains Japanese keys for stats to ensure consistency.
    """
    result = {"skills": [], "stats": {}}
    if not reward_str or reward_str == "nan":
        return result

    # Standardize input string first
    reward_str = standardize_symbols(str(reward_str))

    # Split by commas, tabs, or spaces
    parts = [p.strip() for p in re.split(r'[,，\t\s]+', reward_str) if p.strip()]
    
    # Updated stat_map to keep Japanese keys
    # Maps variations (like '変化') to the standard '変化球'
    stat_map = {
        "筋力": "筋力", 
        "敏捷": "敏捷", 
        "技術": "技術",
        "変化球": "変化球", 
        "変化": "変化球", 
        "精神": "精神"
    }

    for part in parts:
        # 1. Check for Skill Level: e.g., "パワヒLv2"
        skill_match = re.search(r'(.+?)Lv(\d+)', part)
        
        # 2. Check for Stats: e.g., "変化球+9" or "技術 20"
        stat_match = re.search(r'([^\d\+\-\s]+)\s*([\+\-]?\d+)', part)

        if skill_match:
            s_name = standardize_symbols(skill_match.group(1).strip())
            result["skills"].append({
                "name": s_name,
                "level": int(skill_match.group(2))
            })
        elif stat_match:
            st_raw_name = stat_match.group(1).strip()
            if st_raw_name in stat_map:
                try:
                    val = int(stat_match.group(2))
                    # Uses the mapped Japanese name (e.g., "変化球")
                    result["stats"][stat_map[st_raw_name]] = val
                except: pass
            else:
                # If it's a number but not a known stat, treat as generic string
                result["skills"].append(part)
        else:
            # Fallback for generic strings (e.g., items or special flags)
            result["skills"].append(part)
            
    return result