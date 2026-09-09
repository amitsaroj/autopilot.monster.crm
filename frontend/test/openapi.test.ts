import { readFileSync } from 'fs';
import { join } from 'path';

describe('openapi.json', () => {
  it('exists and declares oauth scopes', () => {
    const p = join(process.cwd(), 'public', 'openapi.json');
    const raw = readFileSync(p, 'utf-8');
    const doc = JSON.parse(raw);
    expect(doc.components).toBeDefined();
    expect(doc.components.securitySchemes).toBeDefined();
    expect(doc.components.securitySchemes.oauth2).toBeDefined();
    expect(doc.components.securitySchemes.oauth2.flows).toBeDefined();
  });
});
