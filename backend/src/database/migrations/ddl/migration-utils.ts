import type { QueryRunner } from 'typeorm';

export async function runQueries(queryRunner: QueryRunner, queries: string[]): Promise<void> {
  for (const query of queries) {
    await queryRunner.query(query);
  }
}

export function createEnumType(typeName: string, values: string[]): string {
  const literals = values.map((value) => `'${value}'`).join(', ');
  return `
    DO $$ BEGIN
      CREATE TYPE "${typeName}" AS ENUM (${literals});
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `;
}
