import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Serve static uploaded WebP images
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Global API Prefix
  app.setGlobalPrefix('api/v1');

  // Request Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS Configuration - Allows Swagger UI, Next.js, and Vite dev servers
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With,Origin',
  });

  // Swagger OpenAPI 3.0 Documentation
  const config = new DocumentBuilder()
    .setTitle('Where To Go in Laos (ໄປໃສດີ) API')
    .setDescription(
      'Community travel discovery platform for Laos. Discover and post natural waterfalls, cafes, forests, and cultural spots with admin moderation, JWT PS512 security, and soft-delete support.',
    )
    .setVersion('1.0.0')
    .addServer('http://localhost:4000', 'Local Development Server')
    .addServer('/', 'Current Host')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT (PS512)',
        name: 'Authorization',
        description: 'Enter your PS512 Access Token in format: Bearer <token>',
        in: 'header',
      },
      'JWT-PS512',
    )
    .addTag('Authentication (JWT PS512)', 'User registration via Phone or Username, PS512 JWT login, and token rotation')
    .addTag('Categories', 'Travel categories: Cafe, Waterfall, Nature, Culture, Viewpoint, Market')
    .addTag('Places & Attractions', 'Browse approved spots, search by province, and submit new places')
    .addTag('Comments & Travel Tips', 'User reviews, tips, and soft-delete comments')
    .addTag('Favorites & "I Wanna Go" Bucket List', 'Personal wishlist and bookmarking')
    .addTag('Admin & Moderation Portal', 'Review pending places, approvals, and Trash Bin recovery')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Where To Go in Laos - API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
    },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`\n======================================================`);
  console.log(`🚀 "Where to Go in Laos" API Server running at:`);
  console.log(`   ➜ API Base:      http://localhost:${port}/api/v1`);
  console.log(`   ➜ Swagger UI:    http://localhost:${port}/api/docs`);
  console.log(`======================================================\n`);
}

bootstrap();
