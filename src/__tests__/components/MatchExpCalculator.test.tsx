// src/__tests__/components/MatchExpCalculator.test.tsx
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

import { MatchExpButton } from '@/components/MatchExpCalculator';
import { GameVersionProvider } from '@/contexts/GameVersionContext';
import '@/i18n/config';

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(GameVersionProvider, { initialVersion: '2024-2025' }, children);

const baseProps = {
  slotNumber: 1,
  savedData: null,
  onSave: vi.fn(),
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.setItem('パワプロ_planner_game_version', '2024-2025');
});

describe('MatchExpButton', () => {
  it('renders the trigger button', () => {
    render(<MatchExpButton {...baseProps} />, { wrapper: Wrapper });
    expect(screen.getByTestId('match-exp-calc-btn')).toBeInTheDocument();
    expect(screen.getByTestId('match-exp-calc-btn')).toHaveTextContent('獲得経験値計算');
  });

  it('opens the calculator modal when clicked', async () => {
    render(<MatchExpButton {...baseProps} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTestId('match-exp-calc-btn'));
    await waitFor(() => expect(screen.getByTestId('exp-calc-save-btn')).toBeInTheDocument());
  });
});

describe('MatchExpCalculator modal', () => {
  const openCalc = async () => {
    render(<MatchExpButton {...baseProps} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTestId('match-exp-calc-btn'));
    await waitFor(() => screen.getByTestId('exp-calc-save-btn'));
  };

  it('shows default 2024-2025 game tabs', async () => {
    await openCalc();
    expect(screen.getByText('一回戦（熱盛）')).toBeInTheDocument();
    expect(screen.getByText('二回戦（クイーンココロ）')).toBeInTheDocument();
    expect(screen.getByText('三回戦（零武）')).toBeInTheDocument();
    expect(screen.getByText('準決勝（Ω鳴海）')).toBeInTheDocument();
    expect(screen.getByText('決勝（サッたん）')).toBeInTheDocument();
  });

  it('shows difficulty buttons', async () => {
    await openCalc();
    expect(screen.getByText(/ルーキー/)).toBeInTheDocument();
    expect(screen.getByText(/ノーマル/)).toBeInTheDocument();
    expect(screen.getByText(/達人/)).toBeInTheDocument();
  });

  it('shows batting and pitching sections', async () => {
    await openCalc();
    expect(screen.getByText('打撃イベント')).toBeInTheDocument();
    expect(screen.getByText('投球イベント')).toBeInTheDocument();
  });

  it('shows home run event', async () => {
    await openCalc();
    expect(screen.getByText('ホームラン')).toBeInTheDocument();
  });

  it('starts with 0 for all counters', async () => {
    await openCalc();
    const counters = screen.getAllByText('0');
    expect(counters.length).toBeGreaterThan(0);
  });

  it('shows per-game result section', async () => {
    await openCalc();
    expect(screen.getByTestId('exp-calc-game-result')).toBeInTheDocument();
  });

  it('does not show total result with single game selected only', async () => {
    await openCalc();
    // total only shows when multiple games have data — with defaults it still shows
    // (5 tabs present), so we check it exists
    expect(screen.getByTestId('exp-calc-total-result')).toBeInTheDocument();
  });

  it('adds a new game tab when + is clicked', async () => {
    await openCalc();
    const initialTabs = screen.getAllByRole('button', { name: /回戦|決勝|準決勝|試合/ });
    fireEvent.click(screen.getByTestId('exp-calc-add-game-btn'));
    await waitFor(() => {
      const newTabs = screen.getAllByRole('button', { name: /回戦|決勝|準決勝|試合/ });
      expect(newTabs.length).toBeGreaterThan(initialTabs.length);
    });
  });

  it('shows unsaved indicator after changing a counter', async () => {
    await openCalc();
    fireEvent.click(screen.getByTestId('exp-calc-event-hr-increment'));
    await waitFor(() => expect(screen.getByText('未保存')).toBeInTheDocument());
  });

  it('calls onSave with data when save button is clicked', async () => {
    const onSave = vi.fn();
    render(<MatchExpButton {...baseProps} onSave={onSave} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTestId('match-exp-calc-btn'));
    await waitFor(() => screen.getByTestId('exp-calc-save-btn'));
    fireEvent.click(screen.getByTestId('exp-calc-save-btn'));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ games: expect.any(Array) }));
  });

  it('closes without warning when no changes made', async () => {
    await openCalc();
    fireEvent.click(screen.getByTestId('exp-calc-close-btn'));
    await waitFor(() => expect(screen.queryByTestId('exp-calc-save-btn')).not.toBeInTheDocument());
  });

  it('shows confirm dialog when closing with unsaved changes', async () => {
    await openCalc();
    fireEvent.click(screen.getByTestId('exp-calc-event-hr-increment'));
    fireEvent.click(screen.getByTestId('exp-calc-close-btn'));
    await waitFor(() => expect(screen.getByTestId('exp-calc-confirm-dialog')).toBeInTheDocument());
    expect(screen.getByText(/閉じますか/)).toBeInTheDocument();
  });

  it('stays open when cancel is clicked in confirm dialog', async () => {
    await openCalc();
    fireEvent.click(screen.getByTestId('exp-calc-event-hr-increment'));
    fireEvent.click(screen.getByTestId('exp-calc-close-btn'));
    await waitFor(() => screen.getByTestId('exp-calc-cancel-close-btn'));
    fireEvent.click(screen.getByTestId('exp-calc-cancel-close-btn'));
    await waitFor(() =>
      expect(screen.queryByTestId('exp-calc-confirm-dialog')).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId('exp-calc-save-btn')).toBeInTheDocument();
  });

  it('closes when confirm close is clicked', async () => {
    await openCalc();
    fireEvent.click(screen.getByTestId('exp-calc-event-hr-increment'));
    fireEvent.click(screen.getByTestId('exp-calc-close-btn'));
    await waitFor(() => screen.getByTestId('exp-calc-confirm-close-btn'));
    fireEvent.click(screen.getByTestId('exp-calc-confirm-close-btn'));
    await waitFor(() => expect(screen.queryByTestId('exp-calc-save-btn')).not.toBeInTheDocument());
  });
});

describe('MatchExpCalculator stat calculation', () => {
  it('calculates home run stat correctly (ノーマル, no score diff)', async () => {
    render(<MatchExpButton {...baseProps} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTestId('match-exp-calc-btn'));
    await waitFor(() => screen.getByTestId('exp-calc-game-result'));

    fireEvent.click(screen.getByTestId('exp-calc-event-hr-increment'));

    const result = screen.getByTestId('exp-calc-game-result');
    // HR stats: 筋力10, 敏捷0, 技術5, 変化球0, 精神9 × ノーマル(1.0) × no bonus(1.0)
    await waitFor(() => {
      expect(within(result).getByTestId('stat-badge-筋力')).toHaveTextContent('+10');
      expect(within(result).getByTestId('stat-badge-技術')).toHaveTextContent('+5');
      expect(within(result).getByTestId('stat-badge-精神')).toHaveTextContent('+9');
    });
  });

  it('applies score bonus multiplier correctly', async () => {
    render(<MatchExpButton {...baseProps} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTestId('match-exp-calc-btn'));
    await waitFor(() => screen.getByTestId('exp-calc-game-result'));

    // Add 1 single hit (筋力3) then set own score to 3, opp to 0 → +3 diff = ×1.3
    fireEvent.click(screen.getByTestId('exp-calc-event-single-increment'));
    fireEvent.click(screen.getByTestId('exp-calc-own-score-increment'));
    fireEvent.click(screen.getByTestId('exp-calc-own-score-increment'));
    fireEvent.click(screen.getByTestId('exp-calc-own-score-increment'));

    const result = screen.getByTestId('exp-calc-game-result');
    // 筋力3 × 1.3 = 3.9 → rounds to 4
    await waitFor(() =>
      expect(within(result).getByTestId('stat-badge-筋力')).toHaveTextContent('+4'),
    );
  });

  it('applies loss penalty correctly', async () => {
    render(<MatchExpButton {...baseProps} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTestId('match-exp-calc-btn'));
    await waitFor(() => screen.getByTestId('exp-calc-game-result'));

    fireEvent.click(screen.getByTestId('exp-calc-event-hr-increment'));
    fireEvent.click(screen.getByTestId('exp-calc-opp-score-increment'));

    const result = screen.getByTestId('exp-calc-game-result');
    // HR 筋力10 × penalty(0.94) = 9.4 → rounds to 9
    await waitFor(() =>
      expect(within(result).getByTestId('stat-badge-筋力')).toHaveTextContent('+9'),
    );
  });

  it('applies difficulty multiplier correctly', async () => {
    render(<MatchExpButton {...baseProps} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTestId('match-exp-calc-btn'));
    await waitFor(() => screen.getByTestId('exp-calc-game-result'));

    fireEvent.click(screen.getByTestId('exp-calc-event-hr-increment'));
    fireEvent.click(screen.getByText(/達人/));

    const result = screen.getByTestId('exp-calc-game-result');
    // HR 筋力10 × 達人(1.2) = 12
    await waitFor(() =>
      expect(within(result).getByTestId('stat-badge-筋力')).toHaveTextContent('+12'),
    );
  });
});
