import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it, describe, vi } from 'vitest';
import App from '@/App';

describe('Font Scaling System', () => {
  it('updates document root font size when scaling buttons are clicked', () => {
    render(<App />);

    const increaseBtn = screen.getByLabelText(/Increase font size/i);
    const decreaseBtn = screen.getByLabelText(/Decrease font size/i);

    // Initial check (100% / 1.0)
    expect(document.documentElement.style.fontSize).toBe('100%');

    // Increase to 110%
    fireEvent.click(increaseBtn);
    expect(document.documentElement.style.fontSize).toBe('110%');
    expect(screen.getByText('110%')).toBeInTheDocument();

    // Decrease back to 90%
    fireEvent.click(decreaseBtn);
    fireEvent.click(decreaseBtn);
    expect(document.documentElement.style.fontSize).toBe('90%');
  });

  it('caps scaling between 80% and 150%', () => {
    render(<App />);
    const increaseBtn = screen.getByLabelText(/Increase font size/i);

    // Click 10 times
    for (let i = 0; i < 10; i++) {
      fireEvent.click(increaseBtn);
    }

    // Should stop at 150% per our hook logic
    expect(document.documentElement.style.fontSize).toBe('150%');
  });
});
