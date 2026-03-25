// src/__tests__/integration/UIText.test.tsx

import { cleanup, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '@/App';

// Helper to simulate window width for Tailwind responsive classes
const setWidth = (width: number) => {
  global.innerWidth = width;
  global.dispatchEvent(new Event('resize'));
};

describe('UI text regression', () => {
  beforeEach(() => {
    cleanup();
    setWidth(1280); // Default to Desktop
  });

  it('renders all static header and sidebar labels correctly', () => {
    render(<App />);
    const CHARACTER_SIDEBAR_TEST_ID = 'desktop-character-sidebar';
    const REWARD_ANALYSIS_TEST_ID = 'desktop-reward-analysis';

    // Top Header & Branding
    expect(screen.getByTestId('pawapuro_title_text')).toHaveTextContent('パワプロ 2024-2025');

    // Sidebar - Active Roster Section
    // FIX: Updated to match RosterGrid.tsx `${testId}-active-roster`
    const sidebar = screen.getByTestId(CHARACTER_SIDEBAR_TEST_ID);
    const rosterSection = within(sidebar).getByTestId(`${CHARACTER_SIDEBAR_TEST_ID}-active-roster`);
    expect(rosterSection).toHaveTextContent(/Active Roster/i);

    // Sidebar - Filter Buttons
    expect(screen.getByTestId(`${CHARACTER_SIDEBAR_TEST_ID}-pos-filter-all`)).toHaveTextContent(
      'ALL',
    );

    // Planner Main Content & Header
    expect(screen.getByTestId('expand-collapse-toggle-btn')).toHaveTextContent(/EXPAND/i);

    // Planner Filters/Controls
    expect(screen.getByTestId('toggle-position-number-icon-btn')).toHaveTextContent(/POS ICON/i);
    expect(screen.getByTestId('owned-or-all-characters-combo-btn')).toHaveTextContent(/ALL/i);
    expect(screen.getByTestId('filter-pitcher-btn')).toHaveTextContent('投手金特');
    expect(screen.getByTestId('filter-fielder-btn')).toHaveTextContent('野手金特');
    expect(screen.getByTestId('filter-clear-btn')).toHaveTextContent('CLEAR');

    // Right Side Stats/Sync Section
    expect(screen.getByTestId('sync-status-btn')).toHaveTextContent(/Save Locally/i);

    // Reward Analysis Header
    expect(screen.getByTestId(`${REWARD_ANALYSIS_TEST_ID}-stats-bonus-title`)).toHaveTextContent(
      'Total Attribute Exp',
    );

    // Footer
    expect(screen.getByTestId('footer-disclaimer')).toHaveTextContent(/Unofficial fan project/i);
    expect(screen.getByTestId('footer-report-link')).toHaveTextContent(/Report a Bug/i);
  });

  it('renders specific combo reward headers on desktop', () => {
    setWidth(1280);
    render(<App />);
    const REWARD_ANALYSIS_TEST_ID = 'desktop-reward-analysis';

    // Updated to match RewardAnalysis testId pattern
    const rewardBox = screen.getByTestId(`${REWARD_ANALYSIS_TEST_ID}-combo-reward-section`);
    expect(rewardBox).toHaveTextContent(/Combo rewards/i);
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

      expect(rewardBox).toHaveTextContent(/Combo rewards/i);
      expect(rewardBox).toHaveTextContent(/金特/i);
    });
  });
});
