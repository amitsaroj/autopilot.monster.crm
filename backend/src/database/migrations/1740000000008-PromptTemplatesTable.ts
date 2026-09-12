import { MigrationInterface, QueryRunner } from 'typeorm';

export class PromptTemplatesTable1740000000008 implements MigrationInterface {
  name = 'PromptTemplatesTable1740000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS prompt_templates (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        tenant_id uuid NOT NULL,
        name varchar(255) NOT NULL,
        template text NOT NULL,
        category varchar(100) NOT NULL DEFAULT 'general',
        description text,
        variables jsonb NOT NULL DEFAULT '[]',
        "isDefault" boolean NOT NULL DEFAULT false,
        metadata jsonb,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz,
        created_by uuid,
        updated_by uuid
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_prompt_templates_tenant_category
      ON prompt_templates (tenant_id, category)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_prompt_templates_tenant_category`);
    await queryRunner.query(`DROP TABLE IF EXISTS prompt_templates`);
  }
}
