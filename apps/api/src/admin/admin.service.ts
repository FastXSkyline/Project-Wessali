import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { ProviderReviewInput } from '@wessali/contracts';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class AdminService {
  constructor(private readonly database: DatabaseService) {}

  async overview() {
    const result = await this.database.query<Record<string, string>>(
      `SELECT
         count(*) FILTER (WHERE status IN ('submitted','matching','offer_received','accepted','provider_en_route','arrived','in_progress')) AS active_bookings,
         count(*) FILTER (WHERE status IN ('submitted','matching','offer_received')) AS pending_bookings,
         count(*) FILTER (WHERE status = 'completed') AS completed_bookings,
         (SELECT count(*) FROM provider_profiles WHERE status IN ('pending','under_review')) AS pending_providers,
         (SELECT count(*) FROM provider_profiles WHERE status = 'approved') AS approved_providers
       FROM bookings`,
    );
    return Object.fromEntries(
      Object.entries(result.rows[0] ?? {}).map(([key, value]) => [key, Number(value)]),
    );
  }

  async listProviders() {
    const result = await this.database.query(
      `SELECT p.id, p.business_name, p.status, p.verification_notes, p.created_at,
              u.phone_e164, up.display_name,
              COALESCE(json_agg(json_build_object(
                'serviceType', ps.service_type, 'approved', ps.is_approved
              )) FILTER (WHERE ps.id IS NOT NULL), '[]'::json) AS services
       FROM provider_profiles p
       JOIN users u ON u.id = p.user_id
       JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN provider_services ps ON ps.provider_id = p.id
       GROUP BY p.id, u.phone_e164, up.display_name
       ORDER BY p.created_at DESC
       LIMIT 250`,
    );
    return result.rows;
  }

  async reviewProvider(adminUserId: string, providerId: string, input: ProviderReviewInput) {
    return this.database.transaction(async (client) => {
      const selected = await client.query<{ id: string }>(
        'SELECT id FROM provider_profiles WHERE id = $1 FOR UPDATE',
        [providerId],
      );
      if (!selected.rows[0]) throw new NotFoundException('Provider application not found.');

      const status =
        input.decision === 'approve'
          ? 'approved'
          : input.decision === 'reject'
            ? 'rejected'
            : 'suspended';

      await client.query(
        `UPDATE provider_profiles
         SET status = $1, verification_notes = $2,
             approved_at = CASE WHEN $1 = 'approved' THEN now() ELSE NULL END,
             updated_at = now()
         WHERE id = $3`,
        [status, input.notes ?? null, providerId],
      );

      await client.query('UPDATE provider_services SET is_approved = $1 WHERE provider_id = $2', [
        status === 'approved',
        providerId,
      ]);

      await client.query(
        `INSERT INTO audit_events (actor_user_id, action, entity_type, entity_id, metadata)
         VALUES ($1, $2, 'provider_profile', $3, $4::jsonb)`,
        [
          adminUserId,
          `provider_${input.decision}`,
          providerId,
          JSON.stringify({ notes: input.notes ?? null }),
        ],
      );

      return { success: true, id: providerId, status };
    });
  }

  assertAdmin(role: string) {
    if (role !== 'admin') throw new ForbiddenException('Administrator access is required.');
  }
}
