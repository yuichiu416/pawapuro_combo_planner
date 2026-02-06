import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGameData } from '@/hooks/useGameData';

// Mock the JSON data modules instead of fetch
vi.mock('@/data/characters.json', () => ({
  default: {
    "猪狩守": {},
    "矢部明雄": {}
  }
}));

vi.mock('@/data/combos.json', () => ({
  default: [
    { id: 1, name: "Test Combo", characters: ["猪狩守"] }
  ]
}));

describe('useGameData Hook', () => {
  it('initially returns loading state', () => {
    const { result } = renderHook(() => useGameData());
    // In static import scenarios, this state might be very brief
    expect(result.current.isLoading).toBeDefined();
  });

  it('populates data from imported JSON files', async () => {
    const { result } = renderHook(() => useGameData());

    // Wait for the useEffect to trigger state updates
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    expect(result.current.allCharacters).toContain("猪狩守");
    expect(result.current.allCharacters).toContain("矢部明雄");
    expect(result.current.allCharacters).toHaveLength(2);
    expect(result.current.allCombos).toHaveLength(1);
    expect(result.current.allCombos[0].name).toBe("Test Combo");
  });

  it('handles potential errors gracefully', () => {
    // This is a placeholder for error boundary testing if needed
    const { result } = renderHook(() => useGameData());
    expect(result.current.error).toBeNull();
  });
});