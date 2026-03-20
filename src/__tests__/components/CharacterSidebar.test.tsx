// src/__tests__/components/CharacterSidebar.test.tsx
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CharacterSidebar } from '@/components/CharacterSidebar';

// 1. Hoist the fixture data
const { mockData } = await vi.hoisted(async () => {
  const { mockData } = await import('../fixtures');
  return { mockData };
});

// 2. Mock character data using the fixture
vi.mock('@/data/characters.json', () => ({
  default: mockData.characters
}));

describe('CharacterSidebar - Dynamic Map Filtering', () => {
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
    ownedChars: new Set([]),
    onToggle: vi.fn(),
    getImagePath: (name: string) => `/path/${name}.png`,
  };

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('automatically discovers and renders map buttons from fixture data', () => {
    render(<CharacterSidebar {...mockProps} />);
    
    // Ensure "スカウ島" exists in your fixtures.ts characters!
    expect(screen.getByText('スカウ島')).toBeInTheDocument();
  });

  it('triggers setMapFilter when a map button is clicked', () => {
    render(<CharacterSidebar {...mockProps} />);
    
    const mapButton = screen.getByText('スカウ島');
    fireEvent.click(mapButton);
    
    expect(mockProps.setMapFilter).toHaveBeenCalledWith('スカウ島');
  });

  // RESTORED TEST CASE:
  it('highlights the "ANY MAP" button when no filter is active', () => {
    render(<CharacterSidebar {...mockProps} mapFilter={null} />);
    
    const anyMapButton = screen.getByText('ANY MAP');
    
    // Check for the active class (bg-slate-800)
    // Using closest('button') ensures we find the container if the text is in a span
    expect(anyMapButton.closest('button')).toHaveClass('bg-slate-800');
  });

  it('removes the highlight from "ANY MAP" when a specific map is selected', () => {
    render(<CharacterSidebar {...mockProps} mapFilter="スカウ島" />);
    
    const anyMapButton = screen.getByText('ANY MAP');
    expect(anyMapButton.closest('button')).not.toHaveClass('bg-slate-800');
  });
});