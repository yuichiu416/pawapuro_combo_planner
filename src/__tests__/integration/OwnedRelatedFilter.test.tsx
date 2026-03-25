// src/__tests__/integration/OwnedRelatedFilter.test.tsx
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '@/App';

const SIDEBAR_ID = 'desktop-character-sidebar';

describe('Owned Related Filter - Discovery Flow', () => {
  it('allows searching, adding a character, and filtering for their combos', async () => {
    const user = userEvent.setup();
    render(<App />);

    const desktopSidebar = screen.getByRole('complementary', { name: SIDEBAR_ID });
    const searchInput = within(desktopSidebar).getByTestId(`${SIDEBAR_ID}-character-search-input`);
    const filterBtn = screen.getByTestId('owned-or-all-characters-combo-btn');

    await user.type(searchInput, '御幸');
    // Updated ID to include desktop-character-sidebar prefix
    const charButton = await within(desktopSidebar).findByTestId(`${SIDEBAR_ID}-char-御幸一也`);
    await user.click(charButton);

    await user.clear(searchInput);
    await user.click(filterBtn);

    const combo1 = await screen.findByTestId('combo-card-御幸一也&成宮鳴');
    const combo2 = await screen.findByTestId('combo-card-御幸一也&皇帝');

    expect(combo1).toBeInTheDocument();
    expect(combo2).toBeInTheDocument();
  });
});

describe('Owned Related Filter - Multi-Character Discovery', () => {
  it('displays combos for all owned characters simultaneously and handles partial removal', async () => {
    const user = userEvent.setup();
    render(<App />);

    const desktopSidebar = screen.getByRole('complementary', { name: SIDEBAR_ID });
    const searchInput = within(desktopSidebar).getByTestId(`${SIDEBAR_ID}-character-search-input`);
    const filterBtn = screen.getByTestId('owned-or-all-characters-combo-btn');

    await user.type(searchInput, '皇帝');
    // Updated ID to include desktop-character-sidebar prefix
    const charA = await within(desktopSidebar).findByTestId(`${SIDEBAR_ID}-char-皇帝`);
    await user.click(charA);

    await user.clear(searchInput);
    await user.type(searchInput, '成宮');
    // Updated ID to include desktop-character-sidebar prefix
    const charC = await within(desktopSidebar).findByTestId(`${SIDEBAR_ID}-char-成宮鳴`);
    await user.click(charC);

    await user.clear(searchInput);
    await user.click(filterBtn);

    expect(await screen.findByTestId('combo-card-御幸一也&皇帝')).toBeInTheDocument();
    expect(await screen.findByTestId('combo-card-御幸一也&成宮鳴')).toBeInTheDocument();

    // Updated ID to include desktop-character-sidebar prefix
    const charA_toRemove = within(desktopSidebar).getByTestId(`${SIDEBAR_ID}-char-皇帝`);
    await user.click(charA_toRemove);

    await waitFor(
      () => {
        expect(screen.queryByTestId('combo-card-御幸一也&皇帝')).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    expect(screen.getByTestId('combo-card-御幸一也&成宮鳴')).toBeInTheDocument();
  });
});
