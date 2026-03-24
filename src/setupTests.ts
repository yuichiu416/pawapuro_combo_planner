// src/setupTests.ts
import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import './__tests__/test-reset.css';

// Extend Vitest's expect with jest-dom matchers (toBeInTheDocument, etc.)
expect.extend(matchers);

// Clean up the DOM after each test to prevent memory leaks/state bleed
afterEach(() => {
  cleanup();
});

// Mock window.scrollTo since JSDOM doesn't implement it
window.scrollTo = vi.fn();
