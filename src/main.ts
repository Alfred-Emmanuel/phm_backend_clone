import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { validate } from './config/validate';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  // Validate environment variables
  validate();

  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Setup Swagger
  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
