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

export const databaseConfig = registerAs(
  'database',
  (): DatabaseConfig & { type: 'postgres' } => ({
    type: 'postgres',
    host: process.env['DB_HOST'] ?? 'localhost',
    port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
    database: process.env['DB_NAME'] ?? 'autopilot_crm',
    username: process.env['DB_USER'] ?? 'autopilot',
    password: process.env['DB_PASSWORD'] ?? '',
    ssl: process.env['DB_SSL'] === 'true',
    logging: process.env['DB_LOGGING'] === 'true',
    synchronize: process.env['DB_SYNCHRONIZE'] === 'true',
    poolSize: parseInt(process.env['DB_POOL_SIZE'] ?? '10', 10),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
  }),
);

