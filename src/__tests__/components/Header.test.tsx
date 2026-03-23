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

  it('renders the "Select all combos for:" label for desktop users', () => {
    render(<Header {...mockProps} />);

    const label = screen.getByText(/Select all combos for:/i);
    expect(label).toBeInTheDocument();

    // Verify it has the responsive "hidden lg:inline" classes
    expect(label).toHaveClass('hidden', 'lg:inline');
  });

  it('applies the dynamic fontScale to the selection label', () => {
    const customScale = 1.5;
    render(<Header {...mockProps} fontScale={customScale} />);

    const label = screen.getByText(/Select all combos for:/i);

    // 0.75rem (base text-xs) * 1.5 scale = 1.125rem
    expect(label).toHaveStyle({ fontSize: '1.125rem' });
  });

  it('renders both PITCHER and FIELDER action buttons', () => {
    render(<Header {...mockProps} />);

    expect(screen.getByRole('button', { name: /pitcher/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fielder/i })).toBeInTheDocument();
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
