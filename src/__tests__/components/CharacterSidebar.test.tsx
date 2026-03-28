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

    // Updated to match component color bg-[#1A1C1E]
    const toastInner = toastContainer.querySelector('.bg-\\[\\#1A1C1E\\]');
    expect(toastInner).toHaveClass('text-white');

    const undoBtn = screen.getByTestId(`${BASE_ID}-undo-button`);
    expect(undoBtn).toHaveClass('bg-white', 'text-[#1A1C1E]');
  });

  it('checks Active Roster slot highlighting', () => {
    const propsWithChar = { ...mockProps, ownedChars: new Set([TEST_CHAR]) };
    render(<CharacterSidebar {...propsWithChar} selectedPreview={TEST_CHAR} />);

    const slot = screen.getByTestId(`${BASE_ID}-roster-item-${TEST_CHAR}`);
    // Updated to match actual component highlight color #FFF200
    expect(slot).toHaveClass('border-[#FFF200]', 'ring-2', 'scale-105');
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

  it('adds unowned characters immediately and bypasses the preview panel', async () => {
    const onToggleSpy = vi.fn();
    const setSelectedPreviewSpy = vi.fn();

    render(
      <CharacterSidebar
        {...mockProps}
        ownedChars={new Set([])}
        onToggle={onToggleSpy}
        setSelectedPreview={setSelectedPreviewSpy}
      />,
    );

    // Click an unowned character item
    const charItem = screen.getByTestId(`${BASE_ID}-char-${UNOWNED_CHAR}`);
    fireEvent.click(charItem);

    // Should trigger addition immediately
    expect(onToggleSpy).toHaveBeenCalledWith(UNOWNED_CHAR);
    // Preview panel should be nullified (reset)
    expect(setSelectedPreviewSpy).toHaveBeenCalledWith(null);
    // Preview box should NOT be rendered
    expect(screen.queryByTestId(`${BASE_ID}-roster-preview-box`)).not.toBeInTheDocument();
  });

  it('implements the close (X) button in the preview panel correctly', async () => {
    const setSelectedPreviewSpy = vi.fn();
    const propsWithOwned = {
      ...mockProps,
      ownedChars: new Set([TEST_CHAR]),
      selectedPreview: TEST_CHAR,
      setSelectedPreview: setSelectedPreviewSpy,
    };

    render(<CharacterSidebar {...propsWithOwned} />);

    const previewBox = screen.getByTestId(`${BASE_ID}-roster-preview-box`);
    expect(previewBox).toBeInTheDocument();

    // Find the X button (the only button without "REMOVE" text)
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons.find((btn) => !btn.textContent?.includes('REMOVE'));

    expect(closeBtn).toBeDefined();
    if (closeBtn) fireEvent.click(closeBtn);

    expect(setSelectedPreviewSpy).toHaveBeenCalledWith(null);
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

    // Updated to match component color bg-[#1A1C1E]
    const toastInner = toastContainer.querySelector('.bg-\\[\\#1A1C1E\\]');
    expect(toastInner).toHaveClass('text-white');
  });

  it('checks Active Roster slot highlighting when a character is in preview', () => {
    const propsWithChar = { ...mockProps, ownedChars: new Set([TEST_CHAR]) };
    render(<CharacterSidebar {...propsWithChar} selectedPreview={TEST_CHAR} />);

    const slot = screen.getByTestId(`${BASE_ID}-roster-item-${TEST_CHAR}`);
    // Updated to match actual component highlight color #FFF200
    expect(slot).toHaveClass('border-[#FFF200]', 'ring-2', 'scale-105');
  });

  it('clears Undo toast when a new character is selected for preview', async () => {
    const propsWithChar = { ...mockProps, ownedChars: new Set([TEST_CHAR]) };
    const { rerender } = render(
      <CharacterSidebar {...propsWithChar} selectedPreview={TEST_CHAR} />,
    );

    // Trigger toast by removing an owned character
    fireEvent.click(screen.getByTestId(`${BASE_ID}-remove-btn-${TEST_CHAR}`));
    rerender(<CharacterSidebar {...propsWithChar} selectedPreview={null} />);
    expect(screen.getByTestId(`${BASE_ID}-undo-toast`)).toBeInTheDocument();

    // Start new preview with an OWNED character (Unowned bypasses preview box)
    rerender(<CharacterSidebar {...propsWithChar} selectedPreview={TEST_CHAR} />);

    // Undo toast should hide to prioritize the new preview box
    expect(screen.queryByTestId(`${BASE_ID}-undo-toast`)).not.toBeInTheDocument();
    expect(screen.getByTestId(`${BASE_ID}-roster-preview-box`)).toBeInTheDocument();
  });

  it('renders character items in the list with correct testIds', () => {
    render(<CharacterSidebar {...mockProps} />);

    expect(screen.getByTestId(`${BASE_ID}-char-${TEST_CHAR}`)).toBeInTheDocument();
    expect(screen.getByTestId(`${BASE_ID}-char-${UNOWNED_CHAR}`)).toBeInTheDocument();
  });
  // --- COMBO LABEL RENDERING ---
  it('renders the WITHOUT COMBOS section label correctly', () => {
    const propsWithNoCombo = {
      ...mockProps,
      groups: {
        withCombo: [],
        noCombo: ['東條小次郎'],
      },
    };
    render(<CharacterSidebar {...propsWithNoCombo} />);

    const section = screen.getByTestId(`${BASE_ID}-list-without-combos`);
    expect(within(section).getByText('WITHOUT combos')).toBeInTheDocument();
  });

  it('renders the (No Combo) suffix on characters in the noCombo group', () => {
    const propsWithNoCombo = {
      ...mockProps,
      groups: {
        withCombo: [],
        noCombo: ['東條小次郎'],
      },
    };
    render(<CharacterSidebar {...propsWithNoCombo} />);

    const charItem = screen.getByTestId(`${BASE_ID}-char-東條小次郎`);
    expect(within(charItem).getByText(/no combo/i)).toBeInTheDocument();
  });
});
