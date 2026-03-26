// src/__tests__/integration/PreviewSync.test.tsx
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';

// Mock Supabase to focus on UI logic
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

  it('updates sidebar preview and shows REMOVE when an owned character is clicked on the MAP', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Wait for hydration/initial load
    await screen.findByTestId(`${SIDEBAR_ID}-roster-item-パワプロ`);

    // 2. Expand the specific Map Section first.
    const mapName = 'スカウ島';
    const mapTrigger = screen.getByTestId(`map-trigger-${mapName}`);
    await user.click(mapTrigger);

    // 3. Now that isExpanded is true, the ComboCard and its characters are rendered.
    const charName = '千代姫';
    const mapCharBtn = await screen.findByTestId(`combo-card-character-icon-btn-${charName}`);

    // 4. Click the character on the map
    await user.click(mapCharBtn);

    // 5. Verify the Sidebar Preview Box appears with the add button
    const previewBox = await screen.findByTestId(`${SIDEBAR_ID}-roster-preview-box`);
    expect(previewBox).toBeInTheDocument();

    const addBtn = within(previewBox).getByTestId(`${SIDEBAR_ID}-add-btn-${charName}`);
    expect(addBtn).toBeInTheDocument();
  });

  it('verifies the Remove button does not exist by default', async () => {
    render(<App />);

    // Preview box and action buttons should not be present initially
    expect(screen.queryByTestId(`${SIDEBAR_ID}-roster-preview-box`)).not.toBeInTheDocument();

    // Ensure no remove buttons exist in the DOM
    const removeButtons = screen.queryAllByTestId(new RegExp(`${SIDEBAR_ID}-remove-btn-`));
    expect(removeButtons.length).toBe(0);
  });

  it('hides undo toast and switches to preview when selecting a new character from the map', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 1. Trigger removal to show Undo Toast
    const charToRemove = '矢部明雄';
    const rosterSlot = await screen.findByTestId(`${SIDEBAR_ID}-roster-item-${charToRemove}`);
    await user.click(rosterSlot);

    const removeBtn = screen.getByTestId(`${SIDEBAR_ID}-remove-btn-${charToRemove}`);
    await user.click(removeBtn);

    expect(screen.getByTestId(`${SIDEBAR_ID}-undo-toast`)).toBeInTheDocument();

    // 2. Expand map and click a different character to override the toast
    const mapName = 'スカウ島';
    await user.click(screen.getByTestId(`map-trigger-${mapName}`));

    const otherChar = '千代姫';
    const mapCharBtn = await screen.findByTestId(`combo-card-character-icon-btn-${otherChar}`);
    await user.click(mapCharBtn);

    // 3. Toast should be gone, Preview Box should be back for the new char
    expect(screen.queryByTestId(`${SIDEBAR_ID}-undo-toast`)).not.toBeInTheDocument();
    expect(screen.getByTestId(`${SIDEBAR_ID}-roster-preview-box`)).toBeInTheDocument();
    expect(screen.getByTestId(`${SIDEBAR_ID}-add-btn-${otherChar}`)).toBeInTheDocument();
  });
});
