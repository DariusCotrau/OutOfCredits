/**
 * Database configuration factory for TypeORM.
 *
 * Reads connection parameters from environment variables via NestJS ConfigService.
 * In development, `synchronize` is enabled for auto-schema sync.
 * In production, use migrations instead.
 */
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'mysql',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 3306),
    username: configService.get<string>('DB_USERNAME', 'chiriismart'),
    password: configService.get<string>('DB_PASSWORD', 'chiriismart'),
    database: configService.get<string>('DB_DATABASE', 'chiriismart'),
    autoLoadEntities: true,
    synchronize: configService.get<string>('NODE_ENV') === 'development',
    logging: configService.get<string>('NODE_ENV') === 'development',
  }),
};
