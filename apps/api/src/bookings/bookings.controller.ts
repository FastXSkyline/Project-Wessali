import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateBookingSchema } from '@wessali/contracts';
import { parseBody } from '../common/parse-body.js';
import type { AuthenticatedRequest } from '../auth/auth.types.js';
import { SessionGuard } from '../auth/session.guard.js';
import { BookingsService } from './bookings.service.js';

@Controller('bookings')
@UseGuards(SessionGuard)
export class BookingsController {
  constructor(@Inject(BookingsService) private readonly bookings: BookingsService) {}

  @Get('mine')
  listMine(@Req() request: AuthenticatedRequest) {
    if (request.actor!.role !== 'customer')
      throw new ForbiddenException('A customer session is required.');
    return this.bookings.listForCustomer(request.actor!.userId);
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    if (request.actor!.role !== 'customer')
      throw new ForbiddenException('A customer session is required.');
    return this.bookings.create(request.actor!.userId, parseBody(CreateBookingSchema, body));
  }

  @Post(':id/cancel')
  cancel(@Req() request: AuthenticatedRequest, @Param('id', new ParseUUIDPipe()) id: string) {
    if (request.actor!.role !== 'customer')
      throw new ForbiddenException('A customer session is required.');
    return this.bookings.cancel(request.actor!.userId, id);
  }
}
