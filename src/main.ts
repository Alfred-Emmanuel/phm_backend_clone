import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { validate } from './config/validate';

async function bootstrap() {
  // Validate environment variables
  validate();

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
