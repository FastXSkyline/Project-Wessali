import { createHash } from 'node:crypto';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import type { AuthenticatedRequest } from './auth.types.js';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const header = Array.isArray(authorization) ? authorization[0] : authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('A valid Wessali session is required.');
    }

    const token = header.slice(7).trim();
    if (token.length < 32) {
      throw new UnauthorizedException('The session token is invalid.');
    }

    const tokenHash = createHash('sha256').update(token).digest('hex');
    const result = await this.database.query<{
      id: string;
      user_id: string;
      role: 'customer' | 'provider' | 'admin';
      display_name: string;
      phone_e164: string;
    }>(
      `SELECT s.id, s.user_id, s.role, p.display_name, u.phone_e164
       FROM auth_sessions s
       JOIN users u ON u.id = s.user_id
       JOIN user_profiles p ON p.user_id = u.id
       WHERE s.token_hash = $1 AND s.expires_at > now() AND u.status = 'active'
       LIMIT 1`,
      [tokenHash],
    );

    const session = result.rows[0];
    if (!session) {
      throw new UnauthorizedException('The session has expired. Sign in again.');
    }

    request.actor = {
      userId: session.user_id,
      displayName: session.display_name,
      phoneE164: session.phone_e164,
      role: session.role,
      sessionId: session.id,
      tokenHash,
    };

    await this.database.query('UPDATE auth_sessions SET last_used_at = now() WHERE id = $1', [
      session.id,
    ]);
    return true;
  }
}
