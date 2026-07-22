import { describe, expect, it } from 'vitest';
import { cn, slugify, truncate } from './utils';

describe('utils', () => {
  it('merges class names with cn', () => {
    expect(cn('px-2', 'px-4', false && 'hidden', 'text-sm')).toBe('px-4 text-sm');
  });

  it('slugifies strings', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
  });

  it('truncates long strings', () => {
    expect(truncate('abcdefghij', 5)).toBe('abcde...');
    expect(truncate('short', 10)).toBe('short');
  });
});
