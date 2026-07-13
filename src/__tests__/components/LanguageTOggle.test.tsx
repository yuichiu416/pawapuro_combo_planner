// src/__tests__/components/LanguageToggle.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import React from 'react';
import '@/i18n/config';

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

import { LanguageToggle } from '@/components/LanguageToggle';
import i18n from '@/i18n/config';

beforeEach(async () => {
  await i18n.changeLanguage('ja');
  localStorage.clear();
});

describe('LanguageToggle', () => {
  it('renders the current language label', () => {
    render(<LanguageToggle />);
    expect(screen.getByTestId('language-toggle-btn')).toHaveTextContent('日本語');
  });

  it('opens the menu when clicked', async () => {
    render(<LanguageToggle />);
    fireEvent.click(screen.getByTestId('language-toggle-btn'));
    await waitFor(() => expect(screen.getByTestId('language-toggle-menu')).toBeInTheDocument());
  });

  it('shows all three language options', async () => {
    render(<LanguageToggle />);
    fireEvent.click(screen.getByTestId('language-toggle-btn'));
    await waitFor(() => screen.getByTestId('language-toggle-menu'));
    expect(screen.getByTestId('language-option-ja')).toBeInTheDocument();
    expect(screen.getByTestId('language-option-en')).toBeInTheDocument();
    expect(screen.getByTestId('language-option-zh')).toBeInTheDocument();
  });

  it('highlights the current language', async () => {
    render(<LanguageToggle />);
    fireEvent.click(screen.getByTestId('language-toggle-btn'));
    await waitFor(() => screen.getByTestId('language-toggle-menu'));
    expect(screen.getByTestId('language-option-ja')).toHaveClass('bg-blue-50');
    expect(screen.getByTestId('language-option-en')).not.toHaveClass('bg-blue-50');
  });

  it('switches language and closes menu when option clicked', async () => {
    render(<LanguageToggle />);
    fireEvent.click(screen.getByTestId('language-toggle-btn'));
    await waitFor(() => screen.getByTestId('language-option-en'));
    fireEvent.click(screen.getByTestId('language-option-en'));
    await waitFor(() => {
      expect(i18n.language).toBe('en');
      expect(screen.queryByTestId('language-toggle-menu')).not.toBeInTheDocument();
    });
  });

  it('persists language choice to localStorage', async () => {
    render(<LanguageToggle />);
    fireEvent.click(screen.getByTestId('language-toggle-btn'));
    await waitFor(() => screen.getByTestId('language-option-zh'));
    fireEvent.click(screen.getByTestId('language-option-zh'));
    await waitFor(() => {
      expect(localStorage.getItem('パワプロ_planner_language')).toBe('zh');
    });
  });

  it('updates button label after language switch', async () => {
    render(<LanguageToggle />);
    fireEvent.click(screen.getByTestId('language-toggle-btn'));
    await waitFor(() => screen.getByTestId('language-option-en'));
    fireEvent.click(screen.getByTestId('language-option-en'));
    await waitFor(() =>
      expect(screen.getByTestId('language-toggle-btn')).toHaveTextContent('English')
    );
  });

  it('closes menu when overlay is clicked', async () => {
    render(<LanguageToggle />);
    fireEvent.click(screen.getByTestId('language-toggle-btn'));
    await waitFor(() => screen.getByTestId('language-toggle-overlay'));
    fireEvent.click(screen.getByTestId('language-toggle-overlay'));
    await waitFor(() =>
      expect(screen.queryByTestId('language-toggle-menu')).not.toBeInTheDocument()
    );
  });
});
