// src/__tests__/components/App.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '@/App';

// 1. Hoist the factory from fixtures
const { createMockComboManager } = await vi.hoisted(async () => {
  return await import('../fixtures');
});

// 2. Mock with precise overrides
vi.mock('@/hooks/useComboManager', () => ({
  useComboManager: () => createMockComboManager({
    mapsData: {
      "スカウ島": { combo_names: [["CharA", "CharB"]] }
    },
    analysis: {
      // We only override the part we are actually testing
      ...createMockComboManager().analysis, 
      mapCompletion: {
        "スカウ島": { selected: 1, total: 1 }
      }
    }
  })
}));

describe('Map Progress Integration', () => {
  it('should display the "Combos: 1/1" label on the map section header', async () => {
    render(<App />);

    // findByText handles the async render of the mock data
    const progressLabel = await screen.findByText(/Combos: 1\/1/i);
    
    expect(progressLabel).toBeInTheDocument();
    expect(progressLabel).toHaveClass('text-emerald-700');
  });
});