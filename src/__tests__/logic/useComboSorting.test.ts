// src/__tests__/hooks/useComboSorting.test.ts

import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { GameVersionProvider } from '@/contexts/GameVersionContext';
import combosDataRaw from '@/data/2024-2025/combos.json';
import skillsDataRaw from '@/data/skills.json';
import { useComboManager } from '@/hooks/useComboManager';

// Mocking Supabase to prevent network calls during hook initialization
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

// Wrapper that pins the active version to 2024-2025 so the test's combosDataRaw matches
// what the hook actually loads — without this the hook defaults to the newest version.
const Wrapper2024 = ({ children }: { children: React.ReactNode }) => {
  // Seed localStorage so GameVersionProvider initialises to 2024-2025
  window.localStorage.setItem('パワプロ_planner_game_version', '2024-2025');
  return React.createElement(GameVersionProvider, null, children);
};

describe('useComboManager - Skill Sorting Logic', () => {
  it('should verify that filteredComboIds contains combos with sorted skills', () => {
    const { result } = renderHook(() => useComboManager(), { wrapper: Wrapper2024 });

    // We check the first few combos to ensure sorting was applied via the map function
    const comboIds = result.current.filteredComboIds;
    const combosData = combosDataRaw as Record<string, any>;
    const skillsData = skillsDataRaw as Record<string, any>;

    comboIds.slice(0, 5).forEach((id) => {
      const combo = Object.values(combosData).find((c) => c.characters.join('&') === id);

      if (combo?.rewards?.skills && combo.rewards.skills.length > 1) {
        const skills = combo.rewards.skills;

        for (let i = 0; i < skills.length - 1; i++) {
          const current = skills[i];
          const next = skills[i + 1];

          const typeCurrent = skillsData[current.name]?.type || 'normal';
          const typeNext = skillsData[next.name]?.type || 'normal';

          // 1. Gold Priority: If the next skill is gold, the current must also be gold
          if (typeNext === 'gold') {
            expect(typeCurrent).toBe('gold');
          }

          // 2. Level Priority: If types are the same, level should be descending
          if (typeCurrent === typeNext) {
            if (current.level < next.level) {
              // If level is lower, it MUST be because they are equal and sorted alphabetically
              expect(current.level).toBe(next.level);
              expect(current.name.localeCompare(next.name)).toBeLessThanOrEqual(0);
            }
          }
        }
      }
    });
  });
});
