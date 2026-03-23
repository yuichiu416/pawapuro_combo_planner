// src/__tests__/components/Header.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { Header } from '@/components/Header';

describe('Header Component', () => {
  const mockProps = {
    showPositionIcon: true,
    setShowPositionIcon: vi.fn(),
    toggleAllByType: vi.fn(),
    clearAll: vi.fn(),
    onExpandAll: vi.fn(),
    onCollapseAll: vi.fn(),
    allExpanded: false,
  };

  it('calls toggleAllByType("pitcher") when PITCHER button is clicked', () => {
    render(<Header {...mockProps} />);
    const pitcherBtn = screen.getByRole('button', { name: /pitcher/i });
    fireEvent.click(pitcherBtn);
    expect(mockProps.toggleAllByType).toHaveBeenCalledWith('pitcher');
  });

  it('calls toggleAllByType("fielder") when FIELDER button is clicked', () => {
    render(<Header {...mockProps} />);
    const fielderBtn = screen.getByRole('button', { name: /fielder/i });
    fireEvent.click(fielderBtn);
    expect(mockProps.toggleAllByType).toHaveBeenCalledWith('fielder');
  });

  it('calls clearAll when CLEAR button is clicked', () => {
    render(<Header {...mockProps} />);
    const clearBtn = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearBtn);
    expect(mockProps.clearAll).toHaveBeenCalled();
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
});
