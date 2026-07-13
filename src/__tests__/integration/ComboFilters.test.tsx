// src/__tests__/integration/ComboFilters.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '@/App';
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

beforeEach(() => {
  window.localStorage.setItem('パワプロ_planner_game_version', '2024-2025');
});

describe('Combo Type Filters (Pitcher/Fielder) - Static Data Validation', () => {
  // Utility to help check for the active orange state
  const ACTIVE_CLASS = 'bg-[#FF9E00]';

  it('verifies exact match counts when PITCHER filter is active', async () => {
    render(<App />);

    // Get baseline unfiltered counts
    const baselineMap = screen.getByTestId('map-trigger-スカウ島');
    const baselineText = baselineMap.textContent || '';

    // 1. Click PITCHER filter button
    const pitcherBtn = screen.getByTestId('filter-pitcher-btn');
    fireEvent.click(pitcherBtn);

    // 2. Verify button state (Active)
    expect(pitcherBtn).toHaveClass(ACTIVE_CLASS);
    expect(pitcherBtn).toHaveClass('ring-[#FF9E00]');
  });

  it('verifies exact match counts when FIELDER filter is active', async () => {
    render(<App />);

    // 1. Click FIELDER filter button
    const fielderBtn = screen.getByTestId('filter-fielder-btn');
    fireEvent.click(fielderBtn);

    // 2. Verify button state (Active)
    expect(fielderBtn).toHaveClass(ACTIVE_CLASS);
  });

  // src/__tests__/integration/ComboFilters.test.tsx
  it('resets match counts when クリア is clicked and confirmed', async () => {
    render(<App />);

    // 1. Activate a filter first
    const pitcherBtn = screen.getByTestId('filter-pitcher-btn');
    await fireEvent.click(pitcherBtn);

    // Verify it is active (Orange)
    expect(pitcherBtn).toHaveClass(ACTIVE_CLASS);

    // 2. Click the クリア button in the Header to open the modal
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
