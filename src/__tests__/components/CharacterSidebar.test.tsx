// src/components/__tests__/CharacterSidebar.test.tsx
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CharacterSidebar } from '@/components/CharacterSidebar';

// 1. Hoist the fixture data
const { mockData } = await vi.hoisted(async () => {
  const { mockData } = await import('../fixtures');
  return { mockData };
});

// 2. Mock character data using the fixture
vi.mock('@/data/characters.json', () => ({
  default: mockData.characters,
}));

describe('CharacterSidebar - Component Logic', () => {
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
      withCombo: Object.keys(mockData.characters).filter((name) => name !== '郡司知将'),
      noCombo: ['郡司知将'],
    },
    ownedChars: new Set<string>([]),
    onToggle: vi.fn(),
    getImagePath: (name: string) => `/path/${name}.png`,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    cleanup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the roster grid with exactly 28 slots', () => {
    render(<CharacterSidebar {...mockProps} />);
    const rosterButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.className.includes('aspect-square'));
    expect(rosterButtons).toHaveLength(28);
  });

  it('updates search term when typing in the search input', () => {
    render(<CharacterSidebar {...mockProps} />);
    const searchInput = screen.getByPlaceholderText(/SEARCH A NAME OR SKILL/i);

    fireEvent.change(searchInput, { target: { value: 'Aoba' } });
    expect(mockProps.setSearchTerm).toHaveBeenCalledWith('Aoba');
  });

  it('shows the Undo Toast and confirms the removal call occurred immediately', () => {
    const testChar = '丹波光一郎';
    const propsWithChar = { ...mockProps, ownedChars: new Set([testChar]) };
    render(<CharacterSidebar {...propsWithChar} />);

    // Open preview by clicking the character in roster
    fireEvent.click(screen.getByAltText(testChar));

    // Click REMOVE button
    const removeBtn = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeBtn);

    // Verify onToggle was called (the removal action)
    expect(mockProps.onToggle).toHaveBeenCalledWith(testChar);

    // Verify Toast is visible
    const toast = screen.getByTestId('undo-toast');
    expect(within(toast).getByText(new RegExp(`Removed ${testChar}`, 'i'))).toBeInTheDocument();

    // Fast-forward time to ensure toast disappears after 5s
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.queryByTestId('undo-toast')).not.toBeInTheDocument();
  });

  it('restores the character by toggling again when Undo is clicked', () => {
    const testChar = '丹波光一郎';
    const propsWithChar = { ...mockProps, ownedChars: new Set([testChar]) };
    render(<CharacterSidebar {...propsWithChar} />);

    // 1. Perform Removal
    fireEvent.click(screen.getByAltText(testChar));
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(mockProps.onToggle).toHaveBeenCalledTimes(1);

    // 2. Perform Undo
    const toast = screen.getByTestId('undo-toast');
    const undoBtn = within(toast).getByRole('button', { name: /undo/i });
    fireEvent.click(undoBtn);

    // 3. Verification: Undo calls onToggle a second time to add it back
    expect(mockProps.onToggle).toHaveBeenCalledTimes(2);
    expect(mockProps.onToggle).toHaveBeenLastCalledWith(testChar);

    // 4. Verify Toast is removed immediately after undo
    expect(screen.queryByTestId('undo-toast')).not.toBeInTheDocument();
  });

  it('calls setMapFilter when a map selection is made', () => {
    render(<CharacterSidebar {...mockProps} />);
    // Open map popover
    fireEvent.click(screen.getByTestId('map-filter-button'));

    const mapName = Object.values(mockData.characters)[0].encounter_map;
    const mapButton = screen.getByTestId(`map-filter-button-${mapName}`);
    fireEvent.click(mapButton);

    expect(mockProps.setMapFilter).toHaveBeenCalledWith(mapName);
  });

  it('highlights the active position filter button', () => {
    const activePos = '投';
    render(<CharacterSidebar {...mockProps} posFilter={activePos} />);

    const posButton = screen.getByRole('button', { name: activePos });
    expect(posButton).toHaveClass('bg-blue-600');
  });
});
