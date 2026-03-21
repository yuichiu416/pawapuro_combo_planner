// src/__tests__/components/ComboCard.test.tsx
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComboCard } from '@/components/ComboCard';

// 1. Use vi.hoisted to import your master fixtures before the mocks run
const { mockData } = await vi.hoisted(async () => {
  const { mockData } = await import('../fixtures');
  return { mockData };
});

// 2. Mock the skills database using your fixture data
vi.mock('@/data/skills.json', () => ({
  default: mockData.skills
}));

describe('ComboCard Rewards Display & Search Highlighting', () => {
  const mockProps = {
    names: ['金丸信二', '千代姫'],
    isSelected: false,
    onToggleCombo: vi.fn(),
    ownedChars: new Set<string>(),
    toggleCharacter: vi.fn(),
    getImagePath: () => 'test-path.png',
    showPositionIcon: true,
    rewards: {
      skills: [
        { name: "パワーヒッター", level: 3, verified: true },
        { name: "広角打法", level: 1, verified: false }
      ]
    }
  };

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  // --- EXISTING TESTS ---
  it('should display the skill name and its level', () => {
    render(<ComboCard {...mockProps} />);
    expect(screen.getByText(/パワーヒッター/i)).toBeInTheDocument();
    expect(screen.getByText(/LV.3/i)).toBeInTheDocument();
  });

  it('should display the skill description from the mocked database', () => {
    render(<ComboCard {...mockProps} />);
    const expectedDesc = mockData.skills["パワーヒッター"].description;
    expect(screen.getByText(expectedDesc)).toBeInTheDocument();
  });

  // --- NEW SEARCH HIGHLIGHT TESTS ---
  it('applies red highlight classes when a skill name matches searchTerm', () => {
    // Search specifically for "Power" (パワー)
    render(<ComboCard {...mockProps} searchTerm="パワー" />);

    const matchingSkill = screen.getByText(/パワーヒッター/i);
    const matchingBadge = matchingSkill.closest('div');
    const matchingRow = matchingSkill.closest('.rounded-xl');

    // Verify Badge Inversion (Solid Red)
    expect(matchingBadge).toHaveClass('bg-red-600');
    expect(matchingBadge).toHaveClass('border-red-600');
    expect(matchingBadge).toHaveClass('text-white');

    // Verify Row Background & Border Swap
    expect(matchingRow).toHaveClass('bg-red-50');
    expect(matchingRow).toHaveClass('border-red-200');

    // Verify Description Text color
    const description = screen.getByText(mockData.skills["パワーヒッター"].description);
    expect(description).toHaveClass('text-red-900');
  });

  it('does not highlight non-matching skills within the same card', () => {
    render(<ComboCard {...mockProps} searchTerm="パワー" />);

    const nonMatchingSkill = screen.getByText(/広角打法/i);
    const nonMatchingBadge = nonMatchingSkill.closest('div');
    const nonMatchingRow = nonMatchingSkill.closest('.rounded-xl');

    // Should maintain default blue styling, NOT red
    expect(nonMatchingBadge).not.toHaveClass('bg-red-600');
    expect(nonMatchingBadge).toHaveClass('bg-blue-50');
    expect(nonMatchingRow).not.toHaveClass('bg-red-50');
    expect(nonMatchingRow).toHaveClass('border-transparent');
  });

  it('is case-insensitive and handles Japanese partial matches', () => {
    render(<ComboCard {...mockProps} searchTerm="ヒッター" />);
    
    const matchingBadge = screen.getByText(/パワーヒッター/i).closest('div');
    expect(matchingBadge).toHaveClass('bg-red-600');
  });

  // --- LAYOUT & UI CONSISTENCY ---
  it('renders characters to the left of the skill rewards', () => {
    render(<ComboCard {...mockProps} />);
    const charSection = screen.getByTestId(/character-grid/i);
    const rewardHeader = screen.getByText(/Combo Rewards/i);
    
    expect(charSection.compareDocumentPosition(rewardHeader)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('applies truncation to long skill descriptions', () => {
    render(<ComboCard {...mockProps} />);
    const description = screen.getByText(mockData.skills["パワーヒッター"].description);
    expect(description).toHaveClass('truncate');
  });
});