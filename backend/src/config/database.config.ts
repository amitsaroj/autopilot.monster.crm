import { registerAs } from '@nestjs/config';

import { env } from './env.config';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  logging: boolean;
  synchronize: boolean;
  poolSize: number;
  entities: string[];
  migrations: string[];
  migrationsTableName: string;
}

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || '5432', 10),
    database: parsed.pathname.replace('/', ''),
    username: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
  };
}

export const databaseConfig = registerAs('database', (): DatabaseConfig & { type: 'postgres' } => {
  const dbUrl = env.database.url;
  const parsed = dbUrl ? parseDatabaseUrl(dbUrl) : null;

  return {
    type: 'postgres',
    host: parsed?.host ?? env.database.host,
    port: parsed?.port ?? env.database.port,
    database: parsed?.database ?? env.database.database,
    username: parsed?.username ?? env.database.username,
    password: parsed?.password ?? env.database.password,
    ssl: env.database.ssl,
    logging: env.database.logging,
    synchronize: env.database.synchronize,
    poolSize: env.database.poolSize,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
  };
});
