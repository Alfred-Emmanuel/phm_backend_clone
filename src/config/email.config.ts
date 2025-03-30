import { registerAs } from '@nestjs/config';
import config from './config';

export default registerAs('email', () => ({
  host: config.email.host,
  port: config.email.port,
  user: config.email.user,
  password: config.email.password,
  from: config.email.from,
}));
