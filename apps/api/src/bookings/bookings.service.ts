import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateBookingInput } from '@wessali/contracts';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class BookingsService {
  constructor(private readonly database: DatabaseService) {}

  async create(customerId: string, input: CreateBookingInput) {
    return this.database.transaction(async (client) => {
      const reference = `WES-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const pickupLatitude = input.pickupLatitude ?? null;
      const pickupLongitude = input.pickupLongitude ?? null;
      const destinationLatitude =
        input.serviceType === 'freight' ? (input.destinationLatitude ?? null) : null;
      const destinationLongitude =
        input.serviceType === 'freight' ? (input.destinationLongitude ?? null) : null;
      const destinationAddress = input.serviceType === 'freight' ? input.destinationAddress : null;

      const inserted = await client.query<{ id: string; public_reference: string; status: string }>(
        `INSERT INTO bookings (
           public_reference, customer_id, service_type, pickup_location,
           destination_location, pickup_address, destination_address, requested_at, customer_notes
         )
         VALUES (
           $1, $2, $3,
           CASE WHEN $4::double precision IS NULL THEN NULL
             ELSE ST_SetSRID(ST_MakePoint($5, $4), 4326)::geography END,
           CASE WHEN $6::double precision IS NULL THEN NULL
             ELSE ST_SetSRID(ST_MakePoint($7, $6), 4326)::geography END,
           $8, $9, $10, $11
         )
         RETURNING id, public_reference, status`,
        [
          reference,
          customerId,
          input.serviceType,
          pickupLatitude,
          pickupLongitude,
          destinationLatitude,
          destinationLongitude,
          input.pickupAddress,
          destinationAddress,
          input.requestedAt ? new Date(input.requestedAt) : null,
          input.customerNotes ?? null,
        ],
      );

      const booking = inserted.rows[0];
      if (!booking) throw new Error('Booking insert did not return a row.');

      if (input.serviceType === 'freight') {
        await client.query(
          `INSERT INTO freight_details
           (booking_id, cargo_description, weight_kg, truck_type, loading_requirements)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            booking.id,
            input.cargoDescription,
            input.weightKg,
            input.truckType,
            input.loadingRequirements ?? null,
          ],
        );
      } else if (input.serviceType === 'roadside') {
        await client.query(
          `INSERT INTO roadside_details
           (booking_id, vehicle_type, issue_category, needs_towing, towing_destination, notes)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            booking.id,
            input.vehicleType,
            input.issueCategory,
            input.needsTowing,
            input.towingDestination ?? null,
            input.notes ?? null,
          ],
        );
      } else {
        await client.query(
          `INSERT INTO water_details
           (booking_id, quantity_litres, intended_use, water_category, access_notes)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            booking.id,
            input.quantityLitres,
            input.intendedUse,
            input.waterCategory,
            input.accessNotes ?? null,
          ],
        );
      }

      await BookingsService.insertEvent(
        client,
        booking.id,
        customerId,
        'booking_submitted',
        null,
        'submitted',
      );
      return booking;
    });
  }

  async listForCustomer(customerId: string) {
    const result = await this.database.query(
      `${this.bookingSelect()}
       WHERE b.customer_id = $1
       ORDER BY b.created_at DESC
       LIMIT 100`,
      [customerId],
    );
    return result.rows;
  }

  async listAll() {
    const result = await this.database.query(
      `${this.bookingSelect()}
       ORDER BY b.created_at DESC
       LIMIT 250`,
    );
    return result.rows;
  }

  async cancel(customerId: string, bookingId: string) {
    return this.database.transaction(async (client) => {
      const selected = await client.query<{ id: string; customer_id: string; status: string }>(
        'SELECT id, customer_id, status FROM bookings WHERE id = $1 FOR UPDATE',
        [bookingId],
      );
      const booking = selected.rows[0];
      if (!booking) throw new NotFoundException('Booking not found.');
      if (booking.customer_id !== customerId)
        throw new ForbiddenException('This booking belongs to another account.');
      if (!['submitted', 'matching', 'offer_received'].includes(booking.status)) {
        throw new ForbiddenException(
          'This booking can no longer be cancelled from the customer app.',
        );
      }

      await client.query(
        `UPDATE bookings SET status = 'cancelled', cancelled_at = now(), updated_at = now() WHERE id = $1`,
        [bookingId],
      );
      await BookingsService.insertEvent(
        client,
        bookingId,
        customerId,
        'booking_cancelled',
        booking.status,
        'cancelled',
      );
      return { success: true, id: bookingId, status: 'cancelled' };
    });
  }

  private bookingSelect() {
    return `SELECT
        b.id, b.public_reference, b.service_type, b.status, b.pickup_address,
        b.destination_address, b.requested_at, b.estimated_amount_minor,
        b.agreed_amount_minor, b.currency, b.customer_notes, b.created_at,
        ST_Y(b.pickup_location::geometry) AS pickup_latitude,
        ST_X(b.pickup_location::geometry) AS pickup_longitude,
        ST_Y(b.destination_location::geometry) AS destination_latitude,
        ST_X(b.destination_location::geometry) AS destination_longitude,
        up.display_name AS customer_name,
        pp.business_name AS provider_name,
        CASE WHEN fd.booking_id IS NOT NULL THEN to_jsonb(fd) - 'booking_id' ELSE NULL END AS freight,
        CASE WHEN rd.booking_id IS NOT NULL THEN to_jsonb(rd) - 'booking_id' ELSE NULL END AS roadside,
        CASE WHEN wd.booking_id IS NOT NULL THEN to_jsonb(wd) - 'booking_id' ELSE NULL END AS water
      FROM bookings b
      JOIN users u ON u.id = b.customer_id
      JOIN user_profiles up ON up.user_id = u.id
      LEFT JOIN provider_profiles pp ON pp.id = b.assigned_provider_id
      LEFT JOIN freight_details fd ON fd.booking_id = b.id
      LEFT JOIN roadside_details rd ON rd.booking_id = b.id
      LEFT JOIN water_details wd ON wd.booking_id = b.id`;
  }

  static async insertEvent(
    client: PoolClient,
    bookingId: string,
    actorUserId: string | null,
    eventType: string,
    previousStatus: string | null,
    newStatus: string | null,
    payload: Record<string, unknown> = {},
  ) {
    await client.query(
      `INSERT INTO booking_events
       (booking_id, actor_user_id, event_type, previous_status, new_status, payload)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      [bookingId, actorUserId, eventType, previousStatus, newStatus, JSON.stringify(payload)],
    );
  }
}
