// src/__tests__/components/ComboCard.test.tsx
import { cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComboCard } from '@/components/ComboCard';

// 1. Import fixtures correctly using vi.hoisted
const { mockData } = await vi.hoisted(async () => {
  const { mockData } = await import('../fixtures');
  return { mockData };
});

// 2. Mock the skills database
vi.mock('@/data/skills.json', () => ({
  default: mockData.skills,
}));

describe('ComboCard Rewards Display & Search Highlighting', () => {
  const mockProps = {
    names: ['金丸信二', '千代姫'],
    isSelected: false,
    onToggleCombo: vi.fn(),
    ownedChars: new Set<string>(),
    toggleCharacter: vi.fn(),
    onAddCharacters: vi.fn(),
    getImagePath: () => 'test-path.png',
    showPositionIcon: true,
    rewards: {
      skills: [
        { name: 'パワーヒッター', level: 3, verified: true },
        { name: '広角打法', level: 1, verified: false },
      ],
    },
  };

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // --- CORE DISPLAY TESTS ---
  it('should display the skill name and correctly formatted level via test ID', () => {
    render(<ComboCard {...mockProps} />);

    const skillBadge = screen.getByTestId('skill-badge-パワーヒッター');
    expect(skillBadge).toHaveTextContent('パワーヒッター');
    expect(skillBadge).toHaveTextContent('Lv3');
  });

  it('should display the skill description from the mocked database', () => {
    render(<ComboCard {...mockProps} />);

    const skillRow = screen.getByTestId('skill-row-パワーヒッター');
    const expectedDesc = mockData.skills['パワーヒッター'].description;

    // Check that the row contains the correct description text
    expect(skillRow).toHaveTextContent(expectedDesc);
  });

  // --- SEARCH HIGHLIGHT TESTS ---
  it('applies red highlight classes when a skill name matches searchTerm', () => {
    render(<ComboCard {...mockProps} searchTerm="パワー" />);

    const matchingBadge = screen.getByTestId('skill-badge-パワーヒッター');
    const matchingRow = screen.getByTestId('skill-row-パワーヒッター');

    // Verify Badge Inversion
    expect(matchingBadge).toHaveClass('bg-red-600');
    expect(matchingBadge).toHaveClass('text-white');

    // Verify Row Background
    expect(matchingRow).toHaveClass('bg-red-50');

    // Verify Description Text color within that row
    const description = matchingRow.querySelector('p');
    expect(description).toHaveClass('text-red-900');
  });

  it('does not highlight non-matching skills within the same card', () => {
    render(<ComboCard {...mockProps} searchTerm="パワー" />);

    const nonMatchingBadge = screen.getByTestId('skill-badge-広角打法');
    const nonMatchingRow = screen.getByTestId('skill-row-広角打法');

    expect(nonMatchingBadge).not.toHaveClass('bg-red-600');
    expect(nonMatchingRow).not.toHaveClass('bg-red-50');
  });

  it('is case-insensitive and handles Japanese partial matches', () => {
    render(<ComboCard {...mockProps} searchTerm="ヒッター" />);

    const matchingBadge = screen.getByTestId('skill-badge-パワーヒッター');
    expect(matchingBadge).toHaveClass('bg-red-600');
  });

  // --- LAYOUT & UI CONSISTENCY ---
  it('renders characters to the left of the skill rewards', () => {
    render(<ComboCard {...mockProps} />);

    const characterSection = screen.getByTestId('character-section');
    const skillRow = screen.getByTestId('skill-row-パワーヒッター');
    const rewardSection = skillRow.parentElement;

    expect(characterSection).toBeInTheDocument();
    expect(rewardSection).toBeInTheDocument();

    const position = characterSection.compareDocumentPosition(rewardSection!);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('applies truncation to long skill descriptions', () => {
    render(<ComboCard {...mockProps} />);

    const matchingRow = screen.getByTestId('skill-row-パワーヒッター');
    const description = matchingRow.querySelector('p');

    expect(description).toHaveClass('truncate');
  });

  it('renders the add button only when selected and missing characters exist', () => {
    const { rerender } = render(<ComboCard {...mockProps} isSelected={false} />);

    // 1. Should not show add button when not selected
    expect(screen.queryByTestId('combo-add-btn')).not.toBeInTheDocument();

    // 2. Should show add button when selected
    rerender(<ComboCard {...mockProps} isSelected={true} />);
    const addButton = screen.getByTestId('combo-add-btn');

    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveTextContent('Add 2');
  });
});
