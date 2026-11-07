import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProviderReviewSchema } from '@wessali/contracts';
import { parseBody } from '../common/parse-body.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { SessionGuard } from '../auth/session.guard.js';
import { BookingsService } from '../bookings/bookings.service.js';
import { AdminService } from './admin.service.js';

@Controller('admin')
@UseGuards(SessionGuard)
export class AdminController {
  constructor(
    @Inject(AdminService) private readonly admin: AdminService,
    @Inject(BookingsService) private readonly bookings: BookingsService,
  ) {}

  @Get('overview')
  overview(@Req() request: AuthenticatedRequest) {
    this.admin.assertAdmin(request.actor!.role);
    return this.admin.overview();
  }

  @Get('bookings')
  listBookings(@Req() request: AuthenticatedRequest) {
    this.admin.assertAdmin(request.actor!.role);
    return this.bookings.listAll();
  }

  @Get('providers')
  listProviders(@Req() request: AuthenticatedRequest) {
    this.admin.assertAdmin(request.actor!.role);
    return this.admin.listProviders();
  }

  @Post('providers/:id/review')
  reviewProvider(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: unknown,
  ) {
    this.admin.assertAdmin(request.actor!.role);
    return this.admin.reviewProvider(
      request.actor!.userId,
      id,
      parseBody(ProviderReviewSchema, body),
    );
  }
}
