// src/__tests__/components/ComboCard.test.tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
    names: ['金丸信二', 'ダイジョーブ博士'],
    isSelected: false,
    onToggleCombo: vi.fn(),
    ownedChars: new Set<string>(['金丸信二']),
    toggleCharacter: vi.fn(),
    onAddCharacters: vi.fn(),
    setSelectedPreview: vi.fn(),
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

  // --- 1. TYPOGRAPHY & WRAPPING ---
  it('applies strict Japanese anywhere wrapping to names', () => {
    render(<ComboCard {...mockProps} />);
    const longName = screen.getByTestId('combo-card-p-ダイジョーブ博士');

    // Updated to match component's exact wrapping class
    expect(longName).toHaveClass('[overflow-wrap:anywhere]');
    expect(longName).toHaveClass('break-words');
  });

  // --- 2. CORE DISPLAY & OWNERSHIP ---
  it('renders character names and ownership state correctly', () => {
    render(<ComboCard {...mockProps} />);

    // Owned state: text-[#003D87]
    expect(screen.getByTestId('combo-card-p-金丸信二')).toHaveClass('text-[#003D87]');
    // Unowned state: text-slate-400
    expect(screen.getByTestId('combo-card-p-ダイジョーブ博士')).toHaveClass('text-slate-400');
  });

  it('should display the skill name, level, and verified badge', () => {
    render(<ComboCard {...mockProps} />);

    const skillBadge = screen.getByTestId('skill-badge-パワーヒッター');
    expect(skillBadge).toHaveTextContent('パワーヒッター');
    expect(skillBadge).toHaveTextContent('Lv3');

    // Updated to match high-contrast yellow for gold skills: bg-[#FFF200]
    expect(skillBadge).toHaveClass('bg-[#FFF200]');
  });

  it('should display the skill description', () => {
    render(<ComboCard {...mockProps} />);

    const skillRow = screen.getByTestId('skill-row-パワーヒッター');
    const description = skillRow.querySelector('p');

    expect(description).toHaveClass('text-sm');
    expect(description).toHaveTextContent('Increases power significantly');
  });

  // --- 3. SEARCH HIGHLIGHT TESTS ---
  it('applies rose highlight classes when a skill name matches searchTerm', () => {
    render(<ComboCard {...mockProps} searchTerm="パワー" />);

    const matchingBadge = screen.getByTestId('skill-badge-パワーヒッター');
    const matchingRow = screen.getByTestId('skill-row-パワーヒッター');

    // Matches component: bg-rose-600 for badge, bg-rose-50 for row
    expect(matchingBadge).toHaveClass('bg-rose-600');
    expect(matchingRow).toHaveClass('bg-rose-50');
  });

  // --- 4. INTERACTION & PREVIEW LOGIC ---
  it('calls onToggleCombo when the card body is clicked', () => {
    render(<ComboCard {...mockProps} />);
    const comboId = mockProps.names.join('&');
    const card = screen.getByTestId(`combo-card-container-${comboId}`);

    fireEvent.click(card);
    expect(mockProps.onToggleCombo).toHaveBeenCalled();
  });

  it('triggers character preview when clicking the avatar button', () => {
    render(<ComboCard {...mockProps} />);
    const avatar = screen.getByTestId('combo-card-character-icon-btn-金丸信二');

    fireEvent.click(avatar);
    expect(mockProps.setSelectedPreview).toHaveBeenCalledWith('金丸信二');
  });

  it('renders the add button and triggers onAddCharacters correctly', () => {
    const { rerender } = render(<ComboCard {...mockProps} isSelected={false} />);
    expect(screen.queryByTestId('combo-add-btn')).not.toBeInTheDocument();

    rerender(<ComboCard {...mockProps} isSelected={true} />);
    const addButton = screen.getByTestId('combo-add-btn');

    // Verify button text and click logic
    expect(addButton).toHaveTextContent('Add Missing (1)');
    fireEvent.click(addButton);
    expect(mockProps.onAddCharacters).toHaveBeenCalledWith(['ダイジョーブ博士']);
  });

  // --- 5. LAYOUT & STYLE REGRESSION ---
  it('renders characters in a layout consistent with the VS/Duo design', () => {
    render(<ComboCard {...mockProps} />);
    const characterSection = screen.getByTestId('character-section');

    expect(characterSection).toHaveClass('lg:w-[240px]');
    expect(characterSection).toHaveClass('lg:border-r');
  });

  it('applies selection styling correctly', () => {
    const comboId = mockProps.names.join('&');
    render(<ComboCard {...mockProps} isSelected={true} />);
    const card = screen.getByTestId(`combo-card-container-${comboId}`);

    // Updated to match refined hex-based styles
    expect(card).toHaveClass('border-[#0059C1]');
    expect(card).toHaveClass('scale-[1.01]');
    expect(card).toHaveClass('shadow-[0_8px_24px_rgba(0,89,193,0.12)]');
  });
});
