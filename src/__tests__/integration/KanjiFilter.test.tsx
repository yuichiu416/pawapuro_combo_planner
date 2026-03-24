// src/__tests__/integration/KanjiFilter.test.tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '@/App';

describe('Kanji Filter Regression Test', () => {
  it('hides Kanji characters from sidebar but keeps them in the map planner', async () => {
    const user = userEvent.setup();
    render(<App />);

    const targetChar = '御幸一也';
    const SIDEBAR_ID = 'desktop-character-sidebar';
    const sidebar = screen.getByTestId(SIDEBAR_ID);

    // 1. SEARCH to bring character into the DOM (Search input ID from Sidebar)
    const searchInput = within(sidebar).getByTestId(`${SIDEBAR_ID}-character-search-input`);
    await user.type(searchInput, targetChar);

    // 2. Pre-condition: Character is visible in Sidebar Library
    expect(within(sidebar).getByTestId(`${SIDEBAR_ID}-char-${targetChar}`)).toBeInTheDocument();

    // 3. Action: Toggle Kanji Filter ("ア" button)
    const kanjiToggle = within(sidebar).getByTestId(`${SIDEBAR_ID}-kanji-filter-toggle`);
    await user.click(kanjiToggle);

    // 4. Verify: Hidden from Sidebar Library
    expect(
      within(sidebar).queryByTestId(`${SIDEBAR_ID}-char-${targetChar}`),
    ).not.toBeInTheDocument();

    // 5. Verify: Still visible in Map Section
    const mapName = 'スカウ島東海岸';
    const mapTrigger = screen.getByTestId(`map-trigger-${mapName}`);
    await user.click(mapTrigger);

    const mapSection = screen.getByTestId(`map-section-${mapName}`);
    // CharacterGrid renders img with alt={name}
    expect(within(mapSection).getByAltText(targetChar)).toBeInTheDocument();
  });
});
