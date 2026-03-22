// src/__tests__/integration/MapProgress.test.tsx
import { render, screen, fireEvent, within } from '@testing-library/react';
import { expect, it, describe } from 'vitest';
import App from '@/App';

describe('Combo Addition Integration', () => {
  it('adds characters to roster after expanding map and selecting combo', async () => {
    render(<App />);

    // 1. Find the Map Section Header and click it to expand
    const mapHeader = screen.getByText(/スカウ島東海岸/i);
    fireEvent.click(mapHeader.closest('div')!);

    // 2. Find and click the ComboCard
    const skillName = "球界の頭脳";
    const nameElement = await screen.findByText(skillName);
    const comboCard = nameElement.closest('div'); 
    fireEvent.click(comboCard!);

    // 3. Find and click the ADD button
    const addButton = await screen.findByText(/ADD \d+/i);
    expect(addButton).toBeInTheDocument();

    const sidebar = screen.getByRole('complementary', { name: 'mobile-character-sidebar' });
    
    // Use 'within' to only look for text inside the sidebar
    const initialRosterCount = within(sidebar).getByText(/ \/ 28/);
    const initialText = initialRosterCount.textContent;

    fireEvent.click(addButton);

    // 4. Final Verification
    const updatedRosterCount = within(sidebar).getByText(/ \/ 28/);
    expect(updatedRosterCount.textContent).not.toBe(initialText);
    /** FIX END **/
  });
});