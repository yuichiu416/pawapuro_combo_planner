import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { CharacterSidebar } from '@/components/CharacterSidebar';

// 1. Mock the character data so we have a predictable map list
vi.mock('@/data/characters.json', () => ({
  default: {
    "丹波光一郎": { 
      name: "丹波光一郎", 
      position: "投", 
      encounter_map: "スカウ島" 
    },
    "Character B": { 
      name: "Character B", 
      position: "外", 
      encounter_map: "パワフル島" 
    }
  }
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
      withCombo: ['丹波光一郎'],
      noCombo: ['Character B'],
    },
    ownedChars: new Set([]),
    onToggle: vi.fn(),
    getImagePath: (name: string) => `/path/${name}.png`,
  };

  it('automatically discovers and renders map buttons from character data', () => {
    render(<CharacterSidebar {...mockProps} />);
    
    // These should exist because they are in our mocked characters.json
    expect(screen.getByText('スカウ島')).toBeInTheDocument();
    expect(screen.getByText('パワフル島')).toBeInTheDocument();
  });

  it('triggers setMapFilter when a map button is clicked', () => {
    render(<CharacterSidebar {...mockProps} />);
    
    const mapButton = screen.getByText('スカウ島');
    fireEvent.click(mapButton);
    
    expect(mockProps.setMapFilter).toHaveBeenCalledWith('スカウ島');
  });

  it('highlights the "ANY MAP" button when no filter is active', () => {
    render(<CharacterSidebar {...mockProps} mapFilter={null} />);
    
    const anyMapButton = screen.getByText('ANY MAP');
    expect(anyMapButton).toHaveClass('bg-slate-800');
  });
});