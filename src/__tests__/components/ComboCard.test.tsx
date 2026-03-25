// src/__tests__/components/ComboCard.test.tsx
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComboCard } from '@/components/ComboCard';

// Mock the skills database for consistent testing
vi.mock('@/data/skills.json', () => ({
  default: {
    パワーヒッター: { description: 'Increases power significantly', type: 'gold' },
    広角打法: { description: 'Better contact hitting', type: 'normal' },
    Contact: { description: 'Better contact hitting', type: 'normal' },
  },
}));

describe('ComboCard: Comprehensive Logic & UI Tests', () => {
  const mockProps = {
    names: ['金丸信二', 'ダイジョーブ博士'], // One short (4), one long (8)
    isSelected: false,
    onToggleCombo: vi.fn(),
    ownedChars: new Set<string>(['金丸信二']),
    toggleCharacter: vi.fn(),
    onAddCharacters: vi.fn(),
    setSelectedPreview: vi.fn(), // New Preview Architecture
    getImagePath: (name: string) => `test-path-${name}.png`,
    showPositionIcon: true,
    searchTerm: '',
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

  // --- 1. TYPOGRAPHY & JAPANESE WRAPPING (Restored) ---
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

    // Long name (>= 8) -> text-sm
    expect(screen.getByText('ダイジョーブ博士')).toHaveClass('text-sm');
  });

  // --- 2. CORE DISPLAY & OWNERSHIP ---
  it('renders character names and ownership state correctly', () => {
    render(<ComboCard {...mockProps} />);

    // Emerald for owned
    expect(screen.getByText('金丸信二')).toHaveClass('text-emerald-700');
    // Slate for unowned
    expect(screen.getByText('ダイジョーブ博士')).toHaveClass('text-slate-900');
  });

  it('should display the skill name, level, and verified badge', () => {
    render(<ComboCard {...mockProps} />);

    const skillBadge = screen.getByTestId('skill-badge-パワーヒッター');
    expect(skillBadge).toHaveTextContent('パワーヒッター');
    expect(skillBadge).toHaveTextContent('Lv3');

    // Check for Gold styling based on mock
    expect(skillBadge).toHaveClass('bg-amber-100');
  });

  it('should display the skill description without truncation (Restored)', () => {
    render(<ComboCard {...mockProps} />);

    const skillRow = screen.getByTestId('skill-row-パワーヒッター');
    const description = skillRow.querySelector('p');

    expect(description).not.toHaveClass('truncate');
    expect(description).toHaveClass('break-words');
    expect(description).toHaveClass('leading-tight');
  });

  // --- 3. SEARCH HIGHLIGHT TESTS ---
  it('applies red highlight classes when a skill name matches searchTerm', () => {
    render(<ComboCard {...mockProps} searchTerm="パワー" />);

    const matchingBadge = screen.getByTestId('skill-badge-パワーヒッター');
    const matchingRow = screen.getByTestId('skill-row-パワーヒッター');

    expect(matchingBadge).toHaveClass('bg-red-600');
    expect(matchingRow).toHaveClass('bg-red-50/50');

    const description = matchingRow.querySelector('p');
    expect(description).toHaveClass('text-red-900');
  });

  // --- 4. INTERACTION & PREVIEW LOGIC ---
  it('calls onToggleCombo when the card body is clicked', () => {
    render(<ComboCard {...mockProps} />);
    const comboId = mockProps.names.join('&');
    const card = screen.getByTestId(`combo-card-${comboId}`);

    fireEvent.click(card);
    expect(mockProps.onToggleCombo).toHaveBeenCalled();
  });

  it('triggers character preview when clicking the avatar button (Updated)', () => {
    render(<ComboCard {...mockProps} />);
    const avatar = screen.getByAltText('金丸信二').closest('button');

    if (avatar) fireEvent.click(avatar);

    // Verified: Now calls Preview, not Toggle
    expect(mockProps.setSelectedPreview).toHaveBeenCalledWith('金丸信二');
    expect(mockProps.toggleCharacter).not.toHaveBeenCalled();
  });

  it('renders the add button and triggers onAddCharacters correctly', () => {
    const { rerender } = render(<ComboCard {...mockProps} isSelected={false} />);
    expect(screen.queryByTestId('combo-add-btn')).not.toBeInTheDocument();

    rerender(<ComboCard {...mockProps} isSelected={true} />);
    const addButton = screen.getByTestId('combo-add-btn');

    // Only 1 char is missing (ダイジョーブ博士)
    expect(addButton).toHaveTextContent('Add 1');

    fireEvent.click(addButton);
    expect(mockProps.onAddCharacters).toHaveBeenCalledWith(['ダイジョーブ博士']);
  });

  // --- 5. LAYOUT CONSISTENCY ---
  it('renders characters in a centered vertical column on desktop', () => {
    render(<ComboCard {...mockProps} />);
    const characterSection = screen.getByTestId('character-section');

    expect(characterSection).toHaveClass('flex-col');
    expect(characterSection).toHaveClass('items-center');
    expect(characterSection).toHaveClass('lg:w-[220px]');
  });

  it('applies selection styling without rendering a checkbox icon', () => {
    const { container } = render(<ComboCard {...mockProps} isSelected={true} />);
    const card = container.firstChild as HTMLElement;

    expect(card).toHaveClass('border-blue-600');
    expect(card).toHaveClass('ring-1');

    // Ensure Lucide check icon is NOT present
    const checkbox = container.querySelector('svg.lucide-check-circle-2');
    expect(checkbox).not.toBeInTheDocument();
  });
});
