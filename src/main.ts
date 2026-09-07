import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

import { NestExpressApplication } from "@nestjs/platform-express";

import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import type { Env } from "./common/config/env.validation";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService<Env, true>);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: config.get("CORS_ORIGINS"),
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    optionsSuccessStatus: 200,
  });

  app.setGlobalPrefix("api");

  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Shop  API")
    .setDescription("REST API for the Shop application")
    .setVersion("1.0")
    .addCookieAuth("access_token", {
      type: "apiKey",
      in: "cookie",
      description: "JWT token from cookie",
    })
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  await app.listen(config.get("APP_PORT"));
}

bootstrap();
