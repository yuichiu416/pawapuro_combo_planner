// src/__tests__/integration/ComboFilters.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '@/App';

describe('Combo Type Filters (Pitcher/Fielder) - Static Data Validation', () => {
  it('verifies exact match counts when PITCHER filter is active', async () => {
    render(<App />);

    // 1. Click PITCHER filter button
    const pitcherBtn = screen.getByTestId('filter-button-pitcher');
    fireEvent.click(pitcherBtn);

    // 2. Verify button state (Active)
    expect(pitcherBtn).toHaveClass('bg-amber-500');

    // 3. Verify exact COMBOS FOUND counts (Based on Screenshot 1)
    const expectedMatches = [
      { name: 'スカウ島', count: '4 COMBOS FOUND' },
      { name: 'スカウ島東海岸', count: '8 COMBOS FOUND' },
      { name: 'ハナレ島', count: '11 COMBOS FOUND' },
      { name: 'スカウ塔空中庭園', count: '7 COMBOS FOUND' },
      { name: 'スカウ塔空中庭園(空中マップ)', count: '6 COMBOS FOUND' },
    ];

    expectedMatches.forEach((map) => {
      const mapElement = screen.getByTestId(`map-trigger-${map.name}`);
      expect(mapElement).toHaveTextContent(new RegExp(map.count, 'i'));
    });
  });

  it('verifies exact match counts when FIELDER filter is active', async () => {
    render(<App />);

    // 1. Click FIELDER filter button
    const fielderBtn = screen.getByTestId('filter-button-fielder');
    fireEvent.click(fielderBtn);

    // 2. Verify button state (Active)
    expect(fielderBtn).toHaveClass('bg-amber-500');

    // 3. Verify exact COMBOS FOUND counts (Based on Screenshot 2)
    const expectedMatches = [
      { name: 'スカウ島', count: '8 COMBOS FOUND' },
      { name: 'スカウ島東海岸', count: '11 COMBOS FOUND' },
      { name: 'ハナレ島', count: '13 COMBOS FOUND' },
      { name: 'スカウ塔空中庭園', count: '16 COMBOS FOUND' },
      { name: 'スカウ塔空中庭園(空中マップ)', count: '7 COMBOS FOUND' },
    ];

    expectedMatches.forEach((map) => {
      const mapElement = screen.getByTestId(`map-trigger-${map.name}`);
      expect(mapElement).toHaveTextContent(new RegExp(map.count, 'i'));
    });
  });

  it('resets match counts when CLEAR is clicked', () => {
    render(<App />);

    const pitcherBtn = screen.getByTestId('filter-button-pitcher');
    const clearBtn = screen.getByTestId('filter-button-clear');

    // Apply filter
    fireEvent.click(pitcherBtn);
    expect(pitcherBtn).toHaveClass('bg-amber-500');

    // Click Clear
    fireEvent.click(clearBtn);

    // Verify reset
    expect(pitcherBtn).not.toHaveClass('bg-amber-500');

    // Verify that the count for Scouter Island is no longer the filtered '4'
    const scouterIsland = screen.getByTestId('map-trigger-スカウ島');
    expect(scouterIsland).not.toHaveTextContent('4 COMBOS FOUND');
  });
});
