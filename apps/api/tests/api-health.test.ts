import assert from 'node:assert/strict';
import test from 'node:test';
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
