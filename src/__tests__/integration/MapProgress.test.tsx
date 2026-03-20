import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../../App';

// 1. Hoist the factory from your fixtures
const { createMockComboManager } = await vi.hoisted(async () => {
  return await import('../fixtures');
});

// 2. Surgical Mock: Only override what is relevant to "Progress"
vi.mock('../../hooks/useComboManager', () => ({
  useComboManager: () => createMockComboManager({
    mapsData: {
      "スカウ島": { combo_names: [["CharA", "CharB"]] }
    },
    analysis: {
      ...createMockComboManager().analysis, // Spread defaults to prevent crashes
      mapCompletion: {
        "スカウ島": { selected: 1, total: 1 }
      }
    }
  })
}));

describe('Map Progress Integration', () => {
  it('should display the "Combos: 1/1" label on the map section header', async () => {
    render(<App />);

    // findByText is safer for async content triggered by mocks
    const progressLabel = await screen.findByText(/Combos: 1\/1/i);
    
    expect(progressLabel).toBeInTheDocument();
    
    // Check for the "Complete" emerald styling
    expect(progressLabel).toHaveClass('text-emerald-700');
  });
});