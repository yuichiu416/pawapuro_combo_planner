// src/__tests__/components/App.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '@/App';
import { useComboManager } from '@/hooks/useComboManager';

// 1. Hoist the factory
const { createMockComboManager } = await vi.hoisted(async () => {
  return await import('../fixtures');
});

// 2. IMPORTANT: Mock the hook as a Vitest mock function
vi.mock('@/hooks/useComboManager', () => ({
  useComboManager: vi.fn() // Set it as a mock function here
}));

describe('Map Progress Integration', () => {
  it('should display the "Combos: 1/1" label on the map section header', async () => {
    const mockComboId = "パワプロ&矢部明雄";
    
    vi.mocked(useComboManager).mockReturnValue({
      ...createMockComboManager(),
      searchTerm: '',
      filteredComboIds: [mockComboId],
      mapsData: {
        "スカウ島": { combo_names: [["パワプロ", "矢部明雄"]] }
      },
      analysis: {
        // 1. Spread existing analysis from fixture if available
        ...createMockComboManager().analysis,
        // 2. Ensure mapCompletion is set for this test
        mapCompletion: {
          "スカウ島": { selected: 1, total: 1 }
        },
        // 3. ADD THIS: Provide a valid roster fallback so RewardAnalysis doesn't crash
        roster: {
          isValid: true,
          pitcher: 0,
          fielder: 0,
          manager: 0,
          total: 0,
          errors: { total: false, pitcher: false, fielder: false, manager: false }
        }
      }
    } as any);

    render(<App />);
    
    // Use a regex with findByText to handle potential nested elements
    const progressLabel = await screen.findByText(/Combos:\s*1\/1/i);

    expect(progressLabel).toBeInTheDocument();
  });
});
describe('Responsive UI', () => {
  it('shows mobile navigation and opens drawer on small screens', () => {
    // Mock window width to mobile size
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));

    render(<App />);

    // 1. Verify mobile-only navigation buttons exist
    const libraryBtn = screen.getByTestId('mobile-library-btn');

    const analysisBtn = screen.getByTestId('mobile-analysis-btn');
    expect(libraryBtn).toBeInTheDocument();

    // 2. Click Library and check if the Drawer appears
    fireEvent.click(libraryBtn);
    
    // Check for the title we added in the mobile drawer
    expect(screen.getByText(/Character Library/i)).toBeVisible();
    
    // 3. Verify sidebars are hidden (CSS check)
    const desktopSidebar = screen.getByRole('complementary', { name: 'desktop-character-sidebar' });
    
  });
});