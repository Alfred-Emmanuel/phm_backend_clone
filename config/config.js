require('dotenv').config();
const tsConfig = require('../dist/config/config').default;

module.exports = {
  development: {
    username: tsConfig.db.postgresql.dev.user,
    password: tsConfig.db.postgresql.dev.password,
    database: tsConfig.db.postgresql.dev.database,
    host: tsConfig.db.postgresql.dev.host,
    port: tsConfig.db.postgresql.dev.port,
    dialect: 'postgres',
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      min: parseInt(process.env.DB_POOL_MIN || '5'),
      idle: parseInt(process.env.DB_POOL_IDLE || '10000'),
    },
  },
  test: {
    username: process.env.TEST_DB_USERNAME || 'postgres',
    password: process.env.TEST_DB_PASSWORD || 'postgres',
    database: process.env.TEST_DB_NAME || 'phm_db_test',
    host: process.env.TEST_DB_HOST || '127.0.0.1',
    port: parseInt(process.env.TEST_DB_PORT || '5432', 10),
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.TEST_DB_SSL === 'true',
    },
  },
  production: {
    username: tsConfig.db.postgresql.prod.user,
    password: tsConfig.db.postgresql.prod.password,
    database: tsConfig.db.postgresql.prod.database,
    host: tsConfig.db.postgresql.prod.host,
    port: tsConfig.db.postgresql.prod.port,
    dialect: 'postgres',
    dialectOptions: {
      ssl:
        process.env.DB_SSL === 'true'
          ? {
              rejectUnauthorized:
                process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
            }
          : false,
    },
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      min: parseInt(process.env.DB_POOL_MIN || '5'),
      idle: parseInt(process.env.DB_POOL_IDLE || '10000'),
    },
  },
};
