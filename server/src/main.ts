/**
 * ChiriiSmart — NestJS Application Entry Point
 *
 * Bootstraps the NestJS application with:
 * - Global /api prefix on all routes
 * - ValidationPipe for automatic DTO validation (class-validator)
 * - CORS configured to allow requests from the frontend URL
 * - Port from environment variable (default 3000)
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Global API prefix: all routes start with /api
  app.setGlobalPrefix('api');

  // Global validation pipe: validates all incoming DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error on extra properties
      transform: true, // Auto-transform query params to correct types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS: allow requests from the frontend
  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:5173',
  );
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  // Enable graceful shutdown hooks (for cleanup on SIGTERM)
  app.enableShutdownHooks();

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  logger.log(`ChiriiSmart API running on http://localhost:${port}/api`);
}

bootstrap();
