// src/components/__tests__/CharacterGrid.test.tsx
import { render, screen } from '@testing-library/react';
import { CharacterGrid } from '@/components/CharacterGrid';

describe('CharacterGrid Component', () => {
  const mockProps = {
    characters: ['マキシマム池田クリスティン'],
    ownedChars: new Set<string>(),
    onToggle: vi.fn(), // Changed from toggleCharacter to onToggle
    getImagePath: () => '/path/to/img.png',
    showPositionIcon: false,
  };

  it('renders characters with the unowned opacity class', () => {
    render(<CharacterGrid {...mockProps} />);
    const button = screen.getByTestId(/combo-char-button/);
    // button.firstChild should be our icon-highlight-wrapper
    expect(button.firstChild).toHaveClass('opacity-50');
  });
});