import { describe, it, expect } from 'vitest';
import { slugify } from '../utils/slugify';

describe('slugify', () => {
  it('converts basic text', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('handles special characters', () => {
    expect(slugify('Cusco, Perú! (2024)')).toBe('cusco-per-2024');
  });

  it('handles multiple spaces', () => {
    expect(slugify('a   b   c')).toBe('a-b-c');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugify(' -hello- ')).toBe('hello');
  });

  it('handles underscores', () => {
    expect(slugify('hello_world_test')).toBe('hello-world-test');
  });

  it('removes consecutive hyphens', () => {
    expect(slugify('a---b')).toBe('a-b');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });
});
