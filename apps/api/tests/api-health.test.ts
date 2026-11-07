import 'reflect-metadata';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import test from 'node:test';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module.js';
import { AppService } from '../src/app.service.js';

test('health response reports the API as available', () => {
  const service = new AppService();
  const result = service.getHealth();

  assert.equal(result.service, 'wessali-api');
  assert.equal(result.status, 'ok');
  assert.ok(Number.isFinite(Date.parse(result.timestamp)));
});

test('service catalog exposes all three first-release services', () => {
  const service = new AppService();
  const result = service.getServices();

  assert.deepEqual(
    result.map((item) => item.id),
    ['freight', 'roadside', 'water'],
  );
});

test('Nest API health route resolves injected services at runtime', async () => {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('v1');

  try {
    await app.listen(0, '127.0.0.1');
    const address = (app.getHttpServer() as Server).address();

    if (!address || typeof address === 'string') {
      throw new Error('The API test server did not bind to a TCP port.');
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/v1/health`);
    assert.equal(response.status, 200);

    const body = (await response.json()) as {
      service: string;
      status: string;
      timestamp: string;
    };

    assert.equal(body.service, 'wessali-api');
    assert.equal(body.status, 'ok');
    assert.ok(Number.isFinite(Date.parse(body.timestamp)));
  } finally {
    await app.close();
  }
});
