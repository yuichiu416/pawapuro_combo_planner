import { render, screen } from '@testing-library/react';
import App from '../../App';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../hooks/useComboManager', () => ({
  useComboManager: () => ({
    mapsData: {
      "スカウ島": { combo_names: [["CharA", "CharB"]] }
    },
    analysis: {
      mapCompletion: {
        "スカウ島": { selected: 1, total: 1 }
      },
      // Fix: RewardAnalysis needs these to avoid the .length crash
      missingCharacters: [], 
      roster: { isValid: true, errors: {} },
      stats: {},
      skills: []
    },
    ownedChars: new Set(),
    selectedComboIds: new Set(),
    libraryGroups: { withCombo: [], noCombo: [] },
    characterMapping: { idToName: { by_name: {} } },
    clearAll: vi.fn(),
    setOwnedChars: vi.fn(),
    setSelectedComboIds: vi.fn(),
    toggleAllByType: vi.fn()
  })
}));

describe('Map Progress Integration', () => {
  it('should display the "Combos: 1/1" label on the map section header', async () => {
    render(<App />);

    // This should now FAIL with "Unable to find element", which is what we want!
    const progressLabel = await screen.findByText(/Combos: 1\/1/i);
    expect(progressLabel).toBeDefined();
    expect(progressLabel.className).toContain('text-emerald-700');
  });
});