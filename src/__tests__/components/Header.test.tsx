// src/__tests__/components/Header.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from '@/components/Header';

describe('Header Component', () => {
  const mockToggleGoldFilter = vi.fn();
  const mockOnToggleSkillFilter = vi.fn();
  const mockAdjustFont = vi.fn();
  const mockToggleRelatedFilter = vi.fn();
  const mockSetShowPositionIcon = vi.fn();
  const mockClearAll = vi.fn();
  const mockOnExpandAll = vi.fn();
  const mockOnCollapseAll = vi.fn();

  const mockProps = {
    showPositionIcon: true,
    setShowPositionIcon: mockSetShowPositionIcon,
    filterRelatedOnly: false,
    toggleRelatedFilter: mockToggleRelatedFilter,
    toggleAllByType: vi.fn(),
    typeFilter: null as 'pitcher' | 'fielder' | null,
    clearAll: mockClearAll,
    onExpandAll: mockOnExpandAll,
    onCollapseAll: mockOnCollapseAll,
    allExpanded: false,
    fontScale: 1,
    onAdjustFont: mockAdjustFont,
    isLoggedIn: true,
    isSyncing: false,
    handleSave: vi.fn(),
    goldFilter: null as 'pitcher' | 'fielder' | null,
    toggleGoldFilter: mockToggleGoldFilter,
    closeGoldMenu: vi.fn(),
    isGoldMenuOpen: false,
    activeSkillFilters: [] as string[],
    onToggleSkillFilter: mockOnToggleSkillFilter,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UI Layout & Actions', () => {
    it('renders gold skill buttons and CLEAR button using accessible roles', () => {
      render(<Header {...mockProps} />);
      expect(screen.getByRole('button', { name: /投手金特/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /野手金特/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /CLEAR/i })).toBeInTheDocument();
    });

    it('calls clearAll when the CLEAR button is clicked', () => {
      render(<Header {...mockProps} />);
      const clearBtn = screen.getByRole('button', { name: /CLEAR/i });
      fireEvent.click(clearBtn);
      expect(mockClearAll).toHaveBeenCalledTimes(1);
    });

    it('renders the bottom row controls correctly using test IDs', () => {
      render(<Header {...mockProps} />);
      expect(screen.getByRole('button', { name: /POS ICON/i })).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByTestId('expand-collapse-toggle-btn')).toBeInTheDocument();
    });

    it('calls onAdjustFont when zoom buttons are clicked via test IDs', () => {
      render(<Header {...mockProps} />);
      const plusBtn = screen.getByTestId('font-increase-btn');
      const minusBtn = screen.getByTestId('font-decrease-btn');

      fireEvent.click(plusBtn);
      expect(mockAdjustFont).toHaveBeenCalledWith(0.1);

      fireEvent.click(minusBtn);
      expect(mockAdjustFont).toHaveBeenCalledWith(-0.1);
    });

    it('calls toggleGoldFilter when the Pitcher Gold button is clicked', () => {
      render(<Header {...mockProps} />);
      const pitcherBtn = screen.getByRole('button', { name: /投手金特/i });
      fireEvent.click(pitcherBtn);
      expect(mockToggleGoldFilter).toHaveBeenCalledWith('pitcher');
    });
  });

  describe('Gold Skill Filtering', () => {
    it('renders the skill selection list with test IDs when active', () => {
      render(<Header {...mockProps} goldFilter="pitcher" />);

      const allBtn = screen.getByTestId('all-combos-btn');
      expect(allBtn).toBeInTheDocument();

      const listContainer = allBtn.parentElement;
      // Matches the custom scrollbar class in your component
      expect(listContainer).toHaveClass('custom-scrollbar-pawa');
    });

    it('calls toggleGoldFilter(null) when the ALL button is clicked', () => {
      render(<Header {...mockProps} goldFilter="pitcher" />);
      const allBtn = screen.getByTestId('all-combos-btn');
      fireEvent.click(allBtn);
      expect(mockToggleGoldFilter).toHaveBeenCalledWith(null);
    });

    it('calls onToggleSkillFilter when a specific skill is selected', () => {
      render(<Header {...mockProps} goldFilter="pitcher" />);
      const skillItem = screen.getByTestId(`gold-combo-btn-怪童`);
      fireEvent.click(skillItem);
      expect(mockOnToggleSkillFilter).toHaveBeenCalledWith('怪童');
    });

    it('highlights selected skills in the list', () => {
      render(<Header {...mockProps} goldFilter="pitcher" activeSkillFilters={['怪童']} />);

      const skillItem = screen.getByTestId(`gold-combo-btn-怪童`);
      // Updated: Expecting Pawapuro Yellow instead of Blue
      expect(skillItem).toHaveClass('bg-[#FFF200]');
      expect(skillItem).toHaveClass('text-black');
      expect(skillItem).toHaveClass('shadow-[0_0_10px_rgba(255,242,0,0.5)]');
    });

    it('applies correct styling to the primary filter buttons when active', () => {
      render(<Header {...mockProps} goldFilter="pitcher" />);

      const pitcherBtn = screen.getByTestId('filter-pitcher-btn');
      // Matches the orange active state for category buttons: bg-[#FF9E00]
      expect(pitcherBtn).toHaveClass('bg-[#FF9E00]');
      expect(pitcherBtn).toHaveClass('ring-2');
    });
  });
});
