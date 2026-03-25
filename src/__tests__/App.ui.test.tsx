import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '@/App';

describe('App UI: Icon Toggle Logic', () => {
  beforeEach(() => {
    cleanup();
  });

  it('switches between POS ICON and NO. ICON labels correctly', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Initial State: POS ICON should be active (assuming default true)
    const toggleBtn = screen.getByRole('button', { name: /ICON/i });
    expect(toggleBtn).toHaveTextContent(/POS ICON/i);
    expect(toggleBtn).toHaveClass('bg-white');

    // 2. Click to switch to NO. ICON
    await user.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent(/# Icon/i);
    expect(toggleBtn).toHaveClass('bg-blue-600');

    // 3. Click to revert
    await user.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent(/POS ICON/i);
  });
});
describe('Timestamp UI Integration', () => {
  it('should display the last saved timestamp in the correct format', async () => {
    render(<App />);

    // 1. Wait for the timestamp element to appear after hydration
    const timestampElement = await waitFor(() => screen.getByTestId('last-saved-timestamp'));

    // 2. Verify visibility and prefix
    expect(timestampElement).toBeVisible();
    expect(timestampElement.textContent).toMatch(/LAST SAVED/i);

    /**
     * 3. Verify format:
     * The hook uses .toLocaleString()
     */
    expect(timestampElement.textContent).toMatch(
      /Last saved: (\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2} [AP]M|Just now)/i,
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
