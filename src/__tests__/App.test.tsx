// src/__tests__/App.test.tsx

import { waitFor, within, render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import App from '@/App';

interface MockCharacter {
  position: string;
  [key: string]: any;
}

vi.mock('@/data/characters.json', () => ({ 
  default: require('./fixtures/characters.mock.json') 
}));
vi.mock('@/data/combos.json', () => ({ 
  default: require('./fixtures/combos.mock.json') 
}));
vi.mock('@/data/maps.json', () => ({ 
    default: require('./fixtures/maps.mock.json') 
}));

const mockCharacters = require('./fixtures/characters.mock.json') as Record<string, MockCharacter>;

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
    const sidebarImg = within(sidebarItem).getByRole('img'); 

    expect(sidebarImg).toHaveClass('opacity-40');
    await user.click(charButtonInCombo);

    await waitFor(() => {
      expect(sidebarImg).not.toHaveClass('opacity-40');
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