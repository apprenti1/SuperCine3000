import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Supercine3000')
    .setDescription("Ceci est l'API por le cinéma NothingBetterThanAL. C'est une API RESTful en Node.js et TypeScript dont le but est de permettre la gestion complète d'un cinéma.")
    .setVersion('1.0')
    .addServer('/supercine3000')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();
