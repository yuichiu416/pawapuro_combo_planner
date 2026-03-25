// src/__tests__/integration/OwnedRelatedFilter.test.tsx

import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';

const SIDEBAR_ID = 'desktop-character-sidebar';

describe('Owned Related Filter - Discovery Flow', () => {
  beforeEach(() => {
    cleanup();
  });

  it('allows searching, adding a character, and filtering for their combos', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Wait for hydration - correctly using 'roster' instead of 'roaster'
    await screen.findByTestId(`${SIDEBAR_ID}-roster-item-パワプロ`);

    const desktopSidebar = screen.getByTestId(SIDEBAR_ID);
    const searchInput = within(desktopSidebar).getByTestId(`${SIDEBAR_ID}-character-search-input`);
    const filterBtn = screen.getByTestId('owned-or-all-characters-combo-btn');

    await user.type(searchInput, '御幸');
    const charButton = await within(desktopSidebar).findByTestId(`${SIDEBAR_ID}-char-御幸一也`);

    // Click character first to reveal the UI controls/details
    await user.click(charButton);
    const addBtn = await within(desktopSidebar).findByTestId(`${SIDEBAR_ID}-add-btn-御幸一也`);
    await user.click(addBtn);

    await user.clear(searchInput);
    await user.click(filterBtn);

    const combo1 = await screen.findByTestId('combo-card-御幸一也&成宮鳴');
    const combo2 = await screen.findByTestId('combo-card-御幸一也&皇帝');

    expect(combo1).toBeInTheDocument();
    expect(combo2).toBeInTheDocument();
  });
});

describe('Owned Related Filter - Multi-Character Discovery', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('displays combos for all owned characters and handles removal', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Wait for hydration
    await screen.findByTestId(`${SIDEBAR_ID}-roster-item-パワプロ`);

    const desktopSidebar = screen.getByTestId(SIDEBAR_ID);
    const searchInput = within(desktopSidebar).getByTestId(`${SIDEBAR_ID}-character-search-input`);
    const filterBtn = screen.getByTestId('owned-or-all-characters-combo-btn');

    // Add 皇帝
    await user.type(searchInput, '皇帝');
    const charA = await within(desktopSidebar).findByTestId(`${SIDEBAR_ID}-char-皇帝`);
    await user.click(charA); // Must click character first to render the add-btn
    const charAAdd = await within(desktopSidebar).findByTestId(`${SIDEBAR_ID}-add-btn-皇帝`);
    await user.click(charAAdd);
    await user.clear(searchInput);

    // Add 成宮
    await user.type(searchInput, '成宮');
    const charC = await within(desktopSidebar).findByTestId(`${SIDEBAR_ID}-char-成宮鳴`);
    await user.click(charC); // Must click character first to render the add-btn
    const charCAdd = await within(desktopSidebar).findByTestId(`${SIDEBAR_ID}-add-btn-成宮鳴`);
    await user.click(charCAdd);
    await user.clear(searchInput);

    // Switch to Owned Related view
    await user.click(filterBtn);

    // Assert both combos are visible
    expect(await screen.findByTestId('combo-card-御幸一也&皇帝')).toBeInTheDocument();
    expect(await screen.findByTestId('combo-card-御幸一也&成宮鳴')).toBeInTheDocument();

    // Remove 皇帝 from the active roster
    const charA_toRemove = within(desktopSidebar).getByTestId(`${SIDEBAR_ID}-roster-item-皇帝`);
    await user.click(charA_toRemove);
    const removeButton = within(desktopSidebar).getByTestId(`${SIDEBAR_ID}-remove-btn-皇帝`);
    await user.click(removeButton);

    // Verify the specific combo is removed
    await waitFor(
      () => {
        const missingCombo = screen.queryByTestId('combo-card-御幸一也&皇帝');
        expect(missingCombo).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Ensure the other owned character's combo stays
    expect(screen.getByTestId('combo-card-御幸一也&成宮鳴')).toBeInTheDocument();
  });
});
