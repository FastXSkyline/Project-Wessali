import { Injectable } from '@nestjs/common';
import { SERVICE_CATEGORIES } from '@wessali/contracts';

@Injectable()
export class AppService {
  getHealth() {
    return {
      service: 'wessali-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  getServices() {
    return SERVICE_CATEGORIES;
  }
}
