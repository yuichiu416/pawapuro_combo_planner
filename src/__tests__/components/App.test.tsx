// src/__tests__/components/App.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { useComboManager } from '@/hooks/useComboManager';
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

// 1. Hoist the factory
const { createMockComboManager } = await vi.hoisted(async () => {
  return await import('../fixtures');
});

// 2. IMPORTANT: Mock the hook as a Vitest mock function
vi.mock('@/hooks/useComboManager', () => ({
  useComboManager: vi.fn(),
}));

describe('Map Progress Integration', () => {
  it('should display the "Combos: 1/1" label on the map section header', async () => {
    const mockComboId = 'パワプロ&矢部明雄';

    vi.mocked(useComboManager).mockReturnValue({
      ...createMockComboManager(),
      searchTerm: '',
      filteredComboIds: [mockComboId],
      mapsData: {
        スカウ島: { combo_names: [['パワプロ', '矢部明雄']] },
      },
      analysis: {
        ...createMockComboManager().analysis,
        mapCompletion: {
          スカウ島: { selected: 1, total: 1 },
        },
        roster: {
          isValid: true,
          pitcher: 0,
          fielder: 0,
          manager: 0,
          total: 0,
          errors: { total: false, pitcher: false, fielder: false, manager: false },
        },
      },
    } as any);

    render(<App />);

    // Updated: Using data-testid instead of findByText regex
    const progressLabel = await screen.findByTestId('map-progress-スカウ島');
    expect(progressLabel).toHaveTextContent(/1\/1/);
  });
});

describe('Responsive UI', () => {
  it('shows mobile navigation and opens drawer on small screens', () => {
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));

    render(<App />);

    const libraryBtn = screen.getByTestId('mobile-nav-library-btn');
    expect(libraryBtn).toBeInTheDocument();

    fireEvent.click(libraryBtn);

    expect(screen.getByTestId('mobile-drawer-title-library')).toBeVisible();

    // Updated: Verify sidebar using the aria-label assigned in App.tsx
    const desktopSidebar = screen.getByTestId('desktop-character-sidebar');
    expect(desktopSidebar).toBeInTheDocument();
  });
});
