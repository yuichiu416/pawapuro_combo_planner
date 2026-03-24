// src/__tests__/components/Header.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Header } from '@/components/Header';

describe('Header Component - UI Elements', () => {
  const mockProps = {
    showPositionIcon: true,
    setShowPositionIcon: vi.fn(),
    filterRelatedOnly: false,
    toggleRelatedFilter: vi.fn(),
    toggleAllByType: vi.fn(),
    clearAll: vi.fn(),
    onExpandAll: vi.fn(),
    onCollapseAll: vi.fn(),
    allExpanded: false,
    fontScale: 1,
    onAdjustFont: vi.fn(),
    isLoggedIn: true,
    isSyncing: false,
    handleSave: vi.fn(),
  };

  it('renders both PITCHER and FIELDER action buttons', () => {
    render(<Header {...mockProps} />);

    expect(screen.getByRole('button', { name: /投手金特/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /野手金特/i })).toBeInTheDocument();
  });

  it('toggles POSITION ICON visibility setting', () => {
    render(<Header {...mockProps} />);
    const toggleBtn = screen.getByText(/POSITION ICON/i);
    fireEvent.click(toggleBtn);
    expect(mockProps.setShowPositionIcon).toHaveBeenCalled();
  });

  it('switches between Expand and Collapse text based on allExpanded prop', () => {
    const { rerender } = render(<Header {...mockProps} allExpanded={false} />);
    expect(screen.getByText(/EXPAND ALL/i)).toBeInTheDocument();

    rerender(<Header {...mockProps} allExpanded={true} />);
    expect(screen.getByText(/COLLAPSE ALL/i)).toBeInTheDocument();
  });

  it('calls clearAll when CLEAR button is clicked', () => {
    render(<Header {...mockProps} />);
    const clearBtn = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearBtn);
    expect(mockProps.clearAll).toHaveBeenCalled();
  });
});
