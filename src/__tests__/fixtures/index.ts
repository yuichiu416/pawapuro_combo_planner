// src/__tests__/fixtures/index.ts
import characters from './characters.mock.json';
import combos from './combos.mock.json';
import maps from './maps.mock.json';
import skills from './skills.mock.json';
import mapping from './character_mapping.mock.json';
import { vi } from 'vitest';

// Helper to generate a standardized set of "Generic" characters for limit testing
const generateGenericCharacters = () => {
  const chars: Record<string, any> = {
    "パワプロ": { name: "パワプロ", position: "内", encounter_map: "スカウ島" },
    "矢部明雄": { name: "矢部明雄", position: "外", encounter_map: "スカウ島" },
  };

  // 10 Pitchers (P1-P10)
  for (let i = 1; i <= 10; i++) chars[`P${i}`] = { name: `P${i}`, position: "投", encounter_map: "スカウ島" };
  // 20 Fielders (F1-F20)
  for (let i = 1; i <= 20; i++) chars[`F${i}`] = { name: `F${i}`, position: "外", encounter_map: "スカウ島" };
  // 5 Managers (M1-M5)
  for (let i = 1; i <= 5; i++) chars[`M${i}`] = { name: `M${i}`, position: "マ", encounter_map: "スカウ島" };

  return chars;
};

export const mockData = {
  characters: generateGenericCharacters(),
  combos,
  maps,
  skills,
  mapping
};

// src/__tests__/fixtures.ts
export const mockComboManagerResponse = {
  mapsData: mockData.maps,
  analysis: {
    stats: {},
    skills: [],
    missingCharacters: [],
    mapCompletion: {},
    roster: { 
      total: 0, pitcher: 0, fielder: 0, manager: 0, isValid: true,
      errors: { total: false, pitcher: false, fielder: false, manager: false }
    }
  },
  ownedChars: new Set(),
  selectedComboIds: new Set(),
  libraryGroups: { withCombo: [], noCombo: [] },
  characterMapping: { idToName: mockData.mapping },
  isSyncing: false,
  // Actions
  toggleCharacter: vi.fn(),
  toggleCombo: vi.fn(),
  toggleAllByType: vi.fn(),
  clearAll: vi.fn(),
  setOwnedChars: vi.fn(),
  setSelectedComboIds: vi.fn(),
  saveLocally: vi.fn(),
};

export const createMockComboManager = (overrides = {}) => {
  const defaultId = "パワプロ&矢部明雄";

  return {
    searchTerm: '',
    setSearchTerm: vi.fn(),
    filteredComboIds: [defaultId], // Or a list of all combo IDs if you want them visible by default
    mapsData: mockData.maps,
    characterMapping: mockData.mapping,
    libraryGroups: { withCombo: [], noCombo: [] },
    analysis: {
      stats: {},
      skills: [],
      missingCharacters: [],
      mapCompletion: {},
      roster: { 
        total: 2, pitcher: 0, fielder: 0, manager: 0, isValid: true,
        errors: { total: false, pitcher: false, fielder: false, manager: false }
      }
    },
    ownedChars: new Set(["パワプロ", "矢部明雄"]),
    selectedComboIds: new Set(),
    isSyncing: false,
    isSidebarCollapsed: false,
    expandedMaps: new Set(),
    // Actions
    toggleCharacter: vi.fn(),
    toggleCombo: vi.fn(),
    toggleAllByType: vi.fn(),
    clearAll: vi.fn(),
    setOwnedChars: vi.fn(),
    setSelectedComboIds: vi.fn(),
    saveLocally: vi.fn(() => new Date().toISOString()),
    setIsSidebarCollapsed: vi.fn(),
    onToggle: vi.fn(),
    ...overrides,
  };
};
