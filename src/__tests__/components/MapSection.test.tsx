// src/__tests__/components/MapSection.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));
vi.mock('@/data/2024-2025/characters.json', () => ({ default: {} }));
vi.mock('@/data/2024-2025/combos.json', () => ({ default: {} }));
vi.mock('@/data/2024-2025/maps.json', () => ({ default: {} }));
vi.mock('@/data/2024-2025/character_mapping.json', () => ({ default: { by_name: {}, by_id: {} } }));
vi.mock('@/data/2026-2027/characters.json', () => ({ default: {} }));
vi.mock('@/data/2026-2027/combos.json', () => ({ default: {} }));
vi.mock('@/data/2026-2027/maps.json', () => ({ default: {} }));
vi.mock('@/data/2026-2027/character_mapping.json', () => ({ default: { by_name: {}, by_id: {} } }));

import { MapSection } from '@/components/MapSection';
import { GameVersionProvider } from '@/contexts/GameVersionContext';
import '@/i18n/config';

const mockProps = {
  mapName: 'スカウ島',
  combos: ['charA&charB', 'charC&charD'],
  selectedComboIds: new Set<string>(),
  toggleCombo: vi.fn(),
  ownedChars: new Set(['charA', 'charB']),
  toggleCharacter: vi.fn(),
  getImagePath: vi.fn(() => '/placeholder.png'),
  showPositionIcon: false,
  isExpanded: false,
  onToggle: vi.fn(),
  onSelectPreview: vi.fn(),
};

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(GameVersionProvider, { initialVersion: '2024-2025' }, children);

describe('MapSection', () => {
  it('renders the map name', () => {
    render(<MapSection {...mockProps} />, { wrapper: Wrapper });
    expect(screen.getByTestId('map-trigger-スカウ島')).toHaveTextContent('スカウ島');
  });

  it('calls onToggle when header is clicked', () => {
    const onToggle = vi.fn();
    render(<MapSection {...mockProps} onToggle={onToggle} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTestId('map-trigger-スカウ島'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('does not render combo cards when collapsed', () => {
    render(<MapSection {...mockProps} isExpanded={false} />, { wrapper: Wrapper });
    expect(screen.queryByText('charA')).not.toBeInTheDocument();
  });

  it('shows progress badge when progress prop is provided', () => {
    render(<MapSection {...mockProps} progress={{ selected: 1, total: 4 }} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByTestId('map-progress-スカウ島')).toHaveTextContent('1/4');
  });

  it('shows just count when no total (2026-2027 style)', () => {
    render(<MapSection {...mockProps} progress={{ selected: 2, total: 0 }} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByTestId('map-progress-スカウ島')).toHaveTextContent('2');
  });

  it('shows completion styling when all combos selected', () => {
    render(<MapSection {...mockProps} progress={{ selected: 2, total: 2 }} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByTestId('map-progress-スカウ島')).toHaveTextContent('2/2');
  });
});
