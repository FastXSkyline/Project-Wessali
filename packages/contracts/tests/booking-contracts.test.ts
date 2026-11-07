import assert from 'node:assert/strict';
import test from 'node:test';
import { CreateBookingSchema, DevSessionSchema, ProviderApplicationSchema } from '../src/index.js';

test('accepts a freight booking with route and cargo details', () => {
  const result = CreateBookingSchema.safeParse({
    serviceType: 'freight',
    pickupAddress: 'Algiers centre',
    destinationAddress: 'Setif centre',
    cargoDescription: 'Furniture',
    weightKg: 1200,
    truckType: 'box_truck',
  });
  assert.equal(result.success, true);
});

test('accepts roadside and water booking requests', () => {
  const roadside = CreateBookingSchema.safeParse({
    serviceType: 'roadside',
    pickupAddress: 'Bab Ezzouar, Algiers',
    vehicleType: 'car',
    issueCategory: 'battery',
    needsTowing: false,
  });
  const water = CreateBookingSchema.safeParse({
    serviceType: 'water',
    pickupAddress: 'Birkhadem, Algiers',
    quantityLitres: 5000,
    intendedUse: 'residential',
    waterCategory: 'non_potable',
  });
  assert.equal(roadside.success, true);
  assert.equal(water.success, true);
});

test('rejects incomplete coordinates and invalid water categories', () => {
  const coordinates = CreateBookingSchema.safeParse({
    serviceType: 'roadside',
    pickupAddress: 'Algiers',
    pickupLatitude: 36.7,
    vehicleType: 'car',
    issueCategory: 'tyre',
    needsTowing: false,
  });
  const water = CreateBookingSchema.safeParse({
    serviceType: 'water',
    pickupAddress: 'Algiers',
    quantityLitres: 1000,
    intendedUse: 'residential',
    waterCategory: 'drinkable',
  });
  assert.equal(coordinates.success, false);
  assert.equal(water.success, false);
});

test('validates development sessions and provider applications', () => {
  assert.equal(
    DevSessionSchema.safeParse({
      phoneE164: '+213555123456',
      displayName: 'Test User',
      role: 'customer',
    }).success,
    true,
  );
  assert.equal(
    ProviderApplicationSchema.safeParse({
      businessName: 'Test Transport',
      serviceTypes: ['freight', 'water'],
    }).success,
    true,
  );
});
