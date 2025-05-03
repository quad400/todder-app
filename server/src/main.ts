import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { ValidatorPipe } from './common/interceptors/validator.interceptor';
import { HttpExceptions } from './common/filters/http.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger();

  app.useGlobalPipes(ValidatorPipe());

  app.enableCors({
    origin: 'http://localhost:3000', // Frontend URL (adjust accordingly)
    credentials: true, // Allow cookies and credentials to be sent
    methods: 'GET, POST, PUT, DELETE', // Allowed HTTP methods
    allowedHeaders: 'Content-Type, Authorization', // Allowed headers
  });

  app.setGlobalPrefix('api/v1');

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new HttpExceptions(httpAdapterHost));

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
    .addOAuth2({
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          scopes: { 'email profile': 'Access email and profile' },
        },
      },
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const configService = new ConfigService();

  SwaggerModule.setup('api/v1/api-docs', app, document, {
    explorer: true,
  });
  await app.listen(configService.getOrThrow('PORT'));
  logger.log(
    `Server started and running on port ${configService.getOrThrow('PORT')}`,
  );
}
bootstrap();
