// src/__tests__/integration/OwnedRelatedFilter.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '@/App';
import { describe, it, expect, vi } from 'vitest';

// 1. Mock the JSON files by importing inside the factory
vi.mock('@/data/characters.json', async () => {
  const data = await import('../fixtures/characters.mock.json');
  return { default: data.default };
});

vi.mock('@/data/combos.json', async () => {
  const data = await import('../fixtures/combos.mock.json');
  return { default: data.default };
});

vi.mock('@/data/maps.json', async () => {
  const data = await import('../fixtures/maps.mock.json');
  return { default: data.default };
});

// 2. Mock Supabase (Standard factory)
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() => Promise.resolve({ data: null })),
        })),
      })),
    })),
  },
}));

describe('Owned Related Filter - Discovery Flow', () => {
  it('allows searching, adding a character, and filtering for their combos', async () => {
    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/SEARCH/i);
    const filterBtn = screen.getByRole('button', { name: /OWNED RELATED/i });

    // 1. ADD CHARACTER (Abata)
    await user.type(searchInput, '阿畑');
    const charButton = await screen.findByTestId('sidebar-char-阿畑やすし');
    await user.click(charButton);

    // 2. CLEAR SEARCH & TOGGLE FILTER
    await user.clear(searchInput);
    await user.click(filterBtn);

    // 3. ASSERT SPECIFIC COMBOS
    // Since Abata is owned, BOTH of his combos should now be visible
    const combo1 = await screen.findByTestId('combo-card-猪狩守&阿畑やすし');
    const combo2 = await screen.findByTestId('combo-card-阿畑やすし&進藤カレン');

    expect(combo1).toBeInTheDocument();
    expect(combo2).toBeInTheDocument();
  });
});

describe('Owned Related Filter - Multi-Character Discovery', () => {
  it('displays combos for all owned characters simultaneously and handles partial removal', async () => {
      const user = userEvent.setup(); // Use userEvent for better event simulation
      render(<App />);

      const searchInput = screen.getByPlaceholderText(/SEARCH/i);
      const filterBtn = screen.getByRole('button', { name: /OWNED RELATED/i });

      // 1. ADD CHARACTER A (猪狩守)
      await user.type(searchInput, '猪狩守');
      const charA = await screen.findByTestId('sidebar-char-猪狩守');
      await user.click(charA);

      // 2. ADD CHARACTER C (進藤カレン)
      await user.clear(searchInput);
      await user.type(searchInput, '進藤');
      const charC = await screen.findByTestId('sidebar-char-進藤カレン');
      await user.click(charC);

      // 3. ENABLE FILTER & CLEAR SEARCH
      await user.clear(searchInput);
      await user.click(filterBtn);

      // 4. ASSERT: Both appear
      expect(await screen.findByTestId('combo-card-猪狩守&阿畑やすし')).toBeInTheDocument();
      expect(await screen.findByTestId('combo-card-阿畑やすし&進藤カレン')).toBeInTheDocument();

      // 5. REMOVE CHARACTER A
      // Find the button AGAIN now that the search is cleared
      const charA_toRemove = screen.getByTestId('sidebar-char-猪狩守');
      await user.click(charA_toRemove); 

      // 6. VERIFY VANISHED
      await waitFor(() => {
        expect(screen.queryByTestId('combo-card-猪狩守&阿畑やすし')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByTestId('combo-card-阿畑やすし&進藤カレン')).toBeInTheDocument();
  });
});