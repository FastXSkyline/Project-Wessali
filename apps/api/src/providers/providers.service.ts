import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { ProviderApplicationInput } from '@wessali/contracts';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../database/database.service.js';
import { BookingsService } from '../bookings/bookings.service.js';

@Injectable()
export class ProvidersService {
  constructor(private readonly database: DatabaseService) {}

  async apply(userId: string, input: ProviderApplicationInput) {
    return this.database.transaction(async (client) => {
      const result = await client.query<{ id: string; status: string }>(
        `INSERT INTO provider_profiles (user_id, business_name, status)
         VALUES ($1, $2, 'pending')
         ON CONFLICT (user_id) DO UPDATE
         SET business_name = EXCLUDED.business_name,
             status = CASE WHEN provider_profiles.status = 'rejected' THEN 'pending' ELSE provider_profiles.status END,
             updated_at = now()
         RETURNING id, status`,
        [userId, input.businessName],
      );
      const provider = result.rows[0];
      if (!provider) throw new Error('Provider application was not saved.');

      for (const serviceType of input.serviceTypes) {
        await client.query(
          `INSERT INTO provider_services (provider_id, service_type, is_approved)
           VALUES ($1, $2, false)
           ON CONFLICT (provider_id, service_type) DO NOTHING`,
          [provider.id, serviceType],
        );
      }

      return this.getProfileWithClient(client, provider.id);
    });
  }

  async getMine(userId: string) {
    const result = await this.database.query<{ id: string }>(
      'SELECT id FROM provider_profiles WHERE user_id = $1',
      [userId],
    );
    if (!result.rows[0]) return { status: 'not_applied', services: [] };
    return this.getProfile(result.rows[0].id);
  }

  async getProfile(providerId: string) {
    const result = await this.database.query(
      `SELECT p.id, p.business_name, p.status, p.verification_notes, p.approved_at, p.created_at,
              COALESCE(json_agg(json_build_object(
                'serviceType', ps.service_type, 'approved', ps.is_approved
              )) FILTER (WHERE ps.id IS NOT NULL), '[]'::json) AS services
       FROM provider_profiles p
       LEFT JOIN provider_services ps ON ps.provider_id = p.id
       WHERE p.id = $1
       GROUP BY p.id`,
      [providerId],
    );
    if (!result.rows[0]) throw new NotFoundException('Provider profile not found.');
    return result.rows[0];
  }

  async listRequests(userId: string) {
    const providerResult = await this.database.query<{ id: string; status: string }>(
      'SELECT id, status FROM provider_profiles WHERE user_id = $1',
      [userId],
    );
    const provider = providerResult.rows[0];
    if (!provider) throw new ForbiddenException('Submit a provider application first.');
    if (provider.status !== 'approved') {
      throw new ForbiddenException('Your provider application is waiting for admin approval.');
    }

    const result = await this.database.query(
      `SELECT b.id, b.public_reference, b.service_type, b.status, b.pickup_address,
              b.destination_address, b.requested_at, b.customer_notes, b.created_at,
              CASE WHEN fd.booking_id IS NOT NULL THEN to_jsonb(fd) - 'booking_id' ELSE NULL END AS freight,
              CASE WHEN rd.booking_id IS NOT NULL THEN to_jsonb(rd) - 'booking_id' ELSE NULL END AS roadside,
              CASE WHEN wd.booking_id IS NOT NULL THEN to_jsonb(wd) - 'booking_id' ELSE NULL END AS water
       FROM bookings b
       JOIN provider_services ps ON ps.service_type = b.service_type AND ps.provider_id = $1 AND ps.is_approved = true
       LEFT JOIN freight_details fd ON fd.booking_id = b.id
       LEFT JOIN roadside_details rd ON rd.booking_id = b.id
       LEFT JOIN water_details wd ON wd.booking_id = b.id
       WHERE b.assigned_provider_id IS NULL
         AND b.status IN ('submitted', 'matching', 'offer_received')
       ORDER BY b.created_at ASC
       LIMIT 100`,
      [provider.id],
    );
    return result.rows;
  }

  async listJobs(userId: string) {
    const providerResult = await this.database.query<{ id: string; status: string }>(
      'SELECT id, status FROM provider_profiles WHERE user_id = $1',
      [userId],
    );
    const provider = providerResult.rows[0];
    if (!provider || provider.status !== 'approved') {
      throw new ForbiddenException('An approved provider profile is required.');
    }

    const result = await this.database.query(
      `SELECT b.id, b.public_reference, b.service_type, b.status, b.pickup_address,
              b.destination_address, b.requested_at, b.customer_notes, b.created_at,
              CASE WHEN fd.booking_id IS NOT NULL THEN to_jsonb(fd) - 'booking_id' ELSE NULL END AS freight,
              CASE WHEN rd.booking_id IS NOT NULL THEN to_jsonb(rd) - 'booking_id' ELSE NULL END AS roadside,
              CASE WHEN wd.booking_id IS NOT NULL THEN to_jsonb(wd) - 'booking_id' ELSE NULL END AS water
       FROM bookings b
       LEFT JOIN freight_details fd ON fd.booking_id = b.id
       LEFT JOIN roadside_details rd ON rd.booking_id = b.id
       LEFT JOIN water_details wd ON wd.booking_id = b.id
       WHERE b.assigned_provider_id = $1
         AND b.status NOT IN ('completed', 'cancelled', 'expired')
       ORDER BY b.updated_at DESC
       LIMIT 100`,
      [provider.id],
    );
    return result.rows;
  }

  async accept(userId: string, bookingId: string) {
    return this.database.transaction(async (client) => {
      const providerResult = await client.query<{ id: string; status: string }>(
        'SELECT id, status FROM provider_profiles WHERE user_id = $1 FOR UPDATE',
        [userId],
      );
      const provider = providerResult.rows[0];
      if (!provider || provider.status !== 'approved') {
        throw new ForbiddenException('An approved provider profile is required.');
      }

      const selected = await client.query<{
        id: string;
        service_type: string;
        status: string;
        assigned_provider_id: string | null;
      }>(
        'SELECT id, service_type, status, assigned_provider_id FROM bookings WHERE id = $1 FOR UPDATE',
        [bookingId],
      );
      const booking = selected.rows[0];
      if (!booking) throw new NotFoundException('Booking not found.');
      if (booking.assigned_provider_id)
        throw new ForbiddenException('This booking has already been assigned.');
      if (!['submitted', 'matching', 'offer_received'].includes(booking.status)) {
        throw new ForbiddenException('This request is no longer available.');
      }

      const service = await client.query(
        'SELECT 1 FROM provider_services WHERE provider_id = $1 AND service_type = $2 AND is_approved = true',
        [provider.id, booking.service_type],
      );
      if (!service.rowCount)
        throw new ForbiddenException('Your account is not approved for this service.');

      const updated = await client.query(
        `UPDATE bookings SET assigned_provider_id = $1, status = 'accepted', accepted_at = now(), updated_at = now()
         WHERE id = $2 AND assigned_provider_id IS NULL`,
        [provider.id, bookingId],
      );
      if (!updated.rowCount)
        throw new ForbiddenException('This request has already been assigned.');

      await BookingsService.insertEvent(
        client,
        bookingId,
        userId,
        'provider_accepted',
        booking.status,
        'accepted',
      );
      return { success: true, bookingId, status: 'accepted' };
    });
  }

  async advance(userId: string, bookingId: string) {
    const nextStates: Record<string, string> = {
      accepted: 'provider_en_route',
      provider_en_route: 'arrived',
      arrived: 'in_progress',
      in_progress: 'completed',
    };

    return this.database.transaction(async (client) => {
      const providerResult = await client.query<{ id: string }>(
        'SELECT id FROM provider_profiles WHERE user_id = $1 AND status = $2',
        [userId, 'approved'],
      );
      const provider = providerResult.rows[0];
      if (!provider) throw new ForbiddenException('An approved provider profile is required.');

      const selected = await client.query<{ status: string }>(
        'SELECT status FROM bookings WHERE id = $1 AND assigned_provider_id = $2 FOR UPDATE',
        [bookingId, provider.id],
      );
      const booking = selected.rows[0];
      if (!booking) throw new NotFoundException('Assigned booking not found.');

      const next = nextStates[booking.status];
      if (!next) throw new ForbiddenException('This job cannot advance from its current status.');

      await client.query(
        `UPDATE bookings SET status = $1, updated_at = now(),
           completed_at = CASE WHEN $1 = 'completed' THEN now() ELSE completed_at END
         WHERE id = $2`,
        [next, bookingId],
      );
      await BookingsService.insertEvent(
        client,
        bookingId,
        userId,
        'provider_status_updated',
        booking.status,
        next,
      );
      return { success: true, bookingId, status: next };
    });
  }

  private async getProfileWithClient(client: PoolClient, providerId: string) {
    const result = await client.query(
      `SELECT p.id, p.business_name, p.status, p.verification_notes,
              COALESCE(json_agg(json_build_object(
                'serviceType', ps.service_type, 'approved', ps.is_approved
              )) FILTER (WHERE ps.id IS NOT NULL), '[]'::json) AS services
       FROM provider_profiles p
       LEFT JOIN provider_services ps ON ps.provider_id = p.id
       WHERE p.id = $1
       GROUP BY p.id`,
      [providerId],
    );
    return result.rows[0];
  }
}
