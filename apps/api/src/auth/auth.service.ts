import { createHash, randomBytes } from 'node:crypto';
import { ForbiddenException, Injectable } from '@nestjs/common';
import type { DevSessionInput } from '@wessali/contracts';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class AuthService {
  constructor(private readonly database: DatabaseService) {}

  async createDevelopmentSession(input: DevSessionInput) {
    if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DEV_AUTH !== 'true') {
      throw new ForbiddenException(
        'Development sign-in is disabled. Configure a real OTP provider.',
      );
    }

    if (input.role === 'admin') {
      const configuredKey = process.env.ADMIN_DEMO_KEY;
      if (!configuredKey || input.adminKey !== configuredKey) {
        throw new ForbiddenException('The local admin key is incorrect.');
      }
    }

    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const account = await this.database.transaction(async (client) => {
      const userResult = await client.query<{ id: string; status: string }>(
        `INSERT INTO users (phone_e164)
         VALUES ($1)
         ON CONFLICT (phone_e164)
         DO UPDATE SET updated_at = now()
         RETURNING id, status`,
        [input.phoneE164],
      );
      const user = userResult.rows[0];
      if (!user || user.status !== 'active') {
        throw new ForbiddenException('This account is not active.');
      }

      await client.query(
        `INSERT INTO user_profiles (user_id, display_name, preferred_locale)
         VALUES ($1, $2, 'ar')
         ON CONFLICT (user_id)
         DO UPDATE SET display_name = EXCLUDED.display_name, updated_at = now()`,
        [user.id, input.displayName],
      );

      const sessionResult = await client.query<{ id: string; expires_at: Date }>(
        `INSERT INTO auth_sessions (user_id, role, token_hash, expires_at)
         VALUES ($1, $2, $3, now() + interval '24 hours')
         RETURNING id, expires_at`,
        [user.id, input.role, tokenHash],
      );

      return { id: user.id, session: sessionResult.rows[0] };
    });

    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresAt: account.session?.expires_at,
      user: {
        id: account.id,
        displayName: input.displayName,
        phoneE164: input.phoneE164,
        role: input.role,
      },
    };
  }

  async logout(sessionId: string) {
    await this.database.query('DELETE FROM auth_sessions WHERE id = $1', [sessionId]);
    return { success: true };
  }
}
