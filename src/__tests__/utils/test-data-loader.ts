// File: src/logic/__tests__/utils/test-data-loader.ts

import charactersMock from '../fixtures/characters.mock.json';
import combosMock from '../fixtures/combos.mock.json';
import mappingMock from '../fixtures/character_mapping.mock.json';
import skillsMock from '../fixtures/skills.mock.json';
import mapsMock from '../fixtures/maps.mock.json';

/**
 * Converts character mock object to an array for component consumption.
 */
export const getMockCharacterList = () => {
  return Object.values(charactersMock);
};

export {
  charactersMock,
  combosMock,
  mappingMock,
  skillsMock,
  mapsMock
};