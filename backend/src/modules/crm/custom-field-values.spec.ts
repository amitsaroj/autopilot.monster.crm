import { validateCustomFieldValues } from './custom-field-values';
import type { CustomField } from '../../database/entities/custom-field.entity';

const def = (name: string, type: string, extra: Partial<CustomField> = {}) =>
  ({ name, type, isRequired: false, options: [], ...extra }) as CustomField;

describe('validateCustomFieldValues', () => {
  const defs = [
    def('vat', 'TEXT', { isRequired: true }),
    def('seats', 'NUMBER'),
    def('vip', 'BOOLEAN'),
    def('renewal', 'DATE'),
    def('tier', 'SELECT', { options: ['gold', 'silver'] }),
    def('regions', 'MULTI_SELECT', { options: ['eu', 'us'] }),
  ];

  it('accepts well-typed values', () => {
    expect(
      validateCustomFieldValues(defs, {
        vat: 'GB123',
        seats: 5,
        vip: true,
        renewal: '2026-01-01',
        tier: 'gold',
        regions: ['eu'],
      }),
    ).toEqual([]);
  });

  it('rejects wrong types, unknown keys and missing required fields', () => {
    const errors = validateCustomFieldValues(defs, {
      seats: '5',
      vip: 'yes',
      renewal: 'not-a-date',
      tier: 'bronze',
      regions: ['apac'],
      bogus: 1,
    });
    expect(errors).toEqual([
      'customFields.seats must be a number',
      'customFields.vip must be a boolean',
      'customFields.renewal must be an ISO date string',
      'customFields.tier must be one of: gold, silver',
      'customFields.regions must be a list of: eu, us',
      'customFields.bogus is not a defined custom field',
      'customFields.vat is required',
    ]);
  });
});
