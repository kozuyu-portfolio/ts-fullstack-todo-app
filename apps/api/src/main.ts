import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { writeFileSync } from 'fs';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  await app.listen(process.env.PORT ?? 3000);

  const doc = SwaggerModule.createDocument(app, new DocumentBuilder().build());
  writeFileSync('swagger.json', JSON.stringify(doc, null, 2));
}
bootstrap();
