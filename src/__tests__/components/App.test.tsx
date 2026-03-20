// src/__tests__/App.test.tsx
import { waitFor, within, render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import App from '@/App';
import { supabase } from '@/lib/supabase';

// --- MOCKS ---

vi.mock('@/data/characters.json', () => {
  return import('@/__tests__/fixtures/characters.mock.json').then(module => ({
    default: module.default
  }));
});

vi.mock('@/data/combos.json', () => {
  return import('@/__tests__/fixtures/combos.mock.json').then(module => ({
    default: module.default
  }));
});

vi.mock('@/data/maps.json', () => {
  return import('@/__tests__/fixtures/maps.mock.json').then(module => ({
    default: module.default
  }));
});

// Helper to create a chainable Supabase mock to prevent "select is not a function" errors
const createSupabaseChain = (finalResponse = { data: null, error: null }) => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(finalResponse),
    upsert: vi.fn().mockResolvedValue(finalResponse),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  };
  return chain;
};

// Mock Supabase Client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      })),
      signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn(() => createSupabaseChain()),
  },
}));

describe('App Cloud Sync: Persistence Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;
  const MOCK_USER = { id: 'test-user-uuid', user_metadata: { full_name: 'Test User' } };
  const CHAR_1 = 'マキシマム池田クリスティン';
  const SAVED_CHARS = [CHAR_1];
  const SAVED_COMBOS = ['combo-123'];

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    user = userEvent.setup();

    // Default: Mock as logged in
    (supabase.auth.getSession as any).mockResolvedValue({ 
      data: { session: { user: MOCK_USER } } 
    });
    (supabase.auth.getUser as any).mockResolvedValue({ 
      data: { user: MOCK_USER } 
    });
    (supabase.from as any).mockImplementation(() => createSupabaseChain());
  });

  it('hydrates state from "selected_characters" column on mount', async () => {
    const mockData = {
      selected_characters: SAVED_CHARS,
      selected_combos: SAVED_COMBOS,
      updated_at: new Date().toISOString()
    };

    (supabase.from as any).mockImplementation(() => createSupabaseChain({ data: mockData, error: null }));

    render(<App />);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('user_saves');
    });

    const sidebarWrapper = await screen.findByTestId(`sidebar-icon-wrapper-${CHAR_1}`);
    expect(sidebarWrapper).not.toHaveClass('opacity-30');
    expect(screen.getByText(/Last synced:/i)).toBeInTheDocument();
  });

  it('correctly maps local Sets to "selected_characters" array during save', async () => {
    const mockUpsert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockImplementation(() => ({
      ...createSupabaseChain(),
      upsert: mockUpsert
    }));

    render(<App />);

    const charBtn = await screen.findByTestId(`character-selector-character-name-${CHAR_1}`);
    await user.click(charBtn);

    const saveBtn = screen.getByRole('button', { name: /save configuration/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: MOCK_USER.id,
          selected_characters: expect.arrayContaining([CHAR_1]),
        })
      );
    });
  });

  it('clears local state on SIGNED_OUT event', async () => {
    let authCallback: any;
    (supabase.auth.onAuthStateChange as any).mockImplementation((cb: any) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    (supabase.auth.getSession as any).mockResolvedValue({ 
      data: { session: { user: { id: 'test' } } } 
    });

    render(<App />);
    expect(await screen.findByRole('button', { name: /save configuration/i })).toBeInTheDocument();

    await waitFor(() => {
      authCallback('SIGNED_OUT', null);
    });

    await waitFor(() => {
      const saveBtn = screen.queryByRole('button', { name: /save configuration/i });
      expect(saveBtn).toBeNull();
    }, { timeout: 2000 });
  });
});

describe('App Integration: Combo Rewards Flow', () => {
  let user: ReturnType<typeof userEvent.setup>;
  const CHAR_1 = 'マキシマム池田クリスティン';
  const CHAR_2 = 'エミリ';
  const TARGET_COMBO_ID = `${CHAR_1}&${CHAR_2}`;
  const TARGET_MAP = 'スカウ塔空中庭園'; 

  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    user = userEvent.setup();
    (supabase.auth.getSession as any).mockResolvedValue({ data: { session: null } });
    (supabase.from as any).mockImplementation(() => createSupabaseChain());
  });

  it('filters character list by position but keeps fixed members visible', async () => {
    render(<App />);
    const sidebar = screen.getByTestId('character-sidebar');
    const targetPos = 'マ'; 
    
    const filterBtn = within(sidebar).getByTestId(`filter-button-${targetPos}`);
    await user.click(filterBtn);

    await waitFor(() => {
      expect(within(sidebar).getByTestId('character-selector-character-name-エミリ')).toBeInTheDocument();
      expect(within(sidebar).queryByTestId(`character-selector-character-name-${CHAR_1}`)).not.toBeInTheDocument();
    });
  });

  it('resets to 2/25 baseline when CLEAR button is clicked', async () => {
    render(<App />);
    expect(screen.getByText('2')).toBeInTheDocument();

    const charBtn = await screen.findByTestId(`character-selector-character-name-${CHAR_1}`);
    await user.click(charBtn);
    
    await waitFor(() => { expect(screen.getByText('3')).toBeInTheDocument(); });
    
    const clearBtn = screen.getByRole('button', { name: /CLEAR/i });
    await user.click(clearBtn);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByTestId(`sidebar-icon-wrapper-${CHAR_1}`)).toHaveClass('opacity-30');
    });
  });

  it('separates manager count from the main 25-scout roster', async () => {
    render(<App />);
    const managerBtn = await screen.findByTestId(`character-selector-character-name-${CHAR_2}`);
    await user.click(managerBtn);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/1 \/ 3/i)).toBeInTheDocument();
  });

  it('toggles character ownership when clicking icon inside combo card', async () => {
    render(<App />);
    const mapHeader = await screen.findByRole('button', { name: new RegExp(TARGET_MAP, 'i') });
    await user.click(mapHeader);

    const comboCard = await screen.findByTestId(`combo-card-${TARGET_COMBO_ID}`);
    const charButtonInCombo = within(comboCard).getByTestId(`combo-char-button-${CHAR_1}`);
    
    const sidebarItem = screen.getByTestId(`character-selector-character-name-${CHAR_1}`);
    const sidebarWrapper = within(sidebarItem).getByTestId(`sidebar-icon-wrapper-${CHAR_1}`); 

    expect(sidebarWrapper).toHaveClass('opacity-30');
    await user.click(charButtonInCombo);

    await waitFor(() => {
      expect(sidebarWrapper).not.toHaveClass('opacity-30');
    });
  });

  it('automatically selects combo card when all members are owned', async () => {
    render(<App />);
    const mapHeader = await screen.findByRole('button', { name: new RegExp(TARGET_MAP, 'i') });
    await user.click(mapHeader);

    const comboCard = await screen.findByTestId(`combo-card-${TARGET_COMBO_ID}`);
    const charBtn1 = within(comboCard).getByTestId(`combo-char-button-${CHAR_1}`);
    const charBtn2 = within(comboCard).getByTestId(`combo-char-button-${CHAR_2}`);

    await user.click(charBtn1);
    await user.click(charBtn2);

    await waitFor(() => {
      expect(comboCard).toHaveClass('border-blue-500');
    });
  });

  it('remains selected if manually pinned even after character removal', async () => {
    render(<App />);
    const mapHeader = await screen.findByRole('button', { name: new RegExp(TARGET_MAP, 'i') });
    await user.click(mapHeader);

    const comboCard = await screen.findByTestId(`combo-card-${TARGET_COMBO_ID}`);
    await user.click(comboCard); // Manual pin
    expect(comboCard).toHaveClass('border-blue-500');

    const charBtn1 = within(comboCard).getByTestId(`combo-char-button-${CHAR_1}`);
    await user.click(charBtn1); // Set Owned
    await user.click(charBtn1); // Set Unowned
    
    expect(comboCard).toHaveClass('border-blue-500');
  });
});

describe('App UI/UX: Layout Stability', () => {
  const CHAR_NAME = 'マキシマム池田クリスティン';
  const TARGET_MAP = 'スカウ塔空中庭園';
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    (supabase.auth.getSession as any).mockResolvedValue({ data: { session: null } });
    (supabase.from as any).mockImplementation(() => createSupabaseChain());
  });

  it('applies high-visibility border on unowned sidebar icon hover', async () => {
    render(<App />);
    const sidebar = screen.getByTestId('character-sidebar');
    const sidebarItem = within(sidebar).getByTestId(`character-selector-character-name-${CHAR_NAME}`);
    const wrapper = within(sidebarItem).getByTestId(`sidebar-icon-wrapper-${CHAR_NAME}`);
    expect(wrapper).toHaveClass('group-hover:border-blue-500');
  });

  it('changes border color when hovering an already owned character', async () => {
    render(<App />);
    const mapHeader = await screen.findByRole('button', { name: new RegExp(TARGET_MAP, 'i') });
    await user.click(mapHeader);

    const charButton = await screen.findByTestId(`combo-char-button-${CHAR_NAME}`);
    await user.click(charButton); 
    
    const highlightWrapper = screen.getByTestId(`icon-highlight-wrapper-${CHAR_NAME}`);
    expect(highlightWrapper).toHaveClass('group-hover:border-emerald-300');
  });
});