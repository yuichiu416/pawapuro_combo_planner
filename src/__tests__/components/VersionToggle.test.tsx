// src/__tests__/components/VersionToggle.test.tsx
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import React from 'react';

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

import { GameVersionProvider } from '@/contexts/GameVersionContext';
import { VersionToggle } from '@/components/VersionToggle';

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(GameVersionProvider, { initialVersion: '2024-2025' }, children);

describe('VersionToggle', () => {
  it('renders the current version in the button', () => {
    render(<VersionToggle />, { wrapper: Wrapper });
    expect(screen.getByTestId('version-toggle-button')).toHaveTextContent('2024-2025');
  });

  it('opens the menu when button is clicked', async () => {
    render(<VersionToggle />, { wrapper: Wrapper });
    expect(screen.queryByTestId('version-toggle-menu')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('version-toggle-button'));
    await waitFor(() => expect(screen.getByTestId('version-toggle-menu')).toBeInTheDocument());
  });

  it('shows all versions in the menu in descending order', async () => {
    render(<VersionToggle />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTestId('version-toggle-button'));
    await waitFor(() => expect(screen.getByTestId('version-toggle-menu')).toBeInTheDocument());
    const menu = screen.getByTestId('version-toggle-menu');
    const options = within(menu).getAllByRole('button');
    // Newest version first
    expect(options[0]).toHaveTextContent('2026-2027');
    expect(options[1]).toHaveTextContent('2024-2025');
  });

  it('highlights the current version in the menu', async () => {
    render(<VersionToggle />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTestId('version-toggle-button'));
    await waitFor(() => screen.getByTestId('version-toggle-option-2024-2025'));
    expect(screen.getByTestId('version-toggle-option-2024-2025')).toHaveClass('bg-blue-50');
    expect(screen.getByTestId('version-toggle-option-2026-2027')).not.toHaveClass('bg-blue-50');
  });

  it('closes the menu when the overlay is clicked', async () => {
    render(<VersionToggle />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTestId('version-toggle-button'));
    await waitFor(() => screen.getByTestId('version-toggle-overlay'));
    fireEvent.click(screen.getByTestId('version-toggle-overlay'));
    await waitFor(() => expect(screen.queryByTestId('version-toggle-menu')).not.toBeInTheDocument());
  });

  it('updates displayed version after switching', async () => {
    render(<VersionToggle />, { wrapper: Wrapper });
    fireEvent.click(screen.getByTestId('version-toggle-button'));
    await waitFor(() => screen.getByTestId('version-toggle-option-2026-2027'));
    fireEvent.click(screen.getByTestId('version-toggle-option-2026-2027'));
    await waitFor(() => expect(screen.getByTestId('version-toggle-button')).toHaveTextContent('2026-2027'));
    expect(screen.queryByTestId('version-toggle-menu')).not.toBeInTheDocument();
  });
});
