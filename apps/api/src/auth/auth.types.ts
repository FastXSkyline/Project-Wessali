export type SessionRole = 'customer' | 'provider' | 'admin';

export interface AuthenticatedActor {
  userId: string;
  displayName: string;
  phoneE164: string;
  role: SessionRole;
  sessionId: string;
  tokenHash: string;
}

export interface AuthenticatedRequest {
  headers: { authorization?: string | string[] };
  actor?: AuthenticatedActor;
}
