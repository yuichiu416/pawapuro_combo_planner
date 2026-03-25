import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';

// 1. Hoist the fixture factory
const { createMockComboManager } = await vi.hoisted(async () => {
  return await import('./fixtures');
});

// 2. Clean Mock: State logic stays, but data structure is hidden in the factory
vi.mock('@/hooks/useComboManager', () => ({
  useComboManager: () => {
    const [expandedMaps, setExpandedMaps] = useState<Set<string>>(new Set());
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return createMockComboManager({
      expandedMaps,
      isSidebarCollapsed,
      setIsSidebarCollapsed: () => setIsSidebarCollapsed(!isSidebarCollapsed),
      onToggle: (mapName: string) => {
        setExpandedMaps((prev) => {
          const next = new Set(prev);
          next.has(mapName) ? next.delete(mapName) : next.add(mapName);
          return next;
        });
      },
    });
  },
}));

describe('App Integration - Map Expansion', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    cleanup();
    user = userEvent.setup();
  });

  it('should expand and collapse sections using Header buttons', async () => {
    render(<App />);
    expect(screen.queryByTestId('combo-card-パワプロ&矢部明雄')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('expand-collapse-toggle-btn'));
    expect(await screen.findByTestId('combo-card-パワプロ&矢部明雄')).toBeInTheDocument();

    await user.click(screen.getByTestId('expand-collapse-toggle-btn'));
    await waitFor(() => {
      expect(screen.queryByTestId('combo-card-パワプロ&矢部明雄')).not.toBeInTheDocument();
    });
  });

  it('should expand a specific map when clicked via Sidebar', async () => {
    render(<App />);
    const sidebarBtn = screen.getAllByText('スカウ島')[0];
    await user.click(sidebarBtn);

    expect(await screen.findByTestId('combo-card-パワプロ&矢部明雄')).toBeInTheDocument();
  });

  it('sidebar collapse button updates layout classes to mini-sidebar mode', async () => {
    render(<App />);
    const toggleBtn = screen.getByTestId('sidebar-collapse-btn');
    const sidebarContainer = toggleBtn.closest('aside');

    expect(sidebarContainer).toHaveClass('w-[24rem]');
    await user.click(toggleBtn);

    await waitFor(() => {
      expect(sidebarContainer).toHaveClass('w-20');
      expect(sidebarContainer).not.toHaveClass('w-[24rem]');
    });
  });
});
