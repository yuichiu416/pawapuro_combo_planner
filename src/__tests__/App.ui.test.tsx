// src/__tests__/App.ui.test.tsx
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '@/App';
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

describe('App UI: Icon Toggle Logic', () => {
  beforeEach(() => {
    cleanup();
  });

  it('switches between POS ICON and # Icon labels correctly', async () => {
    const user = userEvent.setup();
    render(<App />);

    const toggleBtn = screen.getByTestId('toggle-position-number-icon-btn');
    expect(toggleBtn).toHaveTextContent(/POS ICON/i);
    expect(toggleBtn).toHaveClass('bg-white');

    await user.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent(/# Icon/i);
    expect(toggleBtn).toHaveClass('bg-[#0059C1]');

    await user.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent(/POS ICON/i);
    expect(toggleBtn).toHaveClass('bg-white');
  });
});

describe('Timestamp UI Integration', () => {
  beforeEach(() => {
    cleanup();
  });

  it('should be hidden initially if no save exists', () => {
    render(<App />);
    const timestamp = screen.getByTestId('last-saved-timestamp');
    // According to App.tsx: !manager.lastSaved && 'invisible'
    expect(timestamp).toHaveClass('invisible');
  });

  it('should update and display the timestamp after a manual save', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Find and click the save button
    const syncBtn = await screen.findByTestId('sync-status-btn');
    await user.click(syncBtn);

    // 2. Wait for the timestamp to populate and become visible
    const timestampElement = await waitFor(
      () => {
        const el = screen.getByTestId('last-saved-timestamp');
        const text = el.textContent?.replace(/Last Saved:/i, '').trim();

        // If the part after "Last Saved:" is empty, the hook hasn't finished updating
        if (!text || text.length === 0) {
          throw new Error('Timestamp data still empty');
        }
        return el;
      },
      { timeout: 3000 },
    );

    // 3. Final Assertions
    expect(timestampElement).not.toHaveClass('invisible');

    // Matches standard JS locale string or "Just now" or any non-empty string populated by the hook
    expect(timestampElement.textContent).toMatch(
      /Last Saved: (\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2} [AP]M|Just now|.+)/i,
    );
  });

  it('should update the timestamp text after a manual save', async () => {
    render(<App />);

    const syncBtn = await waitFor(() => screen.getByTestId('sync-status-btn'));

    // Simulate a save click
    syncBtn.click();

    // The timestamp should update to the current time
    await waitFor(() => {
      const timestamp = screen.getByTestId('last-saved-timestamp');
      // Verify it doesn't just say 'Just now' if that's your fallback,
      // but actually contains a formatted date string
      expect(timestamp.textContent).not.toBe('LAST SAVED:');
      expect(timestamp.textContent).toMatch(/LAST SAVED: .+/i);
    });
  });
});
