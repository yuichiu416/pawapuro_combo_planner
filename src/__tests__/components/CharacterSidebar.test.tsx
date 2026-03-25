// src/__tests__/components/CharacterSidebar.test.tsx
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CharacterSidebar } from '@/components/CharacterSidebar';

// Mock data to ensure stable testing environment
vi.mock('@/data/characters.json', () => ({
  default: {
    金丸信二: { id: 1, position: '三', encounter_map: 'パワフル高校' },
    東條小次郎: { id: 2, position: '三', encounter_map: '鳳龍高校' },
  },
}));

const TEST_CHAR = '金丸信二';
const UNOWNED_CHAR = '東條小次郎';
const BASE_ID = 'character-sidebar';

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
  selectedPreview: null,
  setSelectedPreview: vi.fn(),
};

describe('CharacterSidebar - Style & Logic Regression', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // --- SEARCH & FILTER TESTS ---
  it('updates search term when typing in the search input', () => {
    render(<CharacterSidebar {...mockProps} />);
    const searchInput = screen.getByTestId(`${BASE_ID}-character-search-input`);

    fireEvent.change(searchInput, { target: { value: 'Aoba' } });
    expect(mockProps.setSearchTerm).toHaveBeenCalledWith('Aoba');
  });

  it('triggers map filtering correctly and closes popover after selection', async () => {
    render(<CharacterSidebar {...mockProps} />);

    // Open map filter
    fireEvent.click(screen.getByTestId(`${BASE_ID}-map-filter-trigger`));
    const mapPopover = screen.getByTestId(`${BASE_ID}-map-filter-popover`);
    expect(mapPopover).toHaveClass('bg-slate-50', 'border-slate-200');

    // Select option
    const mapOption = screen.getByTestId(`${BASE_ID}-map-filter-option-パワフル高校`);
    fireEvent.click(mapOption);

    expect(mockProps.setMapFilter).toHaveBeenCalledWith('パワフル高校');
    // Popover should close
    expect(screen.queryByTestId(`${BASE_ID}-map-filter-popover`)).not.toBeInTheDocument();
  });

  // --- PREVIEW & ACTION FLOW TESTS ---
  it('completes the full remove-and-undo flow', async () => {
    const propsWithChar = { ...mockProps, ownedChars: new Set([TEST_CHAR]) };
    const { rerender } = render(
      <CharacterSidebar {...propsWithChar} selectedPreview={TEST_CHAR} />,
    );

    // 1. Confirm Removal
    const removeBtn = await screen.findByTestId(`${BASE_ID}-remove-btn-${TEST_CHAR}`);
    fireEvent.click(removeBtn);
    expect(mockProps.onToggle).toHaveBeenCalledWith(TEST_CHAR);

    // 2. Simulate Parent clearing preview to show undo toast
    rerender(<CharacterSidebar {...propsWithChar} selectedPreview={null} />);

    const toast = await screen.findByTestId(`${BASE_ID}-undo-toast`);
    expect(within(toast).getByText(new RegExp(`Removed ${TEST_CHAR}`, 'i'))).toBeInTheDocument();

    // 3. Confirm Undo
    const undoBtn = screen.getByTestId(`${BASE_ID}-undo-button`);
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
    const { rerender } = render(
      <CharacterSidebar {...propsWithChar} selectedPreview={TEST_CHAR} />,
    );

    const removeBtn = screen.getByTestId(`${BASE_ID}-remove-btn-${TEST_CHAR}`);
    fireEvent.click(removeBtn);

    rerender(<CharacterSidebar {...propsWithChar} selectedPreview={null} />);

    const toastContainer = await screen.findByTestId(`${BASE_ID}-undo-toast`);
    expect(toastContainer).toHaveClass('animate-in', 'fade-in');

    const toastInner = toastContainer.querySelector('.bg-slate-900\\/95');
    expect(toastInner).toHaveClass('backdrop-blur-md', 'text-white');

    const undoBtn = screen.getByTestId(`${BASE_ID}-undo-button`);
    expect(undoBtn).toHaveClass('bg-white', 'text-black');
  });

  it('checks Active Roster slot highlighting', () => {
    const propsWithChar = { ...mockProps, ownedChars: new Set([TEST_CHAR]) };
    render(<CharacterSidebar {...propsWithChar} selectedPreview={TEST_CHAR} />);

    // Updated to match the refined RosterGrid testId pattern
    const slot = screen.getByTestId(`${BASE_ID}-roster-item-${TEST_CHAR}`);
    expect(slot).toHaveClass('border-blue-400', 'ring-2', 'scale-105');
  });

  it('validates map popover toggle and selection logic', async () => {
    render(<CharacterSidebar {...mockProps} />);

    fireEvent.click(screen.getByTestId(`${BASE_ID}-map-filter-trigger`));

    const mapPopover = screen.getByTestId(`${BASE_ID}-map-filter-popover`);
    expect(mapPopover).toHaveClass('bg-slate-50', 'border-slate-200');

    const mapName = 'パワフル高校';
    const mapOption = screen.getByTestId(`${BASE_ID}-map-filter-option-${mapName}`);

    fireEvent.click(mapOption);
    expect(mockProps.setMapFilter).toHaveBeenCalledWith(mapName);

    // Popover should close after selection
    expect(screen.queryByTestId(`${BASE_ID}-map-filter-popover`)).not.toBeInTheDocument();
  });

  it('shows ADD preview and completes addition flow for unowned characters', async () => {
    const { rerender } = render(<CharacterSidebar {...mockProps} selectedPreview={UNOWNED_CHAR} />);

    const previewBox = screen.getByTestId(`${BASE_ID}-roster-preview-box`);
    expect(previewBox).toHaveClass('bg-emerald-50');
    expect(within(previewBox).getByText('ADD')).toBeInTheDocument();

    const addBtn = screen.getByTestId(`${BASE_ID}-add-btn-${UNOWNED_CHAR}`);
    fireEvent.click(addBtn);

    expect(mockProps.onToggle).toHaveBeenCalledWith(UNOWNED_CHAR);

    // Clear preview to show toast
    rerender(<CharacterSidebar {...mockProps} selectedPreview={null} />);

    const toast = await screen.findByTestId(`${BASE_ID}-undo-toast`);
    expect(within(toast).getByText(new RegExp(`Added ${UNOWNED_CHAR}`, 'i'))).toBeInTheDocument();
  });

  // --- UI & STYLING REGRESSION ---
  it('verifies the Undo Toast styling to prevent layout breakage', async () => {
    const propsWithChar = { ...mockProps, ownedChars: new Set([TEST_CHAR]) };
    const { rerender } = render(
      <CharacterSidebar {...propsWithChar} selectedPreview={TEST_CHAR} />,
    );

    fireEvent.click(screen.getByTestId(`${BASE_ID}-remove-btn-${TEST_CHAR}`));
    rerender(<CharacterSidebar {...propsWithChar} selectedPreview={null} />);

    const toastContainer = await screen.findByTestId(`${BASE_ID}-undo-toast`);
    expect(toastContainer).toHaveClass('animate-in', 'fade-in');

    const toastInner = toastContainer.querySelector('.bg-slate-900\\/95');
    expect(toastInner).toHaveClass('backdrop-blur-md', 'text-white');
  });

  it('checks Active Roster slot highlighting when a character is in preview', () => {
    const propsWithChar = { ...mockProps, ownedChars: new Set([TEST_CHAR]) };
    render(<CharacterSidebar {...propsWithChar} selectedPreview={TEST_CHAR} />);

    const slot = screen.getByTestId(`${BASE_ID}-roster-item-${TEST_CHAR}`);
    expect(slot).toHaveClass('border-blue-400', 'ring-2', 'scale-105');
  });

  it('clears Undo toast when a new character is selected for preview', async () => {
    const propsWithChar = { ...mockProps, ownedChars: new Set([TEST_CHAR]) };
    const { rerender } = render(
      <CharacterSidebar {...propsWithChar} selectedPreview={TEST_CHAR} />,
    );

    // Trigger toast
    fireEvent.click(screen.getByTestId(`${BASE_ID}-remove-btn-${TEST_CHAR}`));
    rerender(<CharacterSidebar {...propsWithChar} selectedPreview={null} />);
    expect(screen.getByTestId(`${BASE_ID}-undo-toast`)).toBeInTheDocument();

    // Start new preview
    rerender(<CharacterSidebar {...propsWithChar} selectedPreview={UNOWNED_CHAR} />);

    // Undo toast should hide to prioritize the new preview box
    expect(screen.queryByTestId(`${BASE_ID}-undo-toast`)).not.toBeInTheDocument();
    expect(screen.getByTestId(`${BASE_ID}-roster-preview-box`)).toBeInTheDocument();
  });

  it('renders character items in the list with correct testIds', () => {
    render(<CharacterSidebar {...mockProps} />);

    expect(screen.getByTestId(`${BASE_ID}-char-${TEST_CHAR}`)).toBeInTheDocument();
    expect(screen.getByTestId(`${BASE_ID}-char-${UNOWNED_CHAR}`)).toBeInTheDocument();
  });
});
