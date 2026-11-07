import { Body, Controller, ForbiddenException, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ProviderApplicationSchema } from '@wessali/contracts';
import { parseBody } from '../common/parse-body.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { SessionGuard } from '../auth/session.guard.js';
import { ProvidersService } from './providers.service.js';

@Controller('providers')
@UseGuards(SessionGuard)
export class ProvidersController {
  constructor(private readonly providers: ProvidersService) {}

  @Get('me')
  getMine(@Req() request: AuthenticatedRequest) {
    this.assertProvider(request);
    return this.providers.getMine(request.actor!.userId);
  }

  @Post('apply')
  apply(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    this.assertProvider(request);
    return this.providers.apply(request.actor!.userId, parseBody(ProviderApplicationSchema, body));
  }

  @Get('requests')
  requests(@Req() request: AuthenticatedRequest) {
    this.assertProvider(request);
    return this.providers.listRequests(request.actor!.userId);
  }

  @Get('jobs')
  jobs(@Req() request: AuthenticatedRequest) {
    this.assertProvider(request);
    return this.providers.listJobs(request.actor!.userId);
  }

  @Post('bookings/:id/accept')
  accept(@Req() request: AuthenticatedRequest, @Param('id', new ParseUUIDPipe()) id: string) {
    this.assertProvider(request);
    return this.providers.accept(request.actor!.userId, id);
  }

  @Post('bookings/:id/advance')
  advance(@Req() request: AuthenticatedRequest, @Param('id', new ParseUUIDPipe()) id: string) {
    this.assertProvider(request);
    return this.providers.advance(request.actor!.userId, id);
  }

  private assertProvider(request: AuthenticatedRequest) {
    if (request.actor!.role !== 'provider') throw new ForbiddenException('A provider session is required.');
  }
}
