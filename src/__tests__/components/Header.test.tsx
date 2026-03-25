// src/__tests__/components/Header.test.tsx

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from '@/components/Header';

describe('Header Component', () => {
  // 1. Define the mocks that will be used in props
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
    clearAll: mockClearAll,
    onExpandAll: mockOnExpandAll,
    onCollapseAll: mockOnCollapseAll,
    allExpanded: false,
    fontScale: 1,
    onAdjustFont: mockAdjustFont,
    isLoggedIn: true,
    isSyncing: false,
    handleSave: vi.fn(),
    // These were missing or not linked to the vi.fn() mocks above
    goldFilter: null as 'pitcher' | 'fielder' | null,
    toggleGoldFilter: mockToggleGoldFilter,
    activeSkillFilter: null as string | null,
    onToggleSkillFilter: mockOnToggleSkillFilter,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('UI Elements', () => {
    it('renders both PITCHER and FIELDER action buttons', () => {
      render(<Header {...mockProps} />);
      expect(screen.getByRole('button', { name: /投手金特/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /野手金特/i })).toBeInTheDocument();
    });

    it('calls toggleGoldFilter when the Pitcher Gold button is clicked', () => {
      render(<Header {...mockProps} />);

      const pitcherBtn = screen.getByRole('button', { name: /投手金特/i });
      fireEvent.click(pitcherBtn);

      // Now this will pass because the prop IS the mock
      expect(mockToggleGoldFilter).toHaveBeenCalledWith('pitcher');
    });

    it('renders the skill selection list when a gold filter is active', () => {
      // Instead of setupMockHook, we just update the props
      render(<Header {...mockProps} goldFilter="pitcher" />);

      // Note: Since Header.tsx imports skills.json, it will render actual skill names
      // Ensure '怪童' exists in your skills.json for this to pass
      expect(screen.getByText(/怪童/i)).toBeInTheDocument();
    });

    it('calls onToggleSkillFilter when a specific skill is selected', () => {
      render(<Header {...mockProps} goldFilter="pitcher" />);

      const skillItem = screen.getByText(/怪童/i);
      fireEvent.click(skillItem);

      expect(mockOnToggleSkillFilter).toHaveBeenCalledWith('怪童');
    });
  });
});
