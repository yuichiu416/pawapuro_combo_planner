// src/__tests__/integration/MapProgress.test.tsx
import { render, screen, fireEvent, within } from '@testing-library/react';
import { expect, it, describe } from 'vitest';
import App from '@/App';

describe('Combo Addition Integration', () => {
  it('adds characters to roster after expanding map and selecting combo', async () => {
    render(<App />);

    // 1. Find the Map Section Header and click it to expand
    // We look for the h2 inside the clickable div
    const mapHeader = screen.getByText(/スカウ島東海岸/i);
    fireEvent.click(mapHeader.closest('div')!);

    // 2. Find the ComboCard (which is a div)
    // We can find it by looking for a character name that should be inside it
    const skillName = "球界の頭脳";
    const nameElement = await screen.findByText(skillName);
    
    // We need to click the clickable part of the ComboCard. 
    // Since it's a div, we find the closest parent that handles the click.
    const comboCard = nameElement.closest('div'); 
    fireEvent.click(comboCard!);

    // 3. Find and click the ADD button
    // The "ADD X" button only renders once the combo is selected (isSelected === true)
    // Use findByText to wait for the conditional rendering/animation
    const addButton = await screen.findByText(/ADD \d+/i);
    expect(addButton).toBeInTheDocument();

    // Capture initial roster state
    const initialRosterCount = screen.getByText(/ \/ 28/);
    const initialText = initialRosterCount.textContent;

    fireEvent.click(addButton);

    // 4. Final Verification
    // The Active Roster count in the sidebar should update
    const updatedRosterCount = screen.getByText(/ \/ 28/);
    expect(updatedRosterCount.textContent).not.toBe(initialText);
  });
});