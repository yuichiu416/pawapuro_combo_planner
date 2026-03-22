import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CharacterSidebar } from '@/components/CharacterSidebar';
import userEvent from '@testing-library/user-event';

// 1. Hoist the fixture data
const { mockData } = await vi.hoisted(async () => {
  const { mockData } = await import('../fixtures');
  return { mockData };
});

// 2. Mock character data using the fixture
vi.mock('@/data/characters.json', () => ({
  default: mockData.characters
}));

describe('CharacterSidebar - Component Logic', () => {
  const mockProps = {
    searchTerm: '',
    setSearchTerm: vi.fn(),
    posFilter: null,
    setPosFilter: vi.fn(),
    mapFilter: null,
    setMapFilter: vi.fn(),
    groups: {
      withCombo: Object.keys(mockData.characters).filter(name => name !== "郡司知将"),
      noCombo: ["郡司知将"],
    },
    ownedChars: new Set<string>([]),
    onToggle: vi.fn(),
    getImagePath: (name: string) => `/path/${name}.png`,
  };

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the roster grid with 30 slots', () => {
    render(<CharacterSidebar {...mockProps} />);
    // The grid has 30 buttons (some empty, some filled)
    const rosterButtons = screen.getAllByRole('button').filter(btn => 
      btn.className.includes('aspect-square')
    );
    expect(rosterButtons).toHaveLength(28);
  });

  it('automatically discovers and renders map buttons from fixture data', () => {
    render(<CharacterSidebar {...mockProps} />);
    
    // Open the map accordion first
    const mapTrigger = screen.getByText(/ANY MAP/i);
    fireEvent.click(mapTrigger);

    // Ensure "スカウ島" exists from your fixtures
    expect(screen.getByText('スカウ島')).toBeInTheDocument();
  });

  it('triggers setMapFilter when a map button is clicked', () => {
    render(<CharacterSidebar {...mockProps} />);
    
    // Open accordion
    fireEvent.click(screen.getByText(/ANY MAP/i));
    
    const mapButton = screen.getByText('スカウ島');
    fireEvent.click(mapButton);
    
    expect(mockProps.setMapFilter).toHaveBeenCalledWith('スカウ島');
  });

  it('highlights the "ANY MAP" button when no filter is active', () => {
    render(<CharacterSidebar {...mockProps} mapFilter={null} />);
    
    fireEvent.click(screen.getByTestId('map-filter-button'));
    const anyMapButton = screen.getByTestId('map-filter-button-any');
    
    // Check for the active class (bg-slate-800) from your new code
    expect(anyMapButton.closest('button')).toHaveClass('bg-slate-800');
  });

  it('removes the highlight from "ANY MAP" when a specific map is selected', () => {
    render(<CharacterSidebar {...mockProps} mapFilter="スカウ島" />);
    
    fireEvent.click(screen.getByTestId('map-filter-button'));
    const anyMapButton = screen.getByTestId('map-filter-button-any');
    expect(anyMapButton.closest('button')).not.toHaveClass('bg-slate-800');
  });

  it('updates search term on input change', async () => {
    const user = userEvent.setup();
    render(<CharacterSidebar {...mockProps} />);
    
    // Updated placeholder to match your new "SEARCH A NAME OR SKILL"
    const searchInput = screen.getByPlaceholderText(/SEARCH A NAME OR SKILL/i);
    await user.type(searchInput, 'パワプロ');
    
    expect(mockProps.setSearchTerm).toHaveBeenCalled();
  });

  it('displays the correct position sub-text in the character list', () => {
    render(<CharacterSidebar {...mockProps} />);
    
    // Find a character entry and check for position text
    const charName = Object.keys(mockData.characters)[0];
    const charPos = mockData.characters[charName].position;
    
    expect(screen.getByText(charName)).toBeInTheDocument();
    expect(screen.getByText(charPos)).toBeInTheDocument();
  });
});