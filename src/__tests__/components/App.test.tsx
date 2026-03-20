// src/__tests__/App.test.tsx
import { waitFor, within, render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  const CHAR_1 = 'マキシマム池田クリスティン'; // Fielder
  const CHAR_2 = 'エミリ'; // Manager
  const TARGET_COMBO_ID = `${CHAR_1}&${CHAR_2}`;
  const TARGET_MAP = 'スカウ塔空中庭園'; 

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  it('filters character list by position but keeps fixed members visible', async () => {
    render(<App />);
    const sidebar = screen.getByTestId('character-sidebar');
    const targetPos = 'マ'; // Manager
    
    const filterBtn = within(sidebar).getByTestId(`filter-button-${targetPos}`);
    await user.click(filterBtn);

    await waitFor(() => {
      // Manager (エミリ) should be visible
      expect(within(sidebar).getByTestId('character-selector-character-name-エミリ')).toBeInTheDocument();
      // Fielder (CHAR_1) should be filtered out
      expect(within(sidebar).queryByTestId(`character-selector-character-name-${CHAR_1}`)).not.toBeInTheDocument();
    });
  });

  it('resets to 2/25 baseline when CLEAR button is clicked', async () => {
    render(<App />);
    
    // 1. Initial baseline check (Looking for the large number '2')
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/\/ 25/)).toBeInTheDocument();

    // 2. Select a character (Count should go to 3)
    const charBtn = await screen.findByTestId(`character-selector-character-name-${CHAR_1}`);
    await user.click(charBtn);
    
    await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
    });
    
    // 3. Click Clear
    const clearBtn = screen.getByRole('button', { name: /CLEAR/i });
    await user.click(clearBtn);

    // 4. Assert baseline restored
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
      const iconWrapper = screen.getByTestId(`sidebar-icon-wrapper-${CHAR_1}`);
      expect(iconWrapper).toHaveClass('opacity-30');
    });
  });

  it('separates manager count from the main 25-scout roster', async () => {
    render(<App />);
    
    // Baseline: 2 scouts
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Select a Manager (CHAR_2)
    const managerBtn = await screen.findByTestId(`character-selector-character-name-${CHAR_2}`);
    await user.click(managerBtn);

    // Main count should NOT change
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Manager count badge should show 1 / 3
    expect(screen.getByText(/1 \/ 3/i)).toBeInTheDocument();
  });

  it('toggles character ownership when clicking icon inside combo card', async () => {
    render(<App />);
    
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
    await user.click(charBtn1); // Toggle Owned
    await user.click(charBtn1); // Toggle Unowned
    
    // Should stay selected because of the manual click
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
});