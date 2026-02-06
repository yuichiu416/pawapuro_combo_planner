import json
import os

# Configuration: Directories based on your project structure
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'src', 'data')
FIXTURES_DIR = os.path.join(BASE_DIR, 'src', 'logic', '__tests__', 'fixtures')

# Define the boundaries for your test suite (Minimum Viable Dataset)
TARGET_CHAR_NAMES = ["郡司知将", "エミリ", "クロン"]

def load_json(filename):
    """Helper to load JSON files from the raw data directory."""
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def save_mock_json(filename, data):
    """Helper to save filtered JSON data into the test fixtures directory."""
    if not os.path.exists(FIXTURES_DIR):
        os.makedirs(FIXTURES_DIR)
    path = os.path.join(FIXTURES_DIR, filename)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def run_generate_mocks():
    print("🚀 Starting Refined Mock Generation...")

    # 1. Load All Source Data (The Source of Truth)
    chars_src = load_json('characters.json')
    combos_src = load_json('combos.json')
    skills_src = load_json('skills.json')
    mapping_src = load_json('character_mapping.json')
    maps_src = load_json('maps.json')

    if not all([chars_src, combos_src, skills_src, mapping_src, maps_src]):
        print("❌ Error: Missing source JSON files in src/data. Please check file paths.")
        return

    # 2. Filter Characters
    # We copy the data and prune the 'description' to keep the mock file readable.
    mock_chars = {}
    for name in TARGET_CHAR_NAMES:
        if name in chars_src:
            char_data = chars_src[name].copy()
            char_data["description"] = "Mock description for testing"
            mock_chars[name] = char_data

    # 3. Filter Combos & Track Dependencies
    # We extract combos containing our target characters and track which skills/maps they use.
    mock_combos = []
    used_skill_names = set()
    used_map_names = set()
    
    for combo in combos_src:
        participants = combo.get('char_names', [])
        if any(name in mock_chars for name in participants):
            mock_combos.append(combo)
            
            # Extract skills listed in the combo rewards
            for sk in combo.get('rewards', {}).get('skills', []):
                used_skill_names.add(sk['name'])
            
            # Track the map restriction for this combo
            if 'map' in combo and combo['map']:
                used_map_names.add(combo['map'])

    # 4. Filter Skills
    # Only include skills that actually appear in our filtered combos.
    mock_skills = {name: skills_src[name] for name in used_skill_names if name in skills_src}

    # 5. Filter Character Mapping
    # Essential for UI/Logic tests that rely on IDs or icon paths.
    mock_mapping = {"by_id": {}, "by_name": {}}
    for name in TARGET_CHAR_NAMES:
        if name in mapping_src.get("by_name", {}):
            entry = mapping_src["by_name"][name]
            mock_mapping["by_name"][name] = entry
            mock_mapping["by_id"][str(entry["id"])] = entry

    # 6. Filter Maps (Matching + Control Group)
    # A Staff Engineer's approach: provide one matched map and one unmatched map
    # to test positive and negative filtering logic.
    mock_maps = {}
    
    # Add maps used by our target combos
    for m_name in used_map_names:
        if m_name in maps_src:
            mock_maps[m_name] = maps_src[m_name]
    
    # Add one 'Control' map (unused by target combos) to test filtering/isolation
    unused_maps = [name for name in maps_src if name not in used_map_names]
    if unused_maps:
        control_map_name = unused_maps[0]
        mock_maps[control_map_name] = maps_src[control_map_name]

    # 7. Final Output Registry
    output_registry = {
        'characters.mock.json': mock_chars,
        'combos.mock.json': mock_combos,
        'skills.mock.json': mock_skills,
        'character_mapping.mock.json': mock_mapping,
        'maps.mock.json': mock_maps
    }

    # Execute saving and print summaries
    for filename, data in output_registry.items():
        save_mock_json(filename, data)
        # Count varies by dict (keys) or list (length)
        item_count = len(data) if isinstance(data, (dict, list)) else 1
        print(f"✅ Generated: {filename} ({item_count} items)")

    print("\n✨ Clean, isolated test fixtures generated in src/logic/__tests__/fixtures/")

if __name__ == "__main__":
    run_generate_mocks()