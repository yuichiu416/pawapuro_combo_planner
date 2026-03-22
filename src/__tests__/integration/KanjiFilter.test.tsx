// src/__tests__/integration/KanjiFilter.test.tsx
import { render, screen, fireEvent, within } from '@testing-library/react';
import { expect, it, describe } from 'vitest';
import App from '@/App';

describe('Kanji Filter Regression Test', () => {
  it('hides Kanji characters from sidebar but keeps them in the map planner', async () => {
    render(<App />);

    // 1. Identify our targets
    const kanjiChar = "御幸一也"; 
    const desktopSidebar = screen.getByRole('complementary', { name: 'desktop-character-sidebar' });
    const kanjiFilterBtn = within(desktopSidebar).getByText('ア'); // The purple toggle

    // 2. Pre-condition: Character is visible in sidebar
    expect(within(desktopSidebar).getByText(kanjiChar)).toBeInTheDocument();

    // 3. Action: Toggle the Kanji Filter ON
    fireEvent.click(kanjiFilterBtn);

    // 4. Verification A: Sidebar should NO LONGER show the Kanji character
    expect(within(desktopSidebar).queryByText(kanjiChar)).not.toBeInTheDocument();

    // 5. Verification B: The Center Planner (Map Section)
    // We expand a map where this character appears in a combo
    const mapHeader = screen.getByText(/スカウ島東海岸/i);
    fireEvent.click(mapHeader.closest('div')!);

    // The Combo Card containing the Kanji character should STILL be there
    // even though the character is hidden in the sidebar list.
    const comboCard = await screen.findByText(new RegExp(kanjiChar, 'i'));
    expect(comboCard).toBeInTheDocument();
    
    // 6. Action: Toggle Filter OFF
    fireEvent.click(kanjiFilterBtn);
    
    // 7. Verification C: Character reappears in sidebar
    expect(within(desktopSidebar).getByText(kanjiChar)).toBeInTheDocument();
  });
});