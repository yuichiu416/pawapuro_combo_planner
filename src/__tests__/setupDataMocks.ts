// src/__tests__/setupDataMocks.ts
import { vi } from 'vitest';
import { mockData } from './fixtures';

vi.mock('@/data/characters.json', () => ({
  default: mockData.characters
}));

vi.mock('@/data/combos.json', () => ({
  default: mockData.combos
}));

vi.mock('@/data/maps.json', () => ({
  default: mockData.maps
}));

vi.mock('@/data/skills.json', () => ({
  default: mockData.skills
}));

vi.mock('@/data/character_mapping.json', () => ({
  default: mockData.mapping
}));