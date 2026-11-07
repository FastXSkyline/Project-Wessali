import { Module } from '@nestjs/common';
import { AdminController } from './admin/admin.controller.js';
import { AdminService } from './admin/admin.service.js';
import { AuthController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { SessionGuard } from './auth/session.guard.js';
import { BookingsController } from './bookings/bookings.controller.js';
import { BookingsService } from './bookings/bookings.service.js';
import { DatabaseService } from './database/database.service.js';
import { ProvidersController } from './providers/providers.controller.js';
import { ProvidersService } from './providers/providers.service.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  controllers: [
    AppController,
    AuthController,
    BookingsController,
    ProvidersController,
    AdminController,
  ],
  providers: [
    AppService,
    DatabaseService,
    AuthService,
    SessionGuard,
    BookingsService,
    ProvidersService,
    AdminService,
  ],
})
export class AppModule {}
