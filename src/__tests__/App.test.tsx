import { waitFor, fireEvent, within, render, screen, cleanup } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import App from '@/App';

// Type definitions for mock data if needed
interface MockCharacter {
  position: string;
  [key: string]: any;
}

// Strictly using require inside vi.mock for hoisting safety
vi.mock('@/data/characters.json', () => ({ 
  default: require('./fixtures/characters.mock.json') 
}));
vi.mock('@/data/combos.json', () => ({ 
  default: require('./fixtures/combos.mock.json') 
}));
vi.mock('@/data/maps.json', () => ({ 
    default: require('./fixtures/maps.mock.json') 

}));

// Import the same data for dynamic validation in tests
const mockCharacters = require('./fixtures/characters.mock.json') as Record<string, MockCharacter>;

describe('App Integration: Combo Rewards Flow', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const CHAR_1 = 'マキシマム池田クリスティン';
  const CHAR_2 = 'エミリ';
  const TARGET_COMBO_ID = `${CHAR_1}&${CHAR_2}`;

  it('activates combo and verifies skill accumulation logic', () => {
    render(<App />);

    // 1. Select characters from Sidebar
    // Assuming CharacterSidebar uses: data-testid={`character-selector-name-${name}`}
    const btn1 = screen.getByTestId(`character-selector-character-name-${CHAR_1}`);
    const btn2 = screen.getByTestId(`character-selector-character-name-${CHAR_2}`);
    
    fireEvent.click(btn1);
    fireEvent.click(btn2);

    // 2. Click the Combo Card in the Planner to activate/select it
    const comboCard = screen.getByTestId(`combo-card-${TARGET_COMBO_ID}`);
    expect(comboCard).toBeInTheDocument();
    
    // Trigger selection
    fireEvent.click(comboCard);

   // 3. Verify Analysis Results in the Sidebar/Panel
    const analysisPanel = screen.getByTestId('analysis-panel');
    const skillName = 'ハイボールヒッター';
    const expectedTotalLevel = '3';

    // Find the specific skill row first
    const skillItem = within(analysisPanel).getByTestId(`skill-item-${skillName}`);
    
    // Verify name exists within this row
    expect(within(skillItem).getByText(skillName)).toBeInTheDocument();
    
    // Use the specific test ID we added to RewardAnalysis for the level
    const levelElement = within(skillItem).getByTestId('skill-level');
    expect(levelElement).toHaveTextContent(expectedTotalLevel);
  });

  it('filters character list by position button', async () => {
    render(<App />);
    const sidebar = screen.getByTestId('character-sidebar');
    const targetPos = 'マ'; // Manager
    
    const filterBtn = within(sidebar).getByTestId(`filter-button-${targetPos}`);
    fireEvent.click(filterBtn);

    // Use waitFor to handle re-render
    await waitFor(() => {
      Object.entries(mockCharacters as Record<string, any>).forEach(([name, data]) => {
        const element = within(sidebar).queryByTestId(`character-selector-character-name-${name}`);
        
        if (data.position === targetPos) {
          // If position matches, it MUST be there
          expect(element).not.toBeNull();
        } else {
          // If position does NOT match, it MUST be gone
          expect(element).toBeNull();
        }
      });
    }, { timeout: 1000 });
  });

  it('clears all state when CLEAR button is clicked', () => {
    render(<App />);
    
    // Select one
    fireEvent.click(screen.getByTestId(`character-selector-character-name-${CHAR_1}`));
    
    // Click Clear
    const clearBtn = screen.getByRole('button', { name: /CLEAR/i });
    fireEvent.click(clearBtn);

    // Analysis panel should ideally be empty or not show specific skills
    const analysisPanel = screen.getByTestId('analysis-panel');
    expect(within(analysisPanel).queryByText('ハイボールヒッター')).not.toBeInTheDocument();
  });
});