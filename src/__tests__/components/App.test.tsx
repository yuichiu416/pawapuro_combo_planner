// src/__tests__/App.test.tsx

import { waitFor, within, render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import App from '@/App';

// We do NOT import the mock data at the top anymore.
// We let the factory handle it using an async import.

vi.mock('@/data/characters.json', () => {
  return import('@/__tests__/fixtures/characters.mock.json').then(module => ({
    default: module.default
  }));
});

vi.mock('@/data/combos.json', () => {
  return import('@/__tests__/fixtures/combos.mock.json').then(module => ({
    default: module.default
  }));
});

vi.mock('@/data/maps.json', () => {
  return import('@/__tests__/fixtures/maps.mock.json').then(module => ({
    default: module.default
  }));
});

const mockCharacters = import('@/__tests__/fixtures/characters.mock.json') as Record<string, MockCharacter>;

describe('App Integration: Combo Rewards Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  const CHAR_1 = 'マキシマム池田クリスティン';
  const CHAR_2 = 'エミリ';
  const TARGET_COMBO_ID = `${CHAR_1}&${CHAR_2}`;

  it('filters character list by position button', async () => {
    render(<App />);
    const sidebar = screen.getByTestId('character-sidebar');
    const targetPos = 'マ';
    
    const filterBtn = within(sidebar).getByTestId(`filter-button-${targetPos}`);
    await user.click(filterBtn);

    await waitFor(() => {
      Object.entries(mockCharacters).forEach(([name, data]) => {
        const element = within(sidebar).queryByTestId(`character-selector-character-name-${name}`);
        if (data.position === targetPos) {
          expect(element).not.toBeNull();
        } else {
          expect(element).toBeNull();
        }
      });
    });
  });

  it('clears all state when CLEAR button is clicked', async () => {
    render(<App />);
    const btn = await screen.findByTestId(`character-selector-character-name-${CHAR_1}`);
    await user.click(btn);
    
    const clearBtn = screen.getByRole('button', { name: /CLEAR/i });
    await user.click(clearBtn);

    const analysisPanel = screen.getByTestId('analysis-panel');
    await waitFor(() => {
      expect(within(analysisPanel).queryByText('ハイボールヒッター')).not.toBeInTheDocument();
      expect(within(analysisPanel).getByText(/Inactive/i)).toBeInTheDocument();
    });
  });

  it('toggles character ownership when clicking icon inside combo card', async () => {
    render(<App />);
    const comboCard = await screen.findByTestId(`combo-card-${TARGET_COMBO_ID}`);
    const charButtonInCombo = within(comboCard).getByTestId(`combo-char-button-${CHAR_1}`);
    
    const sidebarItem = screen.getByTestId(`character-selector-character-name-${CHAR_1}`);
    
    // Update: Target the wrapper instead of the img directly
    const sidebarWrapper = within(sidebarItem).getByTestId(`sidebar-icon-wrapper-${CHAR_1}`); 

    // Update: Match the new 50% opacity we set for unowned sidebar items
    expect(sidebarWrapper).toHaveClass('opacity-30');
    
    await user.click(charButtonInCombo);

    await waitFor(() => {
      // Should no longer have the dimming class once owned
      expect(sidebarWrapper).not.toHaveClass('opacity-30');
    });
  });

  it('automatically selects combo card when all members are owned', async () => {
    render(<App />);
    const comboCard = await screen.findByTestId(`combo-card-${TARGET_COMBO_ID}`);
    const charBtn1 = within(comboCard).getByTestId(`combo-char-button-${CHAR_1}`);
    const charBtn2 = within(comboCard).getByTestId(`combo-char-button-${CHAR_2}`);

    await user.click(charBtn1);
    await user.click(charBtn2);

    await waitFor(() => {
      expect(comboCard).toHaveClass('border-blue-500');
    });
  });

  it('remains selected if manually pinned even after character removal', async () => {
    render(<App />);
    const comboCard = await screen.findByTestId(`combo-card-${TARGET_COMBO_ID}`);
    
    await user.click(comboCard);
    expect(comboCard).toHaveClass('border-blue-500');

    const charBtn1 = within(comboCard).getByTestId(`combo-char-button-${CHAR_1}`);
    await user.click(charBtn1); // Set owned
    await user.click(charBtn1); // Set unowned

    expect(comboCard).toHaveClass('border-blue-500');
  });
});

describe('App UI/UX: Layout Stability', () => {
  const CHAR_NAME = 'マキシマム池田クリスティン';

  it('applies the high-visibility blue border and slate background when hovering an unowned sidebar icon', async () => {
    render(<App />);
    const sidebar = screen.getByTestId('character-sidebar');
    const sidebarItem = within(sidebar).getByTestId(`character-selector-character-name-${CHAR_NAME}`);
    
    // Update: Check for the new slate-100 background on the button itself
    expect(sidebarItem).toHaveClass('hover:bg-slate-100');

    // Update: Check for the bumped blue-500 color on the wrapper
    const wrapper = within(sidebarItem).getByTestId(`sidebar-icon-wrapper-${CHAR_NAME}`);
    expect(wrapper).toHaveClass('group-hover:border-blue-500');
  });

  it('changes border color when hovering an already owned character', async () => {
    render(<App />);
    const charButton = await screen.findByTestId(`combo-char-button-マキシマム池田クリスティン`);
    
    // First click to make it owned
    await userEvent.click(charButton); 
    
    const wrapper = screen.getByTestId(`icon-highlight-wrapper-マキシマム池田クリスティン`);
    
    // Use a regex or specific class check to be less brittle
    expect(wrapper).toHaveClass('group-hover:border-emerald-300');
  });

  it('shows a high-visibility slate background when hovering an unselected character', async () => {
    render(<App />);
    const btn = screen.getByTestId('character-selector-character-name-マキシマム池田クリスティン');
    
    // Hover state (modeled via class check)
    expect(btn).toHaveClass('hover:bg-slate-100');
    
    const iconWrapper = within(btn).getByTestId(/sidebar-icon-wrapper/);
    expect(iconWrapper).toHaveClass('group-hover:border-blue-500');
  });
});
