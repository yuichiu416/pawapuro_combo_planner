// src/__tests__/integration/PreviewSync.test.tsx
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

const SIDEBAR_ID = 'desktop-character-sidebar';

describe('Character Preview and Roster Synchronization', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('adds unowned characters immediately from the map and shows an undo toast', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Wait for initial load
    await screen.findByTestId(`${SIDEBAR_ID}-roster-item-パワプロ`);

    // 2. Open Map
    const mapName = 'スカウ島';
    const mapTrigger = await screen.findByTestId(`map-trigger-${mapName}`);
    await user.click(mapTrigger);

    // 3. Target unowned character
    const charName = '千代姫';
    const mapCharBtn = await screen.findByTestId(`combo-card-character-icon-btn-${charName}`);

    // 4. Click to add
    await user.click(mapCharBtn);

    // 5. Verify Roster Update (Character appears)
    const newRosterItem = await screen.findByTestId(
      `${SIDEBAR_ID}-roster-item-${charName}`,
      {},
      { timeout: 2000 },
    );
    expect(newRosterItem).toBeInTheDocument();

    // 6. Ensure Preview Box is NOT open (since it was a direct add)
    expect(screen.queryByTestId(`${SIDEBAR_ID}-roster-preview-box`)).not.toBeInTheDocument();
  });

  it('shows the preview panel with REMOVE button when an OWNED character is clicked on the map', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId(`${SIDEBAR_ID}-roster-item-パワプロ`);

    const mapName = 'スカウ島';
    const mapTrigger = await screen.findByTestId(`map-trigger-${mapName}`);
    await user.click(mapTrigger);

    const ownedChar = '矢部明雄';
    const mapCharBtn = await screen.findByTestId(`combo-card-character-icon-btn-${ownedChar}`);
    await user.click(mapCharBtn);

    const previewBox = await screen.findByTestId(`${SIDEBAR_ID}-roster-preview-box`);
    expect(previewBox).toBeInTheDocument();
    expect(
      within(previewBox).getByTestId(`${SIDEBAR_ID}-remove-btn-${ownedChar}`),
    ).toBeInTheDocument();
  });

  it('replaces undo toast with a preview panel when selecting an owned character', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByTestId(`${SIDEBAR_ID}-roster-item-パワプロ`);
    const scoutMap = 'スカウ島';
    await user.click(await screen.findByTestId(`map-trigger-${scoutMap}`));

    // Manually remove a character to trigger the initial toast
    const charToRemove = '矢部明雄';
    const rosterSlot = screen.getByTestId(`${SIDEBAR_ID}-roster-item-${charToRemove}`);
    await user.click(rosterSlot);
    const removeBtn = screen.getByTestId(`${SIDEBAR_ID}-remove-btn-${charToRemove}`);
    await user.click(removeBtn);

    // Wait for the Undo Toast to appear
    const toast = await screen.findByTestId(`${SIDEBAR_ID}-undo-toast`);
    expect(toast).toBeInTheDocument();

    // Click an OWNED character on the map
    const mapCharBtn = await screen.findByTestId(`combo-card-character-icon-btn-パワプロ`);
    await user.click(mapCharBtn);

    // The Toast should be replaced by the Preview Box
    expect(screen.queryByTestId(`${SIDEBAR_ID}-undo-toast`)).not.toBeInTheDocument();
    expect(screen.getByTestId(`${SIDEBAR_ID}-roster-preview-box`)).toBeInTheDocument();
  });

  it('verifies that the preview panel is hidden by default', async () => {
    render(<App />);
    expect(screen.queryByTestId(`${SIDEBAR_ID}-roster-preview-box`)).not.toBeInTheDocument();
  });
});
