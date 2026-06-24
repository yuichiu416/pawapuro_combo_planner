import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '@/App';
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

beforeEach(() => {
  localStorage.setItem('パワプロ_planner_game_version', '2024-2025');
});

describe('Font Scaling System', () => {
  it('updates document root font size when scaling buttons are clicked', () => {
    render(<App />);

    const increaseBtn = screen.getByTestId('font-increase-btn');
    const decreaseBtn = screen.getByTestId('font-decrease-btn');

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
    const increaseBtn = screen.getByTestId('font-increase-btn');

    // Click 10 times
    for (let i = 0; i < 10; i++) {
      fireEvent.click(increaseBtn);
    }

    // Should stop at 150% per our hook logic
    expect(document.documentElement.style.fontSize).toBe('150%');
  });
});
