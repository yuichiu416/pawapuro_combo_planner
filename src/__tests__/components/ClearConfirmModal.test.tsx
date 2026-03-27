// src/components/__tests__/ClearConfirmModal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClearConfirmModal } from '@/components/ClearConfirmModal';

describe('ClearConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  };

  // RESET MOCKS BEFORE EACH TEST
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(<ClearConfirmModal {...defaultProps} />);

    expect(screen.getByTestId('modal-container')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toBeInTheDocument();
    expect(screen.getByTestId('modal-confirm-btn')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<ClearConfirmModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByTestId('modal-container')).not.toBeInTheDocument();
  });

  it('calls onConfirm and onClose when the wipe button is clicked', () => {
    render(<ClearConfirmModal {...defaultProps} />);

    const confirmButton = screen.getByTestId('modal-confirm-btn');
    fireEvent.click(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the cancel button is clicked', () => {
    render(<ClearConfirmModal {...defaultProps} />);

    const cancelButton = screen.getByTestId('modal-cancel-btn');
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('calls onClose when the close "X" button is clicked', () => {
    render(<ClearConfirmModal {...defaultProps} />);

    const closeBtn = screen.getByTestId('modal-close-btn');
    fireEvent.click(closeBtn);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the overlay backdrop is clicked', () => {
    render(<ClearConfirmModal {...defaultProps} />);

    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
