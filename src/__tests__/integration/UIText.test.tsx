// src/__tests__/integration/UIText.test.tsx

import { cleanup, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '@/App';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

// Helper to simulate window width for Tailwind responsive classes
const setWidth = (width: number) => {
  global.innerWidth = width;
  global.dispatchEvent(new Event('resize'));
};

describe('UI text regression', () => {
  beforeEach(() => {
    localStorage.setItem('パワプロ_planner_game_version', '2024-2025');
    cleanup();
    setWidth(1280); // Default to Desktop
  });

  it('renders all static header and sidebar labels correctly', () => {
    render(<App />);
    const CHARACTER_SIDEBAR_TEST_ID = 'desktop-character-sidebar';
    const REWARD_ANALYSIS_TEST_ID = 'desktop-reward-analysis';

    // Top Header & Branding — version year is dynamic, just check the static prefix
    expect(screen.getByTestId('pawapuro_title_text')).toHaveTextContent(/パワプロ/i);

    // Sidebar - Active Roster Section
    // FIX: Updated to match RosterGrid.tsx `${testId}-active-roster`
    const sidebar = screen.getByTestId(CHARACTER_SIDEBAR_TEST_ID);
    const rosterSection = within(sidebar).getByTestId(`${CHARACTER_SIDEBAR_TEST_ID}-active-roster`);
    expect(rosterSection).toHaveTextContent(/登録メンバー/i);

    // Sidebar - Filter Buttons
    expect(screen.getByTestId(`${CHARACTER_SIDEBAR_TEST_ID}-pos-filter-all`)).toHaveTextContent(
      '全',
    );

    // Planner Main Content & Header
    expect(screen.getByTestId('expand-collapse-toggle-btn')).toHaveTextContent(/全て展開/i);

    // Planner Filters/Controls
    expect(screen.getByTestId('toggle-position-number-icon-btn')).toHaveTextContent(
      /ポジションアイコン/i,
    );
    expect(screen.getByTestId('owned-or-all-characters-combo-btn')).toHaveTextContent(/全/i);
    expect(screen.getByTestId('filter-pitcher-btn')).toHaveTextContent('投手金特');
    expect(screen.getByTestId('filter-fielder-btn')).toHaveTextContent('野手金特');
    expect(screen.getByTestId('filter-clear-btn')).toHaveTextContent('クリア');

    // Right Side Stats/Sync Section
    expect(screen.getByTestId('sync-status-btn')).toHaveTextContent(/ローカルに保存/i);

    // Reward Analysis Header
    expect(screen.getByTestId(`${REWARD_ANALYSIS_TEST_ID}-stats-bonus-title`)).toHaveTextContent(
      '獲得経験点合計',
    );

    // Footer
    expect(screen.getByTestId('footer-disclaimer')).toHaveTextContent(/非公式ファンプロジェクト/i);
    expect(screen.getByTestId('footer-report-link')).toHaveTextContent(/バグ報告・機能リクエスト/i);
  });

  it('renders specific combo reward headers on desktop', () => {
    setWidth(1280);
    render(<App />);
    const REWARD_ANALYSIS_TEST_ID = 'desktop-reward-analysis';

    // Updated to match RewardAnalysis testId pattern
    const rewardBox = screen.getByTestId(`${REWARD_ANALYSIS_TEST_ID}-combo-reward-section`);
    expect(rewardBox).toHaveTextContent(/コンボ効果/i);
    expect(rewardBox).toHaveTextContent(/金特/i);
  });

  describe('Mobile Viewport', () => {
    beforeEach(() => {
      setWidth(375); // iPhone width
    });

    it('renders specific combo reward headers on mobile', () => {
      render(<App />);
      // On mobile, the testId is passed via the MobileDrawer/RewardAnalysis bridge
      const REWARD_ANALYSIS_TEST_ID = 'mobile-reward-analysis';
      const rewardBox = screen.getByTestId(`${REWARD_ANALYSIS_TEST_ID}-combo-reward-section`);

      expect(rewardBox).toHaveTextContent(/コンボ効果/i);
      expect(rewardBox).toHaveTextContent(/金特/i);
    });
  });
});
