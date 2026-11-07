import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

function isLocalDevelopmentOrigin(origin: string): boolean {
  try {
    const hostname = new URL(origin).hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
      return true;
    }

    const octets = hostname.split('.').map(Number);
    if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
      return false;
    }

    return (
      octets[0] === 10 ||
      (octets[0] === 192 && octets[1] === 168) ||
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)
    );
  } catch {
    return false;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000,http://localhost:8081')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.setGlobalPrefix('v1');
  app.enableCors({
    origin: (origin, callback) => {
      const explicitlyAllowed = !origin || allowedOrigins.includes(origin);
      const localDevelopmentAllowed =
        process.env.NODE_ENV !== 'production' &&
        typeof origin === 'string' &&
        isLocalDevelopmentOrigin(origin);

      callback(
        explicitlyAllowed || localDevelopmentAllowed
          ? null
          : new Error('This origin is not allowed by the Wessali API CORS policy.'),
        explicitlyAllowed || localDevelopmentAllowed,
      );
    },
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port, '0.0.0.0');
  console.info('Wessali API listening on port ' + port);
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start Wessali API', error);
  process.exitCode = 1;
});
