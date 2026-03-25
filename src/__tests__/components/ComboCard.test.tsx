// src/__tests__/components/ComboCard.test.tsx

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
    names: ['金丸信二', 'ダイジョーブ博士'], // One short, one long
    isSelected: false,
    onToggleCombo: vi.fn(),
    ownedChars: new Set<string>(['金丸信二']),
    toggleCharacter: vi.fn(),
    onAddCharacters: vi.fn(),
    getImagePath: (name: string) => `test-path-${name}.png`,
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

  // --- TYPOGRAPHY & JAPANESE WRAPPING ---
  it('applies strict Japanese line breaking and anywhere wrapping to names', () => {
    render(<ComboCard {...mockProps} />);
    const longName = screen.getByText('ダイジョーブ博士');

    expect(longName).toHaveClass('[line-break:strict]');
    expect(longName).toHaveClass('[overflow-wrap:anywhere]');
    expect(longName).toHaveClass('max-w-[100px]');
  });

  it('correctly maps font sizes based on character name length', () => {
    render(<ComboCard {...mockProps} />);

    // Short name (< 8) -> text-base
    expect(screen.getByText('金丸信二')).toHaveClass('text-base');

    // Long name (> 8) -> text-sm
    expect(screen.getByText('ダイジョーブ博士')).toHaveClass('text-sm');
  });

  // --- CORE DISPLAY TESTS ---
  it('should display the skill name and correctly formatted level via test ID', () => {
    render(<ComboCard {...mockProps} />);

    const skillBadge = screen.getByTestId('skill-badge-パワーヒッター');
    expect(skillBadge).toHaveTextContent('パワーヒッター');
    expect(skillBadge).toHaveTextContent('Lv3');
  });

  it('should display the skill description without truncation', () => {
    render(<ComboCard {...mockProps} />);

    const skillRow = screen.getByTestId('skill-row-パワーヒッター');
    const description = skillRow.querySelector('p');

    // We removed 'truncate' today to allow text to wrap
    expect(description).not.toHaveClass('truncate');
    expect(description).toHaveClass('break-words');
    expect(description).toHaveClass('leading-tight');
  });

  // --- SEARCH HIGHLIGHT TESTS ---
  it('applies red highlight classes when a skill name matches searchTerm', () => {
    render(<ComboCard {...mockProps} searchTerm="パワー" />);

    const matchingBadge = screen.getByTestId('skill-badge-パワーヒッター');
    const matchingRow = screen.getByTestId('skill-row-パワーヒッター');

    expect(matchingBadge).toHaveClass('bg-red-600');
    expect(matchingRow).toHaveClass('bg-red-50/50');

    const description = matchingRow.querySelector('p');
    expect(description).toHaveClass('text-red-900');
  });

  // --- LAYOUT & UI CONSISTENCY ---
  it('renders characters in a centered vertical column on desktop', () => {
    render(<ComboCard {...mockProps} />);
    const characterSection = screen.getByTestId('character-section');

    // Ensure the section is centered as requested
    expect(characterSection).toHaveClass('flex-col');
    expect(characterSection).toHaveClass('items-center');
    expect(characterSection).toHaveClass('lg:w-[220px]');
  });

  it('removes the checkbox icon but keeps selection styling', () => {
    const { container } = render(<ComboCard {...mockProps} isSelected={true} />);

    // Check for border and ring
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('border-blue-600');
    expect(card).toHaveClass('ring-1');

    // Ensure Lucide check icon is gone
    const checkbox = container.querySelector('svg.lucide-check-circle-2');
    expect(checkbox).not.toBeInTheDocument();
  });

  it('renders the add button only when selected and missing characters exist', () => {
    const { rerender } = render(<ComboCard {...mockProps} isSelected={false} />);

    expect(screen.queryByTestId('combo-add-btn')).not.toBeInTheDocument();

    rerender(<ComboCard {...mockProps} isSelected={true} />);
    const addButton = screen.getByTestId('combo-add-btn');

    // One char is owned (金丸信二), so "Add 1" (ダイジョーブ博士)
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveTextContent('Add 1');
  });

  it('triggers character toggle when clicking the avatar button', () => {
    render(<ComboCard {...mockProps} />);
    const avatar = screen.getByAltText('金丸信二').closest('button');

    if (avatar) fireEvent.click(avatar);
    expect(mockProps.toggleCharacter).toHaveBeenCalledWith('金丸信二');
  });
});
