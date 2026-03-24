// src/__tests__/integration/UIText.test.tsx

import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '@/App';

describe('UI text regression', () => {
  it('renders all static header and sidebar labels correctly', () => {
    render(<App />);
    const CHARACTER_SIDEBAR_TEST_ID = 'desktop-character-sidebar';
    const REWARD_ANALYSIS_TEST_ID = 'desktop-reward-analysis';
    // Top Header & Branding
    expect
      .soft(screen.queryByTestId('pawapuro_title_text')?.textContent)
      .toBe('パワプロ 2024-2025');
    expect
      .soft(screen.queryByTestId('combo_planner_subtitle')?.textContent)
      .toContain('パワプロ 2024-2025 Combo Planner');

    // Sidebar - Active Roster Section
    const sidebar = screen.queryByTestId(CHARACTER_SIDEBAR_TEST_ID);
    if (sidebar) {
      expect
        .soft(within(sidebar).queryByTestId('active-roster'))
        .toHaveTextContent('Active Roster');
    } else {
      expect(sidebar).toBeInTheDocument(); // Logs that the sidebar itself is missing
    }

    // Sidebar - Filter Buttons
    expect
      .soft(screen.queryByTestId(`${CHARACTER_SIDEBAR_TEST_ID}-pos-filter-all`)?.textContent)
      .toBe('ALL');

    // Planner Main Content & Header
    expect(screen.queryByTestId('expand-all-button')).toHaveTextContent('EXPAND ALL');

    // Planner Filters/Controls
    expect
      .soft(screen.queryByTestId('filter-label-position-icon'))
      .toHaveTextContent('POSITION ICON');
    expect(screen.queryByTestId('filter-button-all')).toHaveTextContent('ALL COMBOS');
    expect(screen.queryByTestId('filter-button-pitcher')).toHaveTextContent('投手金特');
    expect(screen.queryByTestId('filter-button-fielder')).toHaveTextContent('野手金特');
    expect(screen.queryByTestId('filter-button-clear')).toHaveTextContent('CLEAR');

    // Right Side Stats/Sync Section
    expect(screen.queryByTestId('sync-status-btn')).toHaveTextContent('Save Locally');
    expect
      .soft(screen.queryByTestId(`${REWARD_ANALYSIS_TEST_ID}-stats-bonus-title`))
      .toHaveTextContent('Total Attribute Exp');

    // Footer
    expect
      .soft(screen.queryByTestId('footer-disclaimer'))
      .toHaveTextContent(
        /Unofficial fan project. Assets property of Konami Digital Entertainment./i,
      );
    expect
      .soft(screen.queryByTestId('footer-report-link'))
      .toHaveTextContent('Report a Bug or Request a Feature');
  });

  it('renders specific combo reward headers on desktop', () => {
    render(<App />);
    const rewardBox = screen.queryByTestId('desktop-reward-analysis-combo-reward');
    expect(rewardBox).toHaveTextContent('Combo rewards');
    expect(rewardBox).toHaveTextContent('0 金特');
    expect(rewardBox).toHaveTextContent('金特');
  });

  describe('Mobile Viewport', () => {
    beforeEach(() => {
      global.innerWidth = 375; // iPhone width
      fireEvent(window, new Event('resize'));
    });

    it('renders specific combo reward headers on mobile', () => {
      render(<App />);
      const rewardBox = screen.queryByTestId('mobile-reward-analysis-stats-section');
      expect(rewardBox).toHaveTextContent('Combo rewards');
      expect(rewardBox).toHaveTextContent('0 金特');
      expect(rewardBox).toHaveTextContent('金特');
    });
  });
});
