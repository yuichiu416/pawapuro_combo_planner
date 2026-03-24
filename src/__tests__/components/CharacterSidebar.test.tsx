// src/__tests__/components/CharacterSidebar.test.tsx
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CharacterSidebar } from '@/components/CharacterSidebar';

vi.mock('@/data/characters.json', () => ({
  default: {
    金丸信二: { id: 1, position: '三', encounter_map: 'パワフル高校' },
    東條小次郎: { id: 2, position: '三', encounter_map: '鳳龍高校' },
  },
}));

const TEST_CHAR = '金丸信二';
const BASE_ID = 'desktop-character-sidebar';

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
  testId: BASE_ID,
};

describe('CharacterSidebar - Style & Logic Regression', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('updates search term when typing in the search input', () => {
    render(<CharacterSidebar {...mockProps} />);
    const searchInput = screen.getByTestId(`${BASE_ID}-character-search-input`);

    fireEvent.change(searchInput, { target: { value: 'Aoba' } });
    expect(mockProps.setSearchTerm).toHaveBeenCalledWith('Aoba');
  });

  it('completes the full remove-and-undo flow', async () => {
    const propsWithChar = { ...mockProps, ownedChars: new Set([TEST_CHAR]) };
    render(<CharacterSidebar {...propsWithChar} />);

    const slot = screen.getByTestId(`${BASE_ID}-roster-${TEST_CHAR}`);
    fireEvent.click(slot);

    const removeBtn = await screen.findByTestId(`${BASE_ID}-remove-btn-${TEST_CHAR}`);
    fireEvent.click(removeBtn);

    expect(mockProps.onToggle).toHaveBeenCalledWith(TEST_CHAR);

    const toast = await screen.findByTestId(`${BASE_ID}-undo-toast`);
    expect(within(toast).getByText(new RegExp(`Removed ${TEST_CHAR}`, 'i'))).toBeInTheDocument();

    const undoBtn = within(toast).getByTestId(`${BASE_ID}-undo-button`);
    fireEvent.click(undoBtn);

    expect(mockProps.onToggle).toHaveBeenCalledTimes(2);
  });

  it('triggers map filtering correctly', async () => {
    render(<CharacterSidebar {...mockProps} />);

    fireEvent.click(screen.getByTestId(`${BASE_ID}-map-filter-trigger`));
    const mapOption = await screen.findByTestId(`${BASE_ID}-map-filter-option-パワフル高校`);
    fireEvent.click(mapOption);

    expect(mockProps.setMapFilter).toHaveBeenCalledWith('パワフル高校');
  });

  it('verifies the Undo Toast styling to prevent layout breakage', async () => {
    const propsWithChar = { ...mockProps, ownedChars: new Set([TEST_CHAR]) };
    render(<CharacterSidebar {...propsWithChar} />);

    fireEvent.click(screen.getByTestId(`${BASE_ID}-roster-${TEST_CHAR}`));
    const removeBtn = screen.getByTestId(`${BASE_ID}-remove-btn-${TEST_CHAR}`);
    fireEvent.click(removeBtn);

    const toastContainer = await screen.findByTestId(`${BASE_ID}-undo-toast`);
    expect(toastContainer).toHaveClass('z-[50]', 'animate-in', 'fade-in');

    const toastInner = toastContainer.querySelector('.bg-slate-900\\/95');
    expect(toastInner).toHaveClass('backdrop-blur-md', 'text-white');

    const undoBtn = within(toastContainer).getByTestId(`${BASE_ID}-undo-button`);
    expect(undoBtn).toHaveClass('bg-white', 'text-black');
  });

  it('checks Active Roster slot highlighting', () => {
    const propsWithChar = { ...mockProps, ownedChars: new Set([TEST_CHAR]) };
    render(<CharacterSidebar {...propsWithChar} />);

    const slot = screen.getByTestId(`${BASE_ID}-roster-${TEST_CHAR}`);
    fireEvent.click(slot);

    expect(slot).toHaveClass('border-blue-400', 'ring-2', 'scale-105');
  });

  it('validates map popover toggle and selection logic', async () => {
    render(<CharacterSidebar {...mockProps} />);

    // Click trigger to expand
    fireEvent.click(screen.getByTestId(`${BASE_ID}-map-filter-trigger`));

    // Corrected ID to include -filter-
    const mapPopover = screen.getByTestId(`${BASE_ID}-map-filter-popover`);
    expect(mapPopover).toHaveClass('bg-slate-50', 'border-slate-200');

    const mapName = 'パワフル高校';
    const mapOption = screen.getByTestId(`${BASE_ID}-map-filter-option-${mapName}`);

    fireEvent.click(mapOption);
    expect(mockProps.setMapFilter).toHaveBeenCalledWith(mapName);

    // Check popover is removed from DOM after selection
    expect(screen.queryByTestId(`${BASE_ID}-map-filter-popover`)).not.toBeInTheDocument();
  });
});
