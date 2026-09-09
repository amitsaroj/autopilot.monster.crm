import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, it, expect } from 'vitest';

describe('well-known files', () => {
  it('publishes mcp manifest and protected-resource metadata', () => {
    const base = join(process.cwd(), 'public', '.well-known');
    const mcp = JSON.parse(readFileSync(join(base, 'mcp'), 'utf-8'));
    expect(mcp.name).toMatch(/AutopilotMonster/);
    const pr = JSON.parse(readFileSync(join(base, 'protected-resource.json'), 'utf-8'));
    expect(Array.isArray(pr.scopes_supported)).toBe(true);
  });
});
