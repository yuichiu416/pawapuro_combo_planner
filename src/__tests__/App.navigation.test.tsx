// src/__tests__/App.navigation.test.tsx

import { render, screen, within, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useState } from 'react';
import App from '@/App';

// 1. Stateful Mock: Necessary to bridge the gap between click and re-render
vi.mock('@/hooks/useComboManager', () => ({
  useComboManager: () => {
    const [expandedMaps, setExpandedMaps] = useState<Set<string>>(new Set());
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return {
      ownedChars: new Set(["パワプロ", "矢部 明雄"]),
      toggleCharacter: vi.fn(),
      selectedComboIds: new Set(),
      toggleCombo: vi.fn(),
      toggleAllByType: vi.fn(),
      clearAll: vi.fn(),
      analysis: { 
        stats: {}, 
        skills: [],
        missingCharacters: [],
        totalSelectedCombos: 0,
        roster: { 
          total: 2, pitcher: 0, fielder: 0, manager: 0, isValid: false,
          errors: { total: false, pitcher: false, fielder: false, manager: false }
        }
      },
      libraryGroups: { withCombo: [], noCombo: [] },
      characterMapping: { idToName: { by_name: {} } },
      
      // Map Expansion State
      expandedMaps,
      toggleMap: (mapName: string) => {
        setExpandedMaps(prev => {
          const next = new Set(prev);
          if (next.has(mapName)) next.delete(mapName);
          else next.add(mapName);
          return next;
        });
      },
      expandAll: () => setExpandedMaps(new Set(['スカウ島', 'パワフル島'])),
      collapseAll: () => setExpandedMaps(new Set()),
      
      // Sidebar State
      isSidebarCollapsed,
      setIsSidebarCollapsed: () => setIsSidebarCollapsed(!isSidebarCollapsed),

      mapsData: {
        'スカウ島': { combo_names: [['Char1', 'Char2']] },
        'パワフル島': { combo_names: [['Char3', 'Char4']] }
      }
    };
  }
}));

describe('App Integration - Map Expansion', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    cleanup();
    user = userEvent.setup();
  });

  it('should expand and collapse sections using Header buttons', async () => {
    render(<App />);

    // Initial State Check
    expect(screen.queryByTestId('combo-card-Char1&Char2')).not.toBeInTheDocument();

    // Expand All
    const expandBtn = screen.getByRole('button', { name: /EXPAND ALL/i });
    await user.click(expandBtn);

    // Verify visibility
    expect(await screen.findByTestId('combo-card-Char1&Char2')).toBeInTheDocument();
    expect(await screen.findByTestId('combo-card-Char3&Char4')).toBeInTheDocument();

    // Collapse All
    const collapseBtn = screen.getByRole('button', { name: /COLLAPSE ALL/i });
    await user.click(collapseBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('combo-card-Char1&Char2')).not.toBeInTheDocument();
    });
  });

  it('should expand a specific map when clicked via Sidebar', async () => {
    render(<App />);
    
    // We search the whole document for the text because the sidebar 
    // wrapper might have opacity-0 in some states
    const sidebarBtn = screen.getAllByText('スカウ島')[0]; 
    await user.click(sidebarBtn);

    expect(await screen.findByTestId('combo-card-Char1&Char2')).toBeInTheDocument();
  });

  it('sidebar collapse button updates layout classes', async () => {
    render(<App />);
    
    // 1. Get the toggle button
    const toggleBtn = screen.getByTestId('sidebar-collapse-btn');
    
    /**
     * NOTE: In your HTML debug, the 'character-sidebar' ID was on a 
     * nested div with a static w-96. The parent <aside> is what 
     * actually changes width (it showed 'w-0' in your debug).
     */
    const sidebarContainer = toggleBtn.closest('aside');
    expect(sidebarContainer).toBeDefined();

    // 2. Click to toggle
    await user.click(toggleBtn);
    
    // 3. Verify the parent container changed width classes
    // Looking at your debug log, it seems to toggle to 'w-0' or similar
    await waitFor(() => {
      // If your CSS uses w-16 for collapsed, use that. 
      // If it uses w-0 (as seen in your debug), change this to 'w-0'.
      const hasCollapsedClass = 
        sidebarContainer?.classList.contains('w-16') || 
        sidebarContainer?.classList.contains('w-0');
      
      expect(hasCollapsedClass).toBe(true);
    });
  });
}); 