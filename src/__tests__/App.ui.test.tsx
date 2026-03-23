import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '@/App';

describe('App UI: Icon Toggle Logic', () => {
  beforeEach(() => {
    cleanup();
  });

  it('switches between POSITION ICON and NO. ICON labels correctly', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Initial State: POSITION ICON should be active (assuming default true)
    const toggleBtn = screen.getByRole('button', { name: /ICON/i });
    expect(toggleBtn).toHaveTextContent(/POSITION ICON/i);
    expect(toggleBtn).toHaveClass('bg-white');

    // 2. Click to switch to NO. ICON
    await user.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent(/# Icon/i);
    expect(toggleBtn).toHaveClass('bg-blue-600');

    // 3. Click to revert
    await user.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent(/POSITION ICON/i);
  });
});
