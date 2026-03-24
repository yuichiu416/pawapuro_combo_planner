// src/__tests__/components/CharacterSidebar.test.tsx

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CharacterSidebar } from '@/components/CharacterSidebar';

vi.mock('@/data/characters.json', () => ({
  default: {
    金丸信二: { id: 1, position: '三', encounter_map: 'パワフル高校' },
    東條小次郎: { id: 2, position: '三', encounter_map: '鳳龍高校' },
  },
}));

const TEST_CHAR = '金丸信二';

const mockProps = {
  searchTerm: '',
  setSearchTerm: vi.fn(),
  posFilter: null,
  setPosFilter: vi.fn(),
  mapFilter: null,
  setMapFilter: vi.fn(),
  filterNoKanji: false,
  toggleKanjiFilter: vi.fn(),
  groups: {
    withCombo: ['金丸信二', '東條小次郎'],
    noCombo: [],
  },
  ownedChars: new Set<string>([]),
  onToggle: vi.fn(),
  getImagePath: (name: string) => `/path/${name}.png`,
};

describe('CharacterSidebar - Style & Logic Regression', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('updates search term when typing in the search input', () => {
    render(<CharacterSidebar {...mockProps} />);
    const searchInput = screen.getByPlaceholderText(/SEARCH A NAME OR SKILL/i);

    fireEvent.change(searchInput, { target: { value: 'Aoba' } });
    expect(mockProps.setSearchTerm).toHaveBeenCalledWith('Aoba');
  });
  it('completes the full remove-and-undo flow', async () => {
    const propsWithChar = { ...mockProps, ownedChars: new Set([TEST_CHAR]) };
    render(<CharacterSidebar {...propsWithChar} />);

    // 1. Select the character to show the preview
    fireEvent.click(screen.getByTestId(`active-roaster-${TEST_CHAR}`));

    // 2. Click the Remove button in the Preview Panel
    const removeBtn = await screen.findByTestId(`remove-btn-${TEST_CHAR}`);
    fireEvent.click(removeBtn);

    // 3. Verify onToggle was called for removal
    expect(mockProps.onToggle).toHaveBeenCalledWith(TEST_CHAR);

    // 4. Wait for the Undo Toast to appear
    const toast = await screen.findByTestId('undo-toast');
    expect(within(toast).getByText(new RegExp(`Removed ${TEST_CHAR}`, 'i'))).toBeInTheDocument();

    // 5. Click Undo
    const undoBtn = within(toast).getByRole('button', { name: /undo/i });
    fireEvent.click(undoBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('undo-toast')).not.toBeInTheDocument();
    });
  });

  it('triggers map filtering correctly', async () => {
    render(<CharacterSidebar {...mockProps} />);

    // Open map popover
    fireEvent.click(screen.getByTestId('map-filter-button'));
    // Find and click a map button
    const mapButton = await screen.findByTestId(`map-filter-button-パワフル高校`);
    fireEvent.click(mapButton);

    expect(mockProps.setMapFilter).toHaveBeenCalledWith('パワフル高校');
  });

  it('verifies the Undo Toast styling to prevent layout breakage', async () => {
    const propsWithChar = { ...mockProps, ownedChars: new Set([TEST_CHAR]) };
    render(<CharacterSidebar {...propsWithChar} />);

    // Open preview
    fireEvent.click(screen.getByTestId(`active-roaster-${TEST_CHAR}`));
    const removeBtn = screen.getByTestId(`remove-btn-${TEST_CHAR}`);
    fireEvent.click(removeBtn);

    const toastContainer = await screen.findByTestId('undo-toast');

    // Style check: Ensure z-index and animations are preserved
    expect(toastContainer).toHaveClass('z-[50]', 'animate-in', 'fade-in');

    // Verify toast inner styles (dark glass effect)
    const toastInner = toastContainer.querySelector('.bg-slate-900\\/95');
    expect(toastInner).toHaveClass('backdrop-blur-md', 'text-white');

    // Undo button check
    const undoBtn = within(toastContainer).getByRole('button', { name: /undo/i });
    expect(undoBtn).toHaveClass('bg-white', 'text-slate-950');
  });

  it('checks Active Roster slot highlighting', () => {
    const propsWithChar = { ...mockProps, ownedChars: new Set([TEST_CHAR]) };
    render(<CharacterSidebar {...propsWithChar} />);

    const slot = screen.getByTestId(`active-roaster-${TEST_CHAR}`);
    fireEvent.click(slot);

    // Assert visual feedback classes
    expect(slot).toHaveClass('border-blue-400', 'ring-2', 'scale-105');
  });

  it('validates map popover toggle and selection logic', async () => {
    render(<CharacterSidebar {...mockProps} />);

    const mapBtn = screen.getByTestId('map-filter-button');
    fireEvent.click(mapBtn);

    const mapName = 'パワフル高校';
    const mapOption = screen.getByTestId(`map-filter-button-${mapName}`);

    expect(mapOption.parentElement).toHaveClass('bg-slate-50', 'border-slate-200');

    fireEvent.click(mapOption);
    expect(mockProps.setMapFilter).toHaveBeenCalledWith(mapName);

    // Popover should close
    expect(screen.queryByTestId(`map-filter-button-${mapName}`)).not.toBeInTheDocument();
  });
});
