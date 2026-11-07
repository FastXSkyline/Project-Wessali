import assert from 'node:assert/strict';
import test from 'node:test';
import { CreateWaterRequestSchema, SERVICE_CATEGORIES, SERVICE_KINDS } from '../src/index.js';

test('the first release exposes all three service categories', () => {
  assert.deepEqual(
    SERVICE_CATEGORIES.map((service) => service.id),
    SERVICE_KINDS,
  );
});

test('each service category has Arabic, French, and English labels', () => {
  for (const service of SERVICE_CATEGORIES) {
    assert.ok(service.labels.ar.length > 0);
    assert.ok(service.labels.fr.length > 0);
    assert.ok(service.labels.en.length > 0);
  }
});

test('water request rejects a zero quantity', () => {
  const result = CreateWaterRequestSchema.safeParse({
    deliveryLocation: { latitude: 36.75, longitude: 3.05 },
    quantityLitres: 0,
    intendedUse: 'residential',
    waterCategory: 'potable',
    preferredAt: '2026-11-08T10:00:00Z',
  });
  assert.equal(result.success, false);
});
