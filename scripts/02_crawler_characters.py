"""
Scrapes the パワフェス character list from game8.jp and outputs
character_mapping.json into src/data/2026-2027/.

Scrapes two pages:
  - Players: https://game8.jp/pawapuro2026-2027/787488
  - Managers: https://game8.jp/pawapuro2026-2027/788226

Usage:
    python scripts/02_crawler_characters.py

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

VERSION      = '2026-2027'
PLAYER_URL   = 'https://game8.jp/pawapuro2026-2027/787488'
MANAGER_URL  = 'https://game8.jp/pawapuro2026-2027/788226'
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR   = os.path.normpath(os.path.join(BASE_DIR, '..', 'src', 'data', VERSION))
OUTPUT_PATH  = os.path.join(OUTPUT_DIR, 'character_mapping.json')

POSITION_MAP = {
    '投手': '投', '捕手': '捕', '一塁手': '一', '二塁手': '二',
    '三塁手': '三', '遊撃手': '遊', '外野手': '外', 'マネージャー': 'マ',
}

SKIP_NAMES = {'パワプロ', '-', ''}

def fetch_html(url):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("ERROR: playwright not installed.")
        print("  pip install playwright && python -m playwright install chromium")
        sys.exit(1)

    print(f"Fetching: {url}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page    = browser.new_page()
        page.set_extra_http_headers({'Accept-Language': 'ja,en;q=0.9'})
        page.goto(url, wait_until='domcontentloaded', timeout=60000)
        page.wait_for_selector('table', timeout=15000)

        # Scroll gradually to trigger lazy-loaded rows
        for _ in range(30):
            page.evaluate("window.scrollBy(0, 800)")
            time.sleep(0.1)
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2.0)

        html = page.content()
        browser.close()
    return html

def parse_position(cell_html):
    for full, short in POSITION_MAP.items():
        if full in cell_html:
            return short
    return ''

def parse_players(html, combined):
    soup  = BeautifulSoup(html, 'html.parser')
    table = None
    for t in soup.find_all('table'):
        ths = [th.get_text(strip=True) for th in t.find_all('th')]
        if 'No.' in ths and any('選手' in h for h in ths):
            table = t
            break
    if not table:
        print("ERROR: Player table not found.")
        return

    skipped = []
    for row in table.find_all('tr')[1:]:
        cols = row.find_all('td')
        if len(cols) < 3:
            continue
        no_text   = cols[0].get_text(strip=True)
        name_text = cols[1].get_text(strip=True).replace('画像', '').strip()
        pos_html  = str(cols[3]) if len(cols) > 3 else ''
        mode_text = cols[5].get_text(strip=True) if len(cols) > 5 else ''

        if not re.match(r'^\d+$', no_text):
            continue
        char_id = int(no_text)
        if name_text in SKIP_NAMES:
            skipped.append(f"No.{char_id}: '{name_text}'")
            continue

        combined[str(char_id)] = {
            "id":           char_id,
            "name":         name_text,
            "position":     parse_position(pos_html),
            "mode":         mode_text,
            "img_standard": f"icon_{char_id:03d}.png",
            "img_pos":      f"icon_{char_id:03d}_pos.png",
        }

    print(f"  Players parsed: {len(combined)} | Skipped: {skipped}")

def parse_managers(html, combined):
    soup  = BeautifulSoup(html, 'html.parser')
    table = None
    for t in soup.find_all('table'):
        ths = [th.get_text(strip=True) for th in t.find_all('th')]
        if any('マネージャー' in h for h in ths):
            table = t
            break
    if not table:
        print("WARNING: Manager table not found.")
        return

    # Build name lookup from existing entries
    existing_names = {v['name'] for v in combined.values()}

    new_count = 0
    for row in table.find_all('tr')[1:]:
        cols = row.find_all('td')
        if not cols:
            continue
        # Name is in an <a> tag — get_text() would also grab "No : N" plain text
        anchor = cols[0].find('a')
        name_text = anchor.get_text(strip=True) if anchor else ''
        if not name_text or len(name_text) < 2:
            continue

        # Extract manager ID from "No : 357" text node in the same cell
        full_text = cols[0].get_text(strip=True)
        no_match  = re.search(r'No\s*[：:]\s*(\d+)', full_text)
        mgr_id    = int(no_match.group(1)) if no_match else None

        # Mark existing entries as manager if already found in player list
        if name_text in existing_names:
            for v in combined.values():
                if v['name'] == name_text:
                    v['position'] = 'マ'
            continue

        # New manager not on player page — add with temp key
        new_count += 1
        img_std = f"icon_{mgr_id:03d}.png" if mgr_id else "placeholder.png"
        img_pos = f"icon_{mgr_id:03d}_pos.png" if mgr_id else "placeholder.png"
        combined[f"mgr_{new_count}"] = {
            "id":           mgr_id,
            "name":         name_text,
            "position":     "マ",
            "mode":         "",
            "img_standard": img_std,
            "img_pos":      img_pos,
        }

    print(f"  New managers added: {new_count}")

def scrape():
    combined = {}
    parse_players(fetch_html(PLAYER_URL), combined)
    parse_managers(fetch_html(MANAGER_URL), combined)

    final_json = {"by_id": {}, "by_name": {}}
    for key, info in combined.items():
        if info['id'] is not None:
            final_json["by_id"][str(info['id'])] = info
        final_json["by_name"][info['name']] = info

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(final_json, f, ensure_ascii=False, indent=2)

    count = len(final_json["by_name"])
    print(f"\n[{VERSION}] ✅ {count} total characters → {OUTPUT_PATH}")
    if count < 400:
        print(f"  ⚠️  Only {count}/405 — player table may still be partially loaded.")
        print(f"     Try running again or wait for game8 to finish updating the page.")

if __name__ == '__main__':
    scrape()
