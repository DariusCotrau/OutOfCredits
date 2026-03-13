/**
 * Environment variable validation schema.
 *
 * Uses Joi to validate all required env vars at application startup.
 * The app will refuse to start if required variables are missing or invalid,
 * preventing silent failures (e.g., empty JWT_SECRET signing tokens with "").
 */
import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Database
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().port().default(3306),
  DB_USERNAME: Joi.string().default('chiriismart'),
  DB_PASSWORD: Joi.string().default('chiriismart'),
  DB_DATABASE: Joi.string().default('chiriismart'),
  DB_SYNCHRONIZE: Joi.string().valid('true', 'false').default('false'),

  // JWT — required, must not be empty
  JWT_SECRET: Joi.string().min(16).required().messages({
    'string.empty': 'JWT_SECRET must not be empty — generate with: openssl rand -hex 32',
    'string.min': 'JWT_SECRET must be at least 16 characters',
    'any.required': 'JWT_SECRET is required — generate with: openssl rand -hex 32',
  }),
  JWT_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(16).required().messages({
    'string.empty': 'JWT_REFRESH_SECRET must not be empty — generate with: openssl rand -hex 32',
    'string.min': 'JWT_REFRESH_SECRET must be at least 16 characters',
    'any.required': 'JWT_REFRESH_SECRET is required — generate with: openssl rand -hex 32',
  }),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

  // Google OAuth — optional (app works without Google login)
  GOOGLE_CLIENT_ID: Joi.string().allow('').default(''),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('').default(''),
  GOOGLE_CALLBACK_URL: Joi.string().uri().default('http://localhost:3000/api/auth/google/callback'),

  // Google Maps — optional (recommendations degrade gracefully)
  GOOGLE_MAPS_API_KEY: Joi.string().allow('').default(''),

  // Scraper
  SCRAPER_ENABLED: Joi.string().valid('true', 'false').default('true'),
  SCRAPER_CRON: Joi.string().default('0 */6 * * *'),
  SCRAPER_DELAY_MIN: Joi.number().min(500).default(2000),
  SCRAPER_DELAY_MAX: Joi.number().min(1000).default(5000),

  // Application
  PORT: Joi.number().port().default(3000),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
});
