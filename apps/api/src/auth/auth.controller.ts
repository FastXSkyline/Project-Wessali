import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { DevSessionSchema } from '@wessali/contracts';
import { parseBody } from '../common/parse-body.js';
import type { AuthenticatedRequest } from './auth.types.js';
import { AuthService } from './auth.service.js';
import { SessionGuard } from './session.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('dev-session')
  createDevelopmentSession(@Body() body: unknown) {
    return this.auth.createDevelopmentSession(parseBody(DevSessionSchema, body));
  }

  @Post('logout')
  @UseGuards(SessionGuard)
  logout(@Req() request: AuthenticatedRequest) {
    return this.auth.logout(request.actor!.sessionId);
  }
}
