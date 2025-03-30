import { registerAs } from '@nestjs/config';
import config from './config';

export default registerAs('app', () => ({
  host: config.app.host,
  port: config.app.port,
  url: config.app.url,
  environment: config.app.environment,
}));
