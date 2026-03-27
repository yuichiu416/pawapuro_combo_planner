// src/__tests__/integration/ComboFilters.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '@/App';

describe('Combo Type Filters (Pitcher/Fielder) - Static Data Validation', () => {
  // Utility to help check for the active orange state
  const ACTIVE_CLASS = 'bg-[#FF9E00]';

  it('verifies exact match counts when PITCHER filter is active', async () => {
    render(<App />);

    // 1. Click PITCHER filter button
    const pitcherBtn = screen.getByTestId('filter-pitcher-btn');
    fireEvent.click(pitcherBtn);

    // 2. Verify button state (Active) - Updated to match Pawapuro Orange
    expect(pitcherBtn).toHaveClass(ACTIVE_CLASS);
    expect(pitcherBtn).toHaveClass('ring-[#FF9E00]');

    // 3. Verify exact COMBOS FOUND counts
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
    const fielderBtn = screen.getByTestId('filter-fielder-btn');
    fireEvent.click(fielderBtn);

    // 2. Verify button state (Active) - Updated to match Pawapuro Orange
    expect(fielderBtn).toHaveClass(ACTIVE_CLASS);

    // 3. Verify exact COMBOS FOUND counts
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

  // src/__tests__/integration/ComboFilters.test.tsx
  it('resets match counts when CLEAR is clicked and confirmed', async () => {
    render(<App />);

    // 1. Activate a filter first
    const pitcherBtn = screen.getByTestId('filter-pitcher-btn');
    await fireEvent.click(pitcherBtn);

    // Verify it is active (Orange)
    expect(pitcherBtn).toHaveClass(ACTIVE_CLASS);

    // 2. Click the CLEAR button in the Header to open the modal
    const clearBtn = screen.getByTestId('filter-clear-btn');
    await fireEvent.click(clearBtn);

    // 3. Find and click the "YES, WIPE IT!" button in the ClearConfirmModal
    const confirmBtn = screen.getByTestId('modal-confirm-btn');
    await fireEvent.click(confirmBtn);

    // 4. Verify reset (Should return to white background)
    // We use findBy to allow for any exit animations if necessary,
    // but getBy works if state updates are synchronous.
    expect(pitcherBtn).not.toHaveClass(ACTIVE_CLASS);
    expect(pitcherBtn).toHaveClass('bg-white');
  });
});
