import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Todder')
    .setDescription('Api for managing user profile and activities')
    .setVersion('1.0')
    .setContact(
      'Adediji Abdulquadri',
      'https://abdulquadri-portfolio.vercel.app/',
      'adedijiabdulquadri@gmail.com',
    )
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const configService = new ConfigService();

  SwaggerModule.setup('api/v1/api-docs', app, document, {
    explorer: true,
  });
  console.log(configService.get("MONGO_URI"))
  await app.listen(configService.getOrThrow('PORT'));
}
bootstrap();
