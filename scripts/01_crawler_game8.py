import requests
from bs4 import BeautifulSoup
import json
import os
import re

def standardize_symbols(text):
    """
    Standardizes Japanese symbols to match the project's 'Source of Truth'.
    Converts various circles to ◯ and fixes Kanji variations like 弾 vs 彈.
    """
    if not text:
        return text
    
    # Standardize circles (Various circles -> ◯)
    circles = ["〇", "0", "０", "O", "○", "◎"]
    for c in circles:
        text = text.replace(c, "◯")
    
    # Fix Kanji variations (Traditional '彈' -> Japanese '弾')
    text = text.replace("彈", "弾")
    
    # Standardize dashes/hyphens
    text = text.replace("−", "-").replace("—", "-").replace("－", "-")
    
    return text

def crawl_game8():
    # Configuration
    URL = "https://game8.jp/pawapuro2024-2025/625743"
    OUTPUT_DIR = os.path.join('..', 'src', 'data')
    OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'skills.json')
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 1. Manual Skill Definitions
    # Including 'Removal' hints as special entries to avoid Typo Checks in Combos.
    manual_skills = {
        # Base Stats (Green)
        "球速": "green", "ミート": "green", "パワー": "green", "走力": "green", 
        "肩力": "green", "守備力": "green", "守備": "green", "捕球": "green", 
        "コントロール": "green", "スタミナ": "green", "弾道": "green", "選球眼": "green",
        "投手調子安定": "green", "捕球コツ": "green",
        # Positions (Green)
        "サブポジ捕手": "green", "サプポジ捕手": "green", "サブポジ一塁": "green", 
        "サブポジ二塁": "green", "サブポジ三塁": "green", "サブポジ遊撃": "green", "サブポジ外野": "green",
        # Pitches (Blue)
        "スライダー": "blue", "Hスライダー": "blue", "カーブ": "blue", "Dカーブ": "blue", 
        "フォーク": "blue", "Vスライダー": "blue", "シンカー": "blue", "Hシンカー": "blue", 
        "シュート": "blue", "サークルチェンジ": "blue", "チェンジアップ": "blue", 
        "スラーブ": "blue", "ドロップ": "blue", "超スローボール": "blue", "球種シンカー": "blue",
        # Abbreviations/Special (Blue/Gold)
        "ヘッスラ": "blue", "プルヒ": "blue", "球持ち": "blue", "クロスファイアー": "blue",
        "国際大会◯": "blue", "気迫ヘッド": "gold",
        # Special Reward: Red Skill Removal Hints
        "スロースターター消す": {"type": "green", "desc": "Hint to remove 'Slow Starter' (スロースターター) red skill."},
        "寸前×を消す": {"type": "green", "desc": "Hint to remove 'Collapse in 9th' (寸前×) red skill."},
        "軽い球を消す": {"type": "green", "desc": "Hint to remove 'Light Ball' (軽い球) red skill."}
    }

    # 2. Blacklist to filter out navigation links/sidebars
    exclude_keywords = [
        "サクセス", "栄冠ナイン", "選手データ", "球場一覧", "攻略", 
        "クロスプレイ", "パワフェス", "一覧", "アップデート", "予約特典", 
        "操作方法", "序盤", "特殊能力"
    ]

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
    
    skills_map = {}

    # Initialize with manual skills
    for s_name, info in manual_skills.items():
        std_name = standardize_symbols(s_name)
        if isinstance(info, dict):
            skills_map[std_name] = {
                "name": std_name,
                "type": info["type"],
                "description": info["desc"]
            }
        else:
            skills_map[std_name] = {
                "name": std_name,
                "type": info,
                "description": "Base stat, position, or specific acquisition"
            }

    try:
        print(f"Fetching: {URL}")
        response = requests.get(URL, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        tables = soup.select('.a-table')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cols = row.find_all('td')
                
                if len(cols) >= 2:
                    raw_name_text = cols[0].get_text(separator=" ", strip=True)
                    clean_name = raw_name_text.split(' ')[0].split('(')[0].split('（')[0]
                    clean_name = standardize_symbols(clean_name)
                    
                    if not clean_name or clean_name in ["能力名", "效果", "条件", "効果"]:
                        continue
                    if any(key in clean_name for key in exclude_keywords):
                        continue
                    if len(clean_name) > 12 or "？" in clean_name:
                        continue
                    
                    effect = cols[1].get_text(strip=True)
                    row_full_text = row.get_text()
                    
                    # Determine Skill Type
                    skill_type = "blue"
                    if any(kw in row_full_text for kw in ["超特殊", "金特"]):
                        skill_type = "gold"
                    elif any(kw in row_full_text for kw in ["マイナス", "赤特"]):
                        skill_type = "red"
                    elif "緑特" in row_full_text:
                        skill_type = "green"

                    skills_map[clean_name] = {
                        "name": clean_name,
                        "type": skill_type,
                        "description": effect
                    }

        # Save to JSON
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(skills_map, f, ensure_ascii=False, indent=2)
            
        print(f"Success: Saved {len(skills_map)} skills to {OUTPUT_FILE}")

    except Exception as e:
        print(f"Error during execution: {e}")

if __name__ == "__main__":
    crawl_game8()