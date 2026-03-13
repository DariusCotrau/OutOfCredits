/**
 * Root application module for ChiriiSmart backend.
 *
 * Imports core NestJS modules:
 * - ConfigModule: loads .env variables globally
 * - TypeOrmModule: MySQL database connection via async config
 * - ScheduleModule: enables @Cron decorators for scraper scheduling
 * - ThrottlerModule: rate limiting (100 requests/minute default)
 *
 * Feature modules will be imported here as they are built.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    // Load environment variables from .env, available globally
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // MySQL connection via TypeORM
    TypeOrmModule.forRootAsync(databaseConfig),

    // Enable cron job scheduling (@Cron decorators)
    ScheduleModule.forRoot(),

    // Global rate limiting: 100 requests per 60 seconds
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
})
export class AppModule {}
