import * as dotenv from 'dotenv';
import { ENVIRONMENT } from '../shared/utils/environment';

dotenv.config();

const config = Object.freeze({
  app: {
    host: (process.env.APP_HOST as string) || 'localhost',
    port: parseInt((process.env.APP_PORT as string) || '3000', 10),
    url: (process.env.APP_URL as string) || 'http://localhost:3000',
    environment: {
      mode: process.env.NODE_ENV || ENVIRONMENT.DEV,
      isInProduction: process.env.NODE_ENV === ENVIRONMENT.PROD,
      isInDevelopment: process.env.NODE_ENV === ENVIRONMENT.DEV,
      isInTesting: process.env.NODE_ENV === ENVIRONMENT.TEST,
    },
  },
  auth: {
    accessTokenSecret: process.env.JWT_SECRET as string,
    accessTokenExpiresIn: (process.env.JWT_EXPIRES_IN as string),
    refreshTokenExpiresIn: '7d',
  },
  db: {
    postgresql: {
      dev: {
        url: (process.env.DATABASE_URL as string) || '',
        user: (process.env.DB_USERNAME as string) || 'postgres',
        password: (process.env.DB_PASSWORD as string) || 'postgres',
        database: (process.env.DB_NAME as string) || 'phm_db',
        port: parseInt((process.env.DB_PORT as string) || '5432', 10),
        host: (process.env.DB_HOST as string) || 'localhost',
      },
      prod: {
        url: (process.env.DATABASE_URL as string) || '',
        user: (process.env.PROD_DB_USERNAME as string) || 'postgres',
        password: (process.env.PROD_DB_PASSWORD as string) || 'postgres',
        database: (process.env.PROD_DB_NAME as string) || 'phm_db',
        port: parseInt((process.env.PROD_DB_PORT as string) || '5432', 10),
        host: (process.env.PROD_DB_HOST as string) || 'localhost',
      },
      autoLoadModels: true,
      synchronize: process.env.NODE_ENV !== ENVIRONMENT.PROD,
    },
  },
  email: {
    host: process.env.EMAIL_HOST as string,
    port: parseInt((process.env.EMAIL_PORT as string) || '465', 10),
    user: process.env.EMAIL_USER as string,
    password: process.env.EMAIL_PASSWORD as string,
    from: process.env.EMAIL_FROM as string,
  },
  payments: {
    PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_SECRET_KEY as string,
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY as string,
  },
  storage: {
    cloudinary: {
      CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      API_KEY: process.env.CLOUDINARY_API_KEY,
      API_SECRET: process.env.CLOUDINARY_API_SECRET
    }
  }
});

export default config;
