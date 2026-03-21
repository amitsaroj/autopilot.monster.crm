import { DataSource } from 'typeorm';
import { databaseConfig } from '../config/database.config';

/**
 * Standalone DataSource for TypeORM CLI migrations.
 * Run: typeorm migration:run -d apps/core/src/database/data-source.ts
 */
const dbCfg = databaseConfig();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbCfg.host,
  port: dbCfg.port,
  database: dbCfg.database,
  username: dbCfg.username,
  password: dbCfg.password,
  ssl: dbCfg.ssl,
  logging: dbCfg.logging,
  synchronize: false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
});
