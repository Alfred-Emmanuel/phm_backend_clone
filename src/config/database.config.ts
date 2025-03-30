import { registerAs } from '@nestjs/config';
import config from './config';

export default registerAs('database', () => ({
  dialect: 'postgres',
  host: config.db.postgresql.host,
  port: config.db.postgresql.port,
  username: config.db.postgresql.user,
  password: config.db.postgresql.password,
  database: config.db.postgresql.database,
  autoLoadModels: config.db.postgresql.autoLoadModels,
  synchronize: config.db.postgresql.synchronize,
}));
