"""
Scrapes the 2026-2027 special ability list from game8.jp and outputs
skills.json into src/data/ (shared across versions).

Source: https://game8.jp/pawapuro2026-2027/787954

Also preserves 'category' field from any existing skills.json, and
infers category for new skills from the effect text.

Usage:
    python scripts/01_crawler_skills.py

Requires playwright:
    pip install playwright
    python -m playwright install chromium
"""
import json
import os
import re
import sys
import time

from bs4 import BeautifulSoup

BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
URL         = 'https://game8.jp/pawapuro2026-2027/787954'
OUTPUT_PATH = os.path.normpath(os.path.join(BASE_DIR, '..', 'src', 'data', 'skills.json'))

TYPE_MAP = {
    '金': 'gold',
    '青': 'blue',
    '赤': 'red',
    '緑': 'green',
}

# Keywords used to infer pitcher vs fielder category from effect text
PITCHER_HINTS = [
    '投球', '投手', 'ストレート', 'スタミナ', 'コントロール', '球速', '変化球', '変化量',
    'ノビ', '登板', '球威', '先発', 'リリーフ', '救援', '三振', '四球', '球質',
    'モーション', 'フォーク', 'スライダー', 'カーブ', 'シンカー', 'チェンジアップ',
]
FIELDER_HINTS = [
    '打者', '打力', '打撃', 'ミート', 'パワー', '走塁', '盗塁', 'ホームラン',
    '打球', '代打', '外野', '内野', '守備', '送球', '走力', '捕手', 'スライディング',
    'ベースラン', 'ヘッドスライディング', '安打', '強振', 'ライン',
]

def infer_category(effect: str) -> str | None:
    p = sum(1 for h in PITCHER_HINTS if h in effect)
    f = sum(1 for h in FIELDER_HINTS if h in effect)
    if p > f:   return 'pitcher'
    if f > p:   return 'fielder'
    return None  # ambiguous (e.g. 鉄人 — benefits all)

def fetch_html():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("ERROR: playwright not installed.")
        print("  pip install playwright && python -m playwright install chromium")
        sys.exit(1)

    print(f"Fetching: {URL}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page    = browser.new_page()
        page.set_extra_http_headers({'Accept-Language': 'ja,en;q=0.9'})
        page.goto(URL, wait_until='domcontentloaded', timeout=60000)
        page.wait_for_selector('table', timeout=15000)
        for _ in range(30):
            page.evaluate("window.scrollBy(0, 800)")
            time.sleep(0.1)
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(1.5)
        html = page.content()
        browser.close()
    return html

def parse(html, existing: dict) -> dict:
    soup   = BeautifulSoup(html, 'html.parser')
    skills = {}

    table = None
    for t in soup.find_all('table'):
        ths = [th.get_text(strip=True) for th in t.find_all('th')]
        if any('特殊能力' in h for h in ths) and any('種類' in h for h in ths):
            table = t
            break

    if not table:
        print("ERROR: Skills table not found.")
        sys.exit(1)

    for row in table.find_all('tr')[1:]:
        cols = row.find_all('td')
        if len(cols) < 3:
            continue

        name      = cols[0].get_text(strip=True)
        type_text = cols[2].get_text(strip=True)
        effect    = cols[1].get_text(separator=' ', strip=True)
        effect    = re.sub(r'^(金|青|赤|緑)特\s*[-ー－]+\s*', '', effect).strip()

        if not name:
            continue

        skill_type = TYPE_MAP.get(type_text, 'normal')

        # Preserve existing category and description, else infer/use scraped values
        category = (
            existing.get(name, {}).get('category')
            or infer_category(effect)
        )
        description = existing.get(name, {}).get('description') or effect

        entry = {
            'type':        skill_type,
            'description': description,
        }
        if category:
            entry['category'] = category

        skills[name] = entry

    return skills

def run():
    # Load existing to preserve categories
    existing = {}
    if os.path.exists(OUTPUT_PATH):
        with open(OUTPUT_PATH, 'r', encoding='utf-8') as f:
            existing = json.load(f)

    html   = fetch_html()
    skills = parse(html, existing)

    if not skills:
        print("❌ No skills parsed — aborting write.")
        return

    # Merge: new scraped data wins, existing fills gaps for anything not on the page
    merged = {**existing, **skills}

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

    with_cat = sum(1 for v in skills.values() if 'category' in v)
    print(f"✅ {len(skills)} skills scraped → {OUTPUT_PATH}")

    by_type = {}
    for v in skills.values():
        by_type[v['type']] = by_type.get(v['type'], 0) + 1
    print(f"  Type breakdown: {by_type}")
    with_cat = sum(1 for v in skills.values() if 'category' in v)
    print(f"  With category: {with_cat}/{len(skills)}")

if __name__ == '__main__':
    run()
