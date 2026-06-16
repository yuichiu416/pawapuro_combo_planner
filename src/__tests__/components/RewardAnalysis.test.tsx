// src/components/__tests__/RewardAnalysis.test.tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RewardAnalysis } from '@/components/RewardAnalysis';

/**
 * RewardAnalysis UI Logic Tests
 * * Focuses on verifying:
 * 1. Correct rendering of missing characters and maps.
 * 2. Highlighting and selection logic for skill rewards.
 * 3. Proper application of error styles in the roster section.
 */
describe('RewardAnalysis UI Logic', () => {
  const mockGetImagePath = vi.fn((name: string) => `/assets/${name}.png`);
  const mockOnToggleSkillFilter = vi.fn();

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const defaultProps = {
    testId: 'mobile-reward-analysis',
    charactersData: {} as Record<string, any>,
    getImagePath: mockGetImagePath,
    activeSkillFilter: null,
    onToggleSkillFilter: mockOnToggleSkillFilter,
  };

  it('correctly displays a missing character and their encounter map using test IDs', () => {
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

    const TEST_ID = 'mobile-reward-analysis';

    render(<RewardAnalysis {...defaultProps} analysis={mockAnalysis} />);

    // 1. Verify the character row exists
    const charRow = screen.getByTestId(`${TEST_ID}-missing-char-row-クロン`);
    expect(charRow).toBeInTheDocument();
    expect(charRow).toHaveTextContent('クロン');

    // 2. Verify the map location specifically within that character's context
    const mapBadge = screen.getByTestId(`${TEST_ID}-missing-char-map-クロン`);
    // Matches the map name or fallbacks
    expect(mapBadge.textContent).toMatch(/スカウ島|Unknown|\?\?\?/i);
  });

  it('renders the correct number of missing character items', () => {
    const mockAnalysis = {
      stats: {},
      skills: [],
      missingCharacters: ['CharA', 'CharB'],
      totalSelectedCombos: 1,
      roster: {
        total: 2,
        pitcher: 0,
        fielder: 0,
        manager: 0,
        isValid: true,
        errors: { total: false, pitcher: false, fielder: false, manager: false },
      },
    };

    render(<RewardAnalysis {...defaultProps} analysis={mockAnalysis} />);

    const TEST_ID = 'mobile-reward-analysis';

    // Verify list length by querying all test IDs starting with the prefix
    const rows = screen.getAllByTestId(new RegExp(`^${TEST_ID}-missing-char-row-`, 'i'));
    expect(rows).toHaveLength(2);
  });

  it('applies the active highlight style when a skill is selected', () => {
    const mockAnalysis = {
      stats: {},
      skills: [{ name: 'Power Hitter', level: 3 }],
      missingCharacters: [],
      totalSelectedCombos: 1,
      roster: {
        total: 10,
        pitcher: 5,
        fielder: 5,
        manager: 0,
        isValid: true,
        errors: { total: false, pitcher: false, fielder: false, manager: false },
      },
    };

    const TEST_ID = 'mobile-reward-analysis';

    // Render with 'Power Hitter' as the active filter
    render(
      <RewardAnalysis {...defaultProps} analysis={mockAnalysis} activeSkillFilter="Power Hitter" />,
    );

    const skillButton = screen.getByTestId(`${TEST_ID}-skill-button-Power Hitter`);

    // Check for the specific Tailwind classes used for the active state
    expect(skillButton).toHaveClass('ring-2', 'ring-blue-500', 'border-blue-500');
  });

  it('calls onToggleSkillFilter when a skill button is clicked', () => {
    const mockAnalysis = {
      stats: {},
      skills: [{ name: 'Contact Artist', level: 1 }],
      missingCharacters: [],
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

    render(<RewardAnalysis {...defaultProps} analysis={mockAnalysis} />);

    const skillButton = screen.getByTestId(`${defaultProps.testId}-skill-button-Contact Artist`);
    fireEvent.click(skillButton);

    expect(mockOnToggleSkillFilter).toHaveBeenCalledWith('Contact Artist');
  });

  it('renders roster cards with error styles when validation fails', () => {
    const mockAnalysis = {
      stats: {},
      skills: [],
      missingCharacters: [],
      totalSelectedCombos: 0,
      roster: {
        total: 30,
        pitcher: 10,
        fielder: 20,
        manager: 0,
        isValid: false,
        errors: { total: true, pitcher: true, fielder: true, manager: false },
      },
    };

    render(<RewardAnalysis {...defaultProps} analysis={mockAnalysis} />);

    const totalCard = screen.getByTestId(`${defaultProps.testId}-roster-card-total`);
    const pitchCard = screen.getByTestId(`${defaultProps.testId}-roster-card-pitch`);

    // Check for rose/red error classes
    expect(totalCard).toHaveClass('border-rose-300', 'bg-rose-50');
    expect(pitchCard).toHaveClass('border-rose-300', 'bg-rose-50');
  });
});

const mockAnalysis = {
  stats: {},
  skills: [
    { name: 'Power Hit', level: 6 }, // Over limit
    { name: 'Golden Arm', level: 3 }, // Normal gold
  ],
  missingCharacters: [],
  roster: {
    pitcher: 0,
    fielder: 0,
    manager: 0,
    total: 0,
    errors: {},
  },
};

const defaultProps = {
  analysis: mockAnalysis,
  getImagePath: (name: string) => `/path/${name}.png`,
  testId: 'reward-analysis',
  activeSkillFilter: null,
  onToggleSkillFilter: vi.fn(),
};

describe('RewardAnalysis Level Warning', () => {
  it('should apply rose warning classes and bounce animation when level is > 5', () => {
    render(<RewardAnalysis {...defaultProps} />);

    // Find the LV6 badge for Power Hit
    const overLimitBadge = screen.getByText('LV6');

    // Check for the specific warning classes added in the previous step
    expect(overLimitBadge.className).toContain('text-rose-600');
    expect(overLimitBadge.className).toContain('border-rose-400');
    expect(overLimitBadge.className).toContain('bg-rose-50');

    // Verify the custom bounce animation is present
    expect(overLimitBadge.className).toContain('animate-[bounce_0.5s_ease-in-out_2]');
  });

  it('should apply blue rose styling when an over-limit skill is active', () => {
    render(<RewardAnalysis {...defaultProps} activeSkillFilter="Power Hit" />);

    const activeOverLimitBadge = screen.getByText('LV6');

    // Should combine active state with rose warning colors
    expect(activeOverLimitBadge.className).toContain('bg-rose-600');
    expect(activeOverLimitBadge.className).toContain('text-white');
    expect(activeOverLimitBadge.className).toContain('scale-110');
  });

  it('should NOT apply warning classes to skills at or below level 5', () => {
    render(<RewardAnalysis {...defaultProps} />);

    const normalBadge = screen.getByText('LV3');

    // Should use standard gold or slate colors, not rose
    expect(normalBadge.className).not.toContain('text-rose-600');
    expect(normalBadge.className).not.toContain('animate-bounce');
  });
});
