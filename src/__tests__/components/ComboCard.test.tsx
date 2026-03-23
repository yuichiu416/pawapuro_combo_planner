// src/__tests__/components/ComboCard.test.tsx
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  it('should display the skill name and correctly formatted level', () => {
    render(<ComboCard {...mockProps} />);
    expect(screen.getByText(/パワーヒッター/i)).toBeInTheDocument();
    // Component renders "Lv3", so we check for Lv followed by the level
    expect(screen.getByText(/Lv3/i)).toBeInTheDocument();
  });

  it('should display the skill description from the mocked database', () => {
    render(<ComboCard {...mockProps} />);
    const expectedDesc = mockData.skills['パワーヒッター'].description;
    expect(screen.getByText(expectedDesc)).toBeInTheDocument();
  });

  // --- SEARCH HIGHLIGHT TESTS ---
  it('applies red highlight classes when a skill name matches searchTerm', () => {
    render(<ComboCard {...mockProps} searchTerm="パワー" />);

    // Targeting via the new data-testids
    const matchingBadge = screen.getByTestId('skill-badge-パワーヒッター');
    const matchingRow = screen.getByTestId('skill-row-パワーヒッター');

    // Verify Badge Inversion (Solid Red)
    expect(matchingBadge).toHaveClass('bg-red-600');
    expect(matchingBadge).toHaveClass('border-red-600');
    expect(matchingBadge).toHaveClass('text-white');

    // Verify Row Background & Border
    expect(matchingRow).toHaveClass('bg-red-50');
    expect(matchingRow).toHaveClass('border-red-200');

    // Verify Description Text color
    const description = screen.getByText(mockData.skills['パワーヒッター'].description);
    expect(description).toHaveClass('text-red-900');
  });

  it('does not highlight non-matching skills within the same card', () => {
    render(<ComboCard {...mockProps} searchTerm="パワー" />);

    const nonMatchingBadge = screen.getByTestId('skill-badge-広角打法');
    const nonMatchingRow = screen.getByTestId('skill-row-広角打法');

    // Should maintain default blue styling (for normal skills), NOT red
    expect(nonMatchingBadge).not.toHaveClass('bg-red-600');
    expect(nonMatchingBadge).toHaveClass('bg-blue-50');

    // Row should be transparent, not red
    expect(nonMatchingRow).not.toHaveClass('bg-red-50');
    expect(nonMatchingRow).toHaveClass('border-transparent');
  });

  it('is case-insensitive and handles Japanese partial matches', () => {
    render(<ComboCard {...mockProps} searchTerm="ヒッター" />);

    const matchingBadge = screen.getByTestId('skill-badge-パワーヒッター');
    expect(matchingBadge).toHaveClass('bg-red-600');
  });

  // --- LAYOUT & UI CONSISTENCY ---
  it('renders characters to the left of the skill rewards', () => {
    render(<ComboCard {...mockProps} />);

    // 1. Grab the two main layout containers by their IDs
    const characterSection = screen.getByTestId('character-section');
    // We find the reward container by traversing up from the "Combo Rewards" text
    const rewardSection = screen.getByText(/Combo Rewards/i).closest('div');

    // 2. Safety check: Ensure both are found
    expect(characterSection).toBeInTheDocument();
    expect(rewardSection).toBeInTheDocument();

    // 3. Verify DOM Order
    // Node.DOCUMENT_POSITION_FOLLOWING (4) means rewardSection is physically
    // located after characterSection in the HTML.
    const position = characterSection.compareDocumentPosition(rewardSection!);

    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('applies truncation to long skill descriptions', () => {
    render(<ComboCard {...mockProps} />);
    const description = screen.getByText(mockData.skills['パワーヒッター'].description);
    expect(description).toHaveClass('truncate');
  });
});
