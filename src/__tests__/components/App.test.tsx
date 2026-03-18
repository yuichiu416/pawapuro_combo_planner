// src/__tests__/App.test.tsx

import { waitFor, within, render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // Fixed: Explicitly imported
import { vi, describe, it, beforeEach, expect } from 'vitest';
import App from '@/App';

// Mock data factories
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

describe('App Integration: Combo Rewards Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;
  const CHAR_1 = 'マキシマム池田クリスティン';
  const CHAR_2 = 'エミリ';
  const TARGET_COMBO_ID = `${CHAR_1}&${CHAR_2}`;
  const TARGET_MAP = 'スカウ塔空中庭園'; 

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  it('filters character list by position button', async () => {
    render(<App />);
    const sidebar = screen.getByTestId('character-sidebar');
    const targetPos = 'マ';
    
    const filterBtn = within(sidebar).getByTestId(`filter-button-${targetPos}`);
    await user.click(filterBtn);

    await waitFor(() => {
      expect(within(sidebar).queryByTestId(`character-selector-character-name-エミリ`)).toBeInTheDocument();
      expect(within(sidebar).queryByTestId(`character-selector-character-name-マキシマム池田クリスティン`)).not.toBeInTheDocument();
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
      expect(within(analysisPanel).getByText(/Inactive/i)).toBeInTheDocument();
    });
  });

  it('toggles character ownership when clicking icon inside combo card', async () => {
    render(<App />);
    
    // FIX: Use getByRole to target the specific button in the main area, not the sidebar text
    const mapHeader = await screen.findByRole('button', { name: new RegExp(TARGET_MAP, 'i') });
    await user.click(mapHeader);

    const comboCard = await screen.findByTestId(`combo-card-${TARGET_COMBO_ID}`);
    const charButtonInCombo = within(comboCard).getByTestId(`combo-char-button-${CHAR_1}`);
    
    const sidebarItem = screen.getByTestId(`character-selector-character-name-${CHAR_1}`);
    const sidebarWrapper = within(sidebarItem).getByTestId(`sidebar-icon-wrapper-${CHAR_1}`); 

    expect(sidebarWrapper).toHaveClass('opacity-30');
    await user.click(charButtonInCombo);

    await waitFor(() => {
      expect(sidebarWrapper).not.toHaveClass('opacity-30');
    });
  });

  it('automatically selects combo card when all members are owned', async () => {
    render(<App />);
    
    const mapHeader = await screen.findByRole('button', { name: new RegExp(TARGET_MAP, 'i') });
    await user.click(mapHeader);

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

    const mapHeader = await screen.findByRole('button', { name: new RegExp(TARGET_MAP, 'i') });
    await user.click(mapHeader);

    const comboCard = await screen.findByTestId(`combo-card-${TARGET_COMBO_ID}`);
    await user.click(comboCard);
    expect(comboCard).toHaveClass('border-blue-500');

    const charBtn1 = within(comboCard).getByTestId(`combo-char-button-${CHAR_1}`);
    await user.click(charBtn1); // Owned
    await user.click(charBtn1); // Unowned
    
    expect(comboCard).toHaveClass('border-blue-500');
  });
});

describe('App UI/UX: Layout Stability', () => {
  const CHAR_NAME = 'マキシマム池田クリスティン';
  const TARGET_MAP = 'スカウ塔空中庭園';
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('applies high-visibility border on unowned sidebar icon hover', async () => {
    render(<App />);
    const sidebar = screen.getByTestId('character-sidebar');
    const sidebarItem = within(sidebar).getByTestId(`character-selector-character-name-${CHAR_NAME}`);
    
    expect(sidebarItem).toHaveClass('hover:bg-slate-100');
    const wrapper = within(sidebarItem).getByTestId(`sidebar-icon-wrapper-${CHAR_NAME}`);
    expect(wrapper).toHaveClass('group-hover:border-blue-500');
  });

  it('changes border color when hovering an already owned character', async () => {
    render(<App />);
    
    const mapHeader = await screen.findByRole('button', { name: new RegExp(TARGET_MAP, 'i') });
    await user.click(mapHeader);

    const charButton = await screen.findByTestId(`combo-char-button-${CHAR_NAME}`);
    await user.click(charButton); 
    
    const highlightWrapper = screen.getByTestId(`icon-highlight-wrapper-${CHAR_NAME}`);
    expect(highlightWrapper).toHaveClass('group-hover:border-emerald-300');
  });

  it('shows slate background when hovering an unselected character', async () => {
    render(<App />);
    const btn = screen.getByTestId(`character-selector-character-name-${CHAR_NAME}`);
    expect(btn).toHaveClass('hover:bg-slate-100');
  });
});