import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '@/App';

// Mock the hook to provide predictable test data
vi.mock('@/hooks/useComboManager', () => ({
  useComboManager: () => ({
    ownedChars: new Set(),
    toggleCharacter: vi.fn(),
    selectedComboIds: new Set(),
    toggleCombo: vi.fn(),
    toggleAllByType: vi.fn(),
    clearAll: vi.fn(),
    analysis: { 
      stats: {}, 
      skills: [],
      missingCharacters: [],
      totalSelectedCombos: 0 
    },
    libraryGroups: { withCombo: [], noCombo: [] },
    characterMapping: { idToName: { by_name: {} } },
    mapsData: {
      'スカウ島': { combo_names: [['Char1', 'Char2']] },
      'パワフル島': { combo_names: [['Char3', 'Char4']] }
    }
  })
}));

describe('App Integration - Map Expansion', () => {
  it('should expand and collapse sections using Header buttons', () => {
    render(<App />);

    // 1. Initial State: Content should not be visible
    expect(screen.queryByTestId('combo-card-Char1&Char2')).not.toBeInTheDocument();

    // 2. Click Expand All
    const expandBtn = screen.getByRole('button', { name: /EXPAND ALL/i });
    fireEvent.click(expandBtn);

    // 3. Verify both maps are now showing their combos
    expect(screen.getByTestId('combo-card-Char1&Char2')).toBeInTheDocument();
    expect(screen.getByTestId('combo-card-Char3&Char4')).toBeInTheDocument();

    // 4. Click Collapse All (FIXED VARIABLE NAME HERE)
    const collapseBtn = screen.getByRole('button', { name: /COLLAPSE ALL/i });
    fireEvent.click(collapseBtn);

    // 5. Verify they are gone
    expect(screen.queryByTestId('combo-card-Char1&Char2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('combo-card-Char3&Char4')).not.toBeInTheDocument();
  });

  it('should expand a specific map when clicked via Sidebar', () => {
    render(<App />);
    
    // Find the sidebar button for "スカウ島"
    // sidebar usually renders buttons for each map
    const sidebarBtn = screen.getAllByText('スカウ島')[0]; 
    fireEvent.click(sidebarBtn);

    // Only that map should be open
    expect(screen.getByTestId('combo-card-Char1&Char2')).toBeInTheDocument();
    expect(screen.queryByTestId('combo-card-Char3&Char4')).not.toBeInTheDocument();
  });
});