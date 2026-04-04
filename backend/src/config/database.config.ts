import { registerAs } from '@nestjs/config';

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
  const dbUrl = process.env['DATABASE_URL'];
  const parsed = dbUrl ? parseDatabaseUrl(dbUrl) : null;

  return {
    type: 'postgres',
    host: parsed?.host ?? process.env['DB_HOST'] ?? 'localhost',
    port: parsed?.port ?? parseInt(process.env['DB_PORT'] ?? '5432', 10),
    database: parsed?.database ?? process.env['DB_NAME'] ?? 'autopilot_crm',
    username: parsed?.username ?? process.env['DB_USER'] ?? 'autopilot',
    password: parsed?.password ?? process.env['DB_PASSWORD'] ?? '',
    ssl: process.env['DB_SSL'] === 'true',
    logging: process.env['DB_LOGGING'] === 'true',
    synchronize: process.env['DB_SYNCHRONIZE'] === 'true',
    poolSize: parseInt(process.env['DB_POOL_SIZE'] ?? '10', 10),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
  };
});
