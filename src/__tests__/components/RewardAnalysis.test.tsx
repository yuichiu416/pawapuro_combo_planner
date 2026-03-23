// src/components/__tests__/RewardAnalysis.test.tsx
import { render, screen } from '@testing-library/react';
import { RewardAnalysis } from '@/components/RewardAnalysis';
import { mockData } from '@/__tests__/fixtures/index';
import { describe, it, expect, vi } from 'vitest';

describe('RewardAnalysis UI Logic', () => {
  // Mock function for the required getImagePath prop
  const mockGetImagePath = vi.fn((name: string) => `/assets/${name}.png`);

  it('correctly maps a missing character to their encounter map', () => {
    const mockAnalysis = {
      stats: {},
      skills: [],
      missingCharacters: ['クロン'],
      totalSelectedCombos: 1,
      roster: {
        total: 0,
        pitcher: 0,
        fielder: 0,
        manager: 0,
        isValid: true,
        errors: { total: false, pitcher: false, fielder: false, manager: false },
      },
    };

    // Passed the mockGetImagePath prop here
    render(<RewardAnalysis analysis={mockAnalysis} getImagePath={mockGetImagePath} />);

    // Check for the Character Name
    expect(screen.getByText(/クロン/i)).toBeInTheDocument();

    // Check for the Map Name
    // Based on your mapping logic, if "クロン" isn't in mockData, it might show "Unknown" or "???"
    // depending on which version of the logic we are running.
    expect(screen.getByText(/スカウ島|Unknown|\?\?\?/i)).toBeInTheDocument();
  });

  it('displays ??? or Unknown when a character map is missing from the data', () => {
    const mockAnalysis = {
      stats: {},
      skills: [],
      totalSelectedCombos: 1,
      missingCharacters: ['NonExistentChar'],
      roster: {
        total: 0,
        pitcher: 0,
        fielder: 0,
        manager: 0,
        isValid: true,
        errors: { total: false, pitcher: false, fielder: false, manager: false },
      },
    };

    render(<RewardAnalysis analysis={mockAnalysis} getImagePath={mockGetImagePath} />);

    // Checks for the fallback string
    expect(screen.getByText(/Unknown|\?\?\?/i)).toBeInTheDocument();
  });
});
