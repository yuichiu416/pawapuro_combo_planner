// src/__tests__/components/ComboCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ComboCard } from '@/components/ComboCard';

// 1. Mock the skills database
vi.mock('@/data/skills.json', () => ({
  default: {
    "パワーヒッター": {
      "name": "パワーヒッター",
      "description": "強振で飛距離が伸びる",
      "type": "normal"
    }
  }
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
    rewards: {
      skills: [
        { name: "パワーヒッター", level: 3, verified: true }
      ]
    }
  };

  it('should display the skill name and its level', () => {
    render(<ComboCard {...mockProps} />);
    // This WILL fail because the current ComboCard only renders the CharacterGrid
    const skillBadge = screen.getByText(/パワーヒッター/i);
    expect(skillBadge).toBeInTheDocument();
    expect(screen.getByText(/LV.3/i)).toBeInTheDocument();
  });

  it('should display the skill description from the database', () => {
    render(<ComboCard {...mockProps} />);
    // This WILL fail because the description is not in the component at all
    expect(screen.getByText("強振で飛距離が伸びる")).toBeInTheDocument();
  });
  // src/__tests__/components/ComboCard.test.tsx
it('renders characters to the left of the skill rewards', () => {
  render(<ComboCard {...mockProps} />);
  
  const charSection = screen.getByTestId(/character-grid/i);
  const skillSection = screen.getByText(/Combo Rewards/i);
  
  // Basic check: Character grid should appear before the rewards in the DOM
  expect(charSection.compareDocumentPosition(skillSection)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
});

it('applies truncation to long skill descriptions', () => {
  render(<ComboCard {...mockProps} />);
  const description = screen.getByText("強振で飛距離が伸びる");
  expect(description).toHaveClass('truncate');
});
});