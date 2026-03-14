/**
 * Database configuration factory for TypeORM.
 *
 * Reads connection parameters from environment variables via NestJS ConfigService.
 * - synchronize is controlled by DB_SYNCHRONIZE env var (default: false)
 * - In production, throws if required DB env vars are missing
 * - In development, falls back to local defaults for convenience
 */
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const isProduction = nodeEnv === 'production';

    // In production, require explicit DB credentials (no silent defaults)
    const host = configService.get<string>('DB_HOST');
    const password = configService.get<string>('DB_PASSWORD');
    if (isProduction && (!host || !password)) {
      throw new Error(
        'DB_HOST and DB_PASSWORD must be explicitly set in production. ' +
          'Check your .env file or environment variables.',
      );
    }

    return {
      type: 'mysql',
      host: host || 'localhost',
      port: configService.get<number>('DB_PORT', 3306),
      username: configService.get<string>('DB_USERNAME', 'chiriismart'),
      password: password || 'chiriismart',
      database: configService.get<string>('DB_DATABASE', 'chiriismart'),
      autoLoadEntities: true,
      // Explicit opt-in only — prevents accidental data loss from schema sync
      synchronize: configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
      logging: !isProduction,
    };
  },
};
