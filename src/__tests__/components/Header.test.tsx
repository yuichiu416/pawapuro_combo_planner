// src/__tests__/components/Header.test.tsx

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from '@/components/Header';

const MOCK_PITCHER_SKILLS = ['怪物球威', '強心臟', '精密機械', '不屈之魂', '終結者'];

describe('Header Component', () => {
  const mockToggleGoldFilter = vi.fn();
  const mockOnToggleSkillFilter = vi.fn();
  const mockAdjustFont = vi.fn();
  const mockToggleRelatedFilter = vi.fn();
  const mockSetShowPositionIcon = vi.fn();
  const mockOpenClearModal = vi.fn();
  const mockOnExpandAll = vi.fn();
  const mockOnCollapseAll = vi.fn();
  const mockCloseGoldMenu = vi.fn();

  const mockProps = {
    showPositionIcon: true,
    setShowPositionIcon: mockSetShowPositionIcon,
    filterRelatedOnly: false,
    toggleRelatedFilter: mockToggleRelatedFilter,
    toggleAllByType: vi.fn(),
    typeFilter: null as 'pitcher' | 'fielder' | null,
    onOpenClearModal: mockOpenClearModal,
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
    closeGoldMenu: mockCloseGoldMenu,
    isGoldMenuOpen: false,
    activeSkillFilters: [] as string[],
    onToggleSkillFilter: mockOnToggleSkillFilter,
    skillsList: MOCK_PITCHER_SKILLS,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UI Layout & Actions', () => {
    it('renders gold skill buttons and CLEAR button using test IDs', () => {
      render(<Header {...mockProps} />);
      expect(screen.getByTestId('filter-pitcher-btn')).toBeInTheDocument();
      expect(screen.getByTestId('filter-fielder-btn')).toBeInTheDocument();
      expect(screen.getByTestId('filter-clear-btn')).toBeInTheDocument();
    });

    it('calls onOpenClearModal when the CLEAR button is clicked', () => {
      render(<Header {...mockProps} />);
      const clearBtn = screen.getByTestId('filter-clear-btn');
      fireEvent.click(clearBtn);
      expect(mockOpenClearModal).toHaveBeenCalledTimes(1);
    });

    it('renders the bottom row controls correctly using specific test IDs', () => {
      render(<Header {...mockProps} />);
      expect(screen.getByTestId('toggle-position-number-icon-btn')).toBeInTheDocument();
      expect(screen.getByTestId('owned-or-all-characters-combo-btn')).toBeInTheDocument();
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
  });

  describe('Gold Skill Filtering', () => {
    it('renders the "ALL" button using the await pattern', async () => {
      // Passing isGoldMenuOpen true and a goldFilter ensures the menu renders
      render(<Header {...mockProps} isGoldMenuOpen={true} goldFilter="pitcher" />);

      const goldPitcherBtn = await screen.getByTestId('filter-pitcher-btn');
      await fireEvent.click(goldPitcherBtn);

      const allBtn = await screen.getByTestId('all-combos-btn');
      expect(allBtn).toBeInTheDocument();
    });

    it('calls onToggleSkillFilter when a specific skill is selected', async () => {
      // In a real test environment, ensure skillsData is mocked or provided
      render(<Header {...mockProps} isGoldMenuOpen={true} goldFilter="pitcher" />);

      // Using the await pattern as you requested
      const goldPitcherBtn = await screen.getByTestId('filter-pitcher-btn');
      await fireEvent.click(goldPitcherBtn);

      // Testing the mock skill selection
      const skillItem = await screen.getByTestId('gold-combo-btn-怪物球威');
      fireEvent.click(skillItem);

      expect(mockOnToggleSkillFilter).toHaveBeenCalledWith('怪物球威');
    });

    it('highlights a skill when it is in the active filters', async () => {
      render(
        <Header
          {...mockProps}
          isGoldMenuOpen={true}
          goldFilter="pitcher"
          activeSkillFilters={['精密機械']}
        />,
      );

      const skillItem = await screen.getByTestId('gold-combo-btn-精密機械');
      expect(skillItem).toHaveClass('bg-[#FFF200]');
    });
  });
});
