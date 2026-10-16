import { MigrationInterface, QueryRunner } from 'typeorm';

export class WhatsAppRecipientLocalScheduling1740000000029 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE whatsapp_broadcasts ADD COLUMN recipient_local_time varchar(5)`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE whatsapp_broadcasts DROP COLUMN recipient_local_time`,
    );
  }
}
