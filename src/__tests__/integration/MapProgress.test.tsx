// src/__tests__/integration/MapProgress.test.tsx

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../../App';
import { useComboManager } from '../../hooks/useComboManager';
import { createMockComboManager } from '../fixtures';

// 1. Mock the hook
vi.mock('../../hooks/useComboManager', () => ({
  useComboManager: vi.fn(),
}));

describe('Map Progress Integration', () => {
  it('should display the "Combos: 1/1" label on the map section header', async () => {
    // 2. Setup the mock data surgically using the fixture
    const mockValue = createMockComboManager({
      // The Map definition
      mapsData: {
        "スカウ島": { 
          combo_names: [["CharA", "CharB"]],
          max_combos: 1 
        }
      },
      // The Progress state
      analysis: {
        ...createMockComboManager().analysis,
        mapCompletion: {
          "スカウ島": { selected: 1, total: 1 }
        }
      },
      // IMPORTANT: The map won't render if it thinks there are no combos to show
      filteredComboIds: ["CharA&CharB"] 
    });

    vi.mocked(useComboManager).mockReturnValue(mockValue);

    render(<App />);

    // 3. Use a regex to find the text even if it's split into multiple spans
    const progressLabel = await screen.findByText(/1\/1/i);
    
    expect(progressLabel).toBeInTheDocument();
    expect(progressLabel.closest('span')).toHaveClass('text-emerald-700');
  });
});