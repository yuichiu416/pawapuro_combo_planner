import { render, screen, within, cleanup, fireEvent } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import App from '../App';

describe('App Integration: Combo Rewards Flow', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const getSidebarBtn = (name: string) => {
    const el = screen.getByTestId(`character-selector-character-name-${name}`);
    return el.closest('button');
  };

  it('activates the specific combo "マキシマム池田クリスティン&エミリ" and verifies rewards', () => {
    render(<App />);

    const char1 = 'マキシマム池田クリスティン';
    const char2 = 'エミリ';

    // 1. Toggle both characters from the sidebar to satisfy combo requirements
    fireEvent.click(getSidebarBtn(char1)!);
    fireEvent.click(getSidebarBtn(char2)!);

    // 2. Identify the active combo card in the Planner section
    const plannerMain = screen.getByTestId('planner-main');
    
    // Find the specific card that represents the combo between these two characters
    const comboCards = within(plannerMain).getAllByTestId(/^combo-card-/);
    const targetComboCard = comboCards.find(card => 
      within(card).queryByText(char1) && within(card).queryByText(char2)
    );

    expect(targetComboCard).toBeInTheDocument();

    // 3. Click the Combo Card to view the full rewards in the right section
    fireEvent.click(targetComboCard!);

    // 4. Validate Analysis Results (Skills from the provided JSON)
    const analysisPanel = screen.getByText(/Master Rewards/i).closest('aside');
    expect(analysisPanel).toBeInTheDocument();

    const expectedSkills = [
      { name: 'ハイボールヒッター', level: '3' },
      { name: '窮地◯', level: '3' },
      { name: 'パワーヒッター', level: '1' },
      { name: '国際大会◯', level: '1' }
    ];

    expectedSkills.forEach(skill => {
      // Check if skill name exists in analysis
      const skillNameRegex = new RegExp(skill.name, 'i');
      expect(within(analysisPanel!).getByText(skillNameRegex)).toBeInTheDocument();
      
      // Check if the corresponding level is displayed
      // We use getAllByText because '3' or '1' might appear multiple times
      const levelElements = within(analysisPanel!).getAllByText(skill.level.toString());
      expect(levelElements.length).toBeGreaterThan(0);
    });
  });

  it('filters out non-matching characters when position "MGR" is selected', () => {
    render(<App />);
    
    // "郡司知将" is "外", "エミリ" is "マネージャー"
    const mgrFilterBtn = screen.getByText('MGR');
    fireEvent.click(mgrFilterBtn);
    
    expect(screen.queryByText('郡司知将')).not.toBeInTheDocument();
    expect(screen.getByTestId('character-selector-character-name-エミリ')).toBeInTheDocument();
  });

  it('clears all selections and rewards when CLEAR is clicked', () => {
    render(<App />);
    
    // Select character to generate some state
    fireEvent.click(getSidebarBtn('エミリ')!);
    
    const clearBtn = screen.getByText(/CLEAR/i);
    fireEvent.click(clearBtn);
    
    const analysisPanel = screen.getByText(/Master Rewards/i).closest('aside');
    // Skills like 'ハイボールヒッター' should no longer be visible
    expect(within(analysisPanel!).queryByText(/ハイボールヒッター/)).not.toBeInTheDocument();
  });
});