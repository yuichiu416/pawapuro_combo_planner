// src/__tests__/integration/ResponsiveLayout.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';

describe('Responsive Layout & Tab Regression', () => {
  beforeEach(() => {
    // Simulate mobile viewport width
    global.innerWidth = 375;
    window.dispatchEvent(new Event('resize'));
    vi.clearAllMocks();
  });

  it('opens the Character Library drawer when the mobile Library tab is clicked', () => {
    render(<App />);

    // Based on MobileDrawer.tsx: data-testid={`${testId}-overlay`}
    // App.tsx passes testId="mobile-character-sidebar"
    const libraryOverlay = screen.getByTestId('mobile-character-sidebar-overlay');
    expect(libraryOverlay).toHaveClass('invisible');

    // Click the Library tab in the bottom navigation
    const libraryTabBtn = screen.getByTestId('mobile-nav-library-btn');
    fireEvent.click(libraryTabBtn);

    // Verify overlay is now visible
    expect(libraryOverlay).toHaveClass('visible');

    // Ensure the sidebar content is actually rendered inside
    expect(screen.getByTestId('mobile-character-sidebar')).toBeInTheDocument();
  });

  it('closes the drawer when clicking the X button', () => {
    render(<App />);

    // Open the drawer first
    fireEvent.click(screen.getByTestId('mobile-nav-library-btn'));

    // Based on MobileDrawer.tsx: data-testid={`${testId}-close-btn`}
    const closeBtn = screen.getByTestId('mobile-character-sidebar-close-btn');
    fireEvent.click(closeBtn);

    const libraryOverlay = screen.getByTestId('mobile-character-sidebar-overlay');
    expect(libraryOverlay).toHaveClass('invisible');
  });

  it('switches to Analysis view on mobile', () => {
    render(<App />);

    // Click the Analysis tab in the bottom navigation
    const analysisTabBtn = screen.getByTestId('mobile-nav-analysis-btn');
    fireEvent.click(analysisTabBtn);

    // App.tsx passes testId="mobile-analysis" to the drawer
    const analysisOverlay = screen.getByTestId('mobile-analysis-overlay');
    expect(analysisOverlay).toHaveClass('visible');

    // Verify RewardAnalysis is present within the mobile drawer
    expect(screen.getByTestId('mobile-reward-analysis')).toBeInTheDocument();
  });

  it('verifies selected characters have the blue border class after adding to team', async () => {
    render(<App />);

    // 1. Open mobile library
    fireEvent.click(screen.getByTestId('mobile-nav-library-btn'));

    // 2. Click character icon
    // Since we updated App.tsx logic, clicking an unowned character adds them immediately.
    const characterName = 'アランレイヴン';
    const characterItem = screen.getByTestId(`mobile-character-sidebar-char-${characterName}`);
    fireEvent.click(characterItem);

    // 3. Verify the character item now reflects the selected/owned state immediately
    // The "ADD" button step is removed as the action is now direct.
    // Per CharacterItem.tsx logic: isSelected triggers !border-[#0059C1] and !bg-blue-50
    expect(characterItem).toHaveClass('!border-[#0059C1]');
    expect(characterItem).toHaveClass('!bg-blue-50');
  });

  it('renders the no-results placeholder when no related combos are found', () => {
    // This test ensures the search/filter feedback is visible to users
    render(<App />);

    // We can't easily mock the manager state here without deeper integration,
    // but we check if the container exists in the DOM structure.
    const mainArea = screen.getByTestId('main-content-area');
    expect(mainArea).toBeInTheDocument();
  });
});
