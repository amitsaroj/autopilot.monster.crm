/** Branded UUID type — prevents mixing up plain strings with UUIDs */
export type UUID = string & { readonly __brand: 'UUID' };

export function toUUID(value: string): UUID {
  return value as UUID;
}
