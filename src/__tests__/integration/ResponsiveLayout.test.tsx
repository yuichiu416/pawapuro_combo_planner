// src/__tests__/integration/ResponsiveLayout.test.tsx
import { render, screen, fireEvent, within } from '@testing-library/react';
import { expect, it, describe, beforeEach } from 'vitest';
import App from '@/App';

describe('Responsive Layout & Tab Regression', () => {
  // Mock window.innerWidth to simulate mobile
  beforeEach(() => {
    global.innerWidth = 375; // iPhone width
    fireEvent(window, new Event('resize'));
  });

  it('opens the Character Library drawer when the mobile Library tab is clicked', () => {
    render(<App />);

    // 1. Initial State: Planner is visible, Library is hidden
    const mobileSidebar = screen.getByLabelText('mobile-character-sidebar');
    // It should be in the DOM but hidden via CSS (translate-x-full or opacity-0)
    // We check the parent drawer visibility
    const drawerOverlay = mobileSidebar.closest('.fixed');
    expect(drawerOverlay).toHaveClass('invisible');

    // 2. Click the Library Nav Button
    const libraryTabBtn = screen.getByTestId('mobile-library-btn');
    fireEvent.click(libraryTabBtn);

    // 3. Verification: Drawer should now be visible
    expect(drawerOverlay).toHaveClass('visible');
    expect(within(mobileSidebar).getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('closes the drawer when clicking the X button', () => {
    render(<App />);
    
    // Open it first
    fireEvent.click(screen.getByTestId('mobile-library-btn'));
    
    // Find the X button inside the mobile drawer
    const closeBtn = screen.getByTestId("mobile-character-sidebar-close-btn");
    fireEvent.click(closeBtn);

    const drawerOverlay = screen.getByLabelText('mobile-character-sidebar').closest('.fixed');
    expect(drawerOverlay).toHaveClass('invisible');
  });

  it('switches to Analysis view on mobile', () => {
    render(<App />);
    
    const analysisTabBtn = screen.getByTestId('mobile-analysis-btn');
    fireEvent.click(analysisTabBtn);

    const analysisDrawer = screen.getByText(/Reward Analysis/i).closest('.fixed');
    expect(analysisDrawer).toHaveClass('visible');
  });
});