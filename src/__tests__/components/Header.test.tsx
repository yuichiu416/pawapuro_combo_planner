// src/__tests__/components/Header.test.tsx

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from '@/components/Header';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

vi.mock('@/data/2024-2025/characters.json', () => ({ default: {} }));
vi.mock('@/data/2024-2025/combos.json', () => ({ default: {} }));
vi.mock('@/data/2024-2025/maps.json', () => ({ default: {} }));
vi.mock('@/data/2024-2025/character_mapping.json', () => ({ default: { by_name: {}, by_id: {} } }));
vi.mock('@/data/2026-2027/characters.json', () => ({ default: {} }));
vi.mock('@/data/2026-2027/combos.json', () => ({ default: {} }));
vi.mock('@/data/2026-2027/maps.json', () => ({ default: {} }));
vi.mock('@/data/2026-2027/character_mapping.json', () => ({ default: { by_name: {}, by_id: {} } }));

vi.mock('@/data/skills.json', () => ({
  default: {
    怪物球威: { name: '怪物球威', type: 'gold', category: 'pitcher', effect: '球質が非常に重くなる' },
    強心臟: { name: '強心臟', type: 'gold', category: 'pitcher', effect: '強靭な精神力を持つ' },
    精密機械: { name: '精密機械', type: 'gold', category: 'pitcher', effect: '低めへのコントロールが上がる' },
    不屈之魂: { name: '不屈之魂', type: 'gold', category: 'pitcher', effect: '根性を持つ' },
    終結者: { name: '終結者', type: 'gold', category: 'pitcher', effect: 'クローザー適性' },
    広角打法: { name: '広角打法', type: 'gold', category: 'fielder', effect: '広角に打てる' },
    '内野安打○': { name: '内野安打○', type: 'gold', category: 'fielder', effect: '内野安打が出やすい' },
  },
}));

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
    localStorage.setItem('パワプロ_planner_game_version', '2024-2025');
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
