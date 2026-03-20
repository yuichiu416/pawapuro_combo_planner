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

describe('ComboCard Rewards Display', () => {
  const mockProps = {
    names: ['金丸信二', '千代姫'],
    isSelected: false,
    onToggleCombo: vi.fn(),
    ownedChars: new Set<string>(),
    toggleCharacter: vi.fn(),
    getImagePath: () => 'test-path.png',
    showPositionIcon: true,
    // We can pull these values directly from our combo fixture if we want
    rewards: {
      skills: [
        { name: "パワーヒッター", level: 3, verified: true }
      ]
    }
  };

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should display the skill name and its level', () => {
    render(<ComboCard {...mockProps} />);
    
    // Checks for the skill name from our rewards prop
    expect(screen.getByText(/パワーヒッター/i)).toBeInTheDocument();
    expect(screen.getByText(/LV.3/i)).toBeInTheDocument();
  });

  it('should display the skill description from the mocked database', () => {
    render(<ComboCard {...mockProps} />);
    
    /** * This looks up "パワーヒッター" in your mockData.skills fixture.
     * Ensure your fixtures.ts has: 
     * skills: { "パワーヒッター": { description: "強振で飛距離が伸びる", ... } }
     */
    const expectedDesc = mockData.skills["パワーヒッター"].description;
    expect(screen.getByText(expectedDesc)).toBeInTheDocument();
  });

  it('renders characters to the left of the skill rewards', () => {
    render(<ComboCard {...mockProps} />);
    
    // Note: Ensure your ComboCard has data-testid="character-grid"
    const charSection = screen.getByTestId(/character-grid/i);
    const rewardHeader = screen.getByText(/Combo Rewards/i);
    
    // Verifies layout order
    expect(charSection.compareDocumentPosition(rewardHeader)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('applies truncation to long skill descriptions', () => {
    render(<ComboCard {...mockProps} />);
    const description = screen.getByText(mockData.skills["パワーヒッター"].description);
    
    // Verifies that Tailwind's truncate class is applied for UI consistency
    expect(description).toHaveClass('truncate');
  });
});