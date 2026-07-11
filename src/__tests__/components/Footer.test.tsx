// src/__tests__/components/Footer.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import React from 'react';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

vi.mock('@/data/2024-2025/characters.json', () => ({ default: {} }));
vi.mock('@/data/2024-2025/combos.json', () => ({ default: {} }));
vi.mock('@/data/2024-2025/maps.json', () => ({ default: {} }));
vi.mock('@/data/2024-2025/character_mapping.json', () => ({ default: { by_name: {}, by_id: {} } }));
vi.mock('@/data/2026-2027/characters.json', () => ({ default: {} }));
vi.mock('@/data/2026-2027/combos.json', () => ({ default: {} }));
vi.mock('@/data/2026-2027/maps.json', () => ({ default: {} }));
vi.mock('@/data/2026-2027/character_mapping.json', () => ({ default: { by_name: {}, by_id: {} } }));

import { GameVersionProvider } from '@/contexts/GameVersionContext';
import { Footer } from '@/components/Footer';

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(GameVersionProvider, { initialVersion: '2024-2025' }, children);

describe('Footer', () => {
  it('renders the version in the subtitle', () => {
    render(<Footer />, { wrapper: Wrapper });
    expect(screen.getByTestId('combo_planner_subtitle')).toHaveTextContent('パワプロ 2024-2025');
  });

  it('renders the copyright year', () => {
    render(<Footer />, { wrapper: Wrapper });
    const year = new Date().getFullYear().toString();
    expect(screen.getByTestId('combo_planner_subtitle')).toHaveTextContent(year);
  });

  it('renders the report bug link', () => {
    render(<Footer />, { wrapper: Wrapper });
    const link = screen.getByTestId('footer-report-link');
    expect(link).toBeInTheDocument();
    expect(link.querySelector('a')).toHaveAttribute('href', 'https://tally.so/r/44jMPB');
  });

  it('renders special thanks links', () => {
    render(<Footer />, { wrapper: Wrapper });
    expect(screen.getByText('ドラミ')).toBeInTheDocument();
    expect(screen.getByText('尼才肆肥熊')).toHaveAttribute('href', 'https://home.gamer.com.tw/black80731');
  });

  it('reflects version change in subtitle', () => {
    const Wrapper2026 = ({ children }: { children: React.ReactNode }) =>
      React.createElement(GameVersionProvider, { initialVersion: '2026-2027' }, children);
    render(<Footer />, { wrapper: Wrapper2026 });
    expect(screen.getByTestId('combo_planner_subtitle')).toHaveTextContent('パワプロ 2026-2027');
  });
});
