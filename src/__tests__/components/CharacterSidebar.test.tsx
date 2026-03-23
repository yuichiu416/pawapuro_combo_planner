// src/components/__tests__/CharacterSidebar.test.tsx
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CharacterSidebar } from '@/components/CharacterSidebar';

const { mockData } = await vi.hoisted(async () => {
  const { mockData } = await import('../fixtures');
  return { mockData };
});

vi.mock('@/data/characters.json', () => ({
  default: mockData.characters,
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
    withCombo: Object.keys(mockData.characters),
    noCombo: [],
  },
  ownedChars: new Set<string>([]),
  onToggle: vi.fn(),
  getImagePath: (name: string) => `/path/${name}.png`,
};

describe('CharacterSidebar - Logic & Interactions', () => {
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

    // 1. Select the character from the Active Roster grid
    fireEvent.click(screen.getByTestId(`sidebar-char-${TEST_CHAR}`));
    fireEvent.click(screen.getByTestId(`active-roaster-${TEST_CHAR}`));

    // 2. Wait for the Preview Panel to render the Remove button
    fireEvent.click(screen.getByTestId(`remove-btn-${TEST_CHAR}`));

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

    // Find and click a map button (using findBy to handle the popover animation/render)
    const mapName = Object.values(mockData.characters)[0].encounter_map;
    const mapButton = await screen.findByTestId(`map-filter-button-${mapName}`);
    fireEvent.click(mapButton);

    expect(mockProps.setMapFilter).toHaveBeenCalledWith(mapName);
  });

  it('verifies responsive positioning of the Undo Toast', async () => {
    const propsWithChar = { ...mockProps, ownedChars: new Set([TEST_CHAR]) };
    render(<CharacterSidebar {...propsWithChar} />);
    fireEvent.click(screen.getByTestId(`sidebar-char-${TEST_CHAR}`));
    fireEvent.click(screen.getByTestId(`active-roaster-${TEST_CHAR}`));
    fireEvent.click(screen.getByTestId(`remove-btn-${TEST_CHAR}`));

    const toast = await screen.findByTestId('undo-toast');

    // Check for the specific Tailwind classes we added to fix the mobile layout
    expect(toast.className).toContain('top-[00px]');
    expect(toast.className).toContain('md:bottom-6');
  });
});
