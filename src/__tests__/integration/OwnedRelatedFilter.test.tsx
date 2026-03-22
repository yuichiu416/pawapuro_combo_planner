// src/__tests__/integration/OwnedRelatedFilter.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '@/App';
import { describe, it, expect } from 'vitest';

describe('Owned Related Filter - Discovery Flow', () => {
  it('allows searching, adding a character, and filtering for their combos', async () => {
    const user = userEvent.setup();
    render(<App />);

    const searchInput = screen.getByPlaceholderText(/SEARCH/i);
    const filterBtn = screen.getByRole('button', { name: /ALL COMBOS/i });

    await user.type(searchInput, '御幸');
    const charButton = await screen.findByTestId('sidebar-char-御幸一也');
    await user.click(charButton);

    await user.clear(searchInput);
    await user.click(filterBtn);

    const combo1 = await screen.findByTestId('combo-card-御幸一也&成宮鳴');
    const combo2 = await screen.findByTestId('combo-card-御幸一也&皇帝');

    expect(combo1).toBeInTheDocument();
    expect(combo2).toBeInTheDocument();
  });
});

describe('Owned Related Filter - Multi-Character Discovery', () => {
  it('displays combos for all owned characters simultaneously and handles partial removal', async () => {
      const user = userEvent.setup(); // Use userEvent for better event simulation
      render(<App />);

      const searchInput = screen.getByPlaceholderText(/SEARCH/i);
      const filterBtn = screen.getByRole('button', { name: /ALL COMBOS/i });

      await user.type(searchInput, '皇帝');
      const charA = await screen.findByTestId('sidebar-char-皇帝');
      await user.click(charA);

      await user.clear(searchInput);
      await user.type(searchInput, '成宮');
      const charC = await screen.findByTestId('sidebar-char-成宮鳴');
      await user.click(charC);

      await user.clear(searchInput);
      await user.click(filterBtn);

      expect(await screen.findByTestId('combo-card-御幸一也&皇帝')).toBeInTheDocument();
      expect(await screen.findByTestId('combo-card-御幸一也&成宮鳴')).toBeInTheDocument();

      const charA_toRemove = screen.getByTestId('sidebar-char-皇帝');
      await user.click(charA_toRemove); 

      await waitFor(() => {
        expect(screen.queryByTestId('combo-card-御幸一也&皇帝')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      expect(screen.getByTestId('combo-card-御幸一也&成宮鳴')).toBeInTheDocument();
  });
});