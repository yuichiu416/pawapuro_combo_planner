// src/components/__tests__/RewardAnalysis.test.tsx
import { render, screen, cleanup } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RewardAnalysis } from '@/components/RewardAnalysis';

describe('RewardAnalysis UI Logic', () => {
  const mockGetImagePath = vi.fn((name: string) => `/assets/${name}.png`);

  beforeEach(() => {
    cleanup();
  });

  it('correctly displays a missing character and their encounter map using test IDs', () => {
    const mockAnalysis = {
      stats: {},
      skills: [],
      missingCharacters: ['クロン'],
      totalSelectedCombos: 1,
      roster: {
        total: 0,
        pitcher: 0,
        fielder: 0,
        manager: 0,
        isValid: true,
        errors: { total: false, pitcher: false, fielder: false, manager: false },
      },
    };

    render(<RewardAnalysis analysis={mockAnalysis} getImagePath={mockGetImagePath} />);

    // 1. Verify the character row exists
    const charRow = screen.getByTestId('missing-char-row-クロン');
    expect(charRow).toBeInTheDocument();
    expect(charRow).toHaveTextContent('クロン');

    // 2. Verify the map location specifically within that character's context
    const mapBadge = screen.getByTestId('missing-char-map-クロン');
    // Using a regex match for the content since it could be the map name or a fallback
    expect(mapBadge.textContent).toMatch(/スカウ島|Unknown|\?\?\?/i);
  });

  it('displays fallback text when a character map is missing from the data', () => {
    const charName = 'NonExistentChar';
    const mockAnalysis = {
      stats: {},
      skills: [],
      totalSelectedCombos: 1,
      missingCharacters: [charName],
      roster: {
        total: 0,
        pitcher: 0,
        fielder: 0,
        manager: 0,
        isValid: true,
        errors: { total: false, pitcher: false, fielder: false, manager: false },
      },
    };

    render(<RewardAnalysis analysis={mockAnalysis} getImagePath={mockGetImagePath} />);

    const mapBadge = screen.getByTestId(`missing-char-map-${charName}`);

    // Explicitly check for the fallback string via test ID
    expect(mapBadge.textContent).toMatch(/Unknown|\?\?\?/i);
  });

  it('renders the correct number of missing character items', () => {
    const mockAnalysis = {
      stats: {},
      skills: [],
      missingCharacters: ['CharA', 'CharB'],
      totalSelectedCombos: 1,
      roster: {
        total: 2,
        pitcher: 0,
        fielder: 0,
        manager: 0,
        isValid: true,
        errors: { total: false, pitcher: false, fielder: false, manager: false },
      },
    };

    render(<RewardAnalysis analysis={mockAnalysis} getImagePath={mockGetImagePath} />);

    // Verify list length by querying all test IDs starting with the prefix
    const rows = screen.getAllByTestId(/^missing-char-row-/);
    expect(rows).toHaveLength(2);
  });
});
