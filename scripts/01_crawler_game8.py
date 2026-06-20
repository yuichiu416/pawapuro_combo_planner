"""
Scrapes the 2026-2027 special ability list from game8.jp and outputs
skills.json into src/data/ (shared across versions).

Source: https://game8.jp/pawapuro2026-2027/787954

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

# Map game8 type labels to internal type codes
TYPE_MAP = {
    '金': 'gold',
    '青': 'blue',
    '赤': 'red',
    '緑': 'green',
}

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
        # Scroll to load all rows
        for _ in range(30):
            page.evaluate("window.scrollBy(0, 800)")
            time.sleep(0.1)
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(1.5)
        html = page.content()
        browser.close()
    return html

def parse(html):
    soup  = BeautifulSoup(html, 'html.parser')
    skills = {}

    # Find the main skills table — has columns: 特殊能力 | 種類・効果 | 種類 | 新特殊能力
    table = None
    for t in soup.find_all('table'):
        ths = [th.get_text(strip=True) for th in t.find_all('th')]
        if any('特殊能力' in h for h in ths) and any('種類' in h for h in ths):
            table = t
            break

    if not table:
        print("ERROR: Skills table not found. Page structure may have changed.")
        sys.exit(1)

    for row in table.find_all('tr')[1:]:
        cols = row.find_all('td')
        if len(cols) < 3:
            continue

        name      = cols[0].get_text(strip=True)
        type_text = cols[2].get_text(strip=True)  # 金/青/赤/緑
        effect    = cols[1].get_text(separator=' ', strip=True)

        # Strip type prefix from effect text e.g. "金特  ---  効果..."
        effect = re.sub(r'^(金|青|赤|緑)特\s*[-ー－]+\s*', '', effect).strip()

        if not name:
            continue

        skill_type = TYPE_MAP.get(type_text, 'normal')
        is_new     = len(cols) > 3 and bool(cols[3].get_text(strip=True))

        skills[name] = {
            'type':   skill_type,
            'effect': effect,
            'is_new': is_new,
        }

    return skills

def run():
    html   = fetch_html()
    skills = parse(html)

    if not skills:
        print("❌ No skills parsed — aborting write to avoid overwriting existing data.")
        return

    # Load existing skills.json and merge (preserve any manual additions)
    existing = {}
    if os.path.exists(OUTPUT_PATH):
        with open(OUTPUT_PATH, 'r', encoding='utf-8') as f:
            existing = json.load(f)

    merged = {**existing, **skills}  # new data wins on conflicts

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

    print(f"✅ {len(skills)} skills scraped ({len(skills) - len(existing):+d} vs existing) → {OUTPUT_PATH}")

    by_type = {}
    for v in skills.values():
        t = v['type']
        by_type[t] = by_type.get(t, 0) + 1
    print(f"  Breakdown: {by_type}")
    new_count = sum(1 for v in skills.values() if v.get('is_new'))
    if new_count:
        print(f"  New 2026-2027 skills: {new_count}")

if __name__ == '__main__':
    run()
