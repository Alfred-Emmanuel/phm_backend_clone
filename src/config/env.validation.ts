import * as Joi from 'joi';
import { ENVIRONMENT } from '../shared/utils/environment';

export const validationSchema = Joi.object({
  // App
  NODE_ENV: Joi.string()
    .valid(ENVIRONMENT.DEV, ENVIRONMENT.PROD, ENVIRONMENT.TEST)
    .default(ENVIRONMENT.DEV),
  APP_HOST: Joi.string().default('localhost'),
  APP_PORT: Joi.number().default(3000),
  APP_URL: Joi.string().required(),

  // Database
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),

  // Email
  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().required(),
  EMAIL_USER: Joi.string().required(),
  EMAIL_PASSWORD: Joi.string().required(),
  EMAIL_FROM: Joi.string().required(),
});
