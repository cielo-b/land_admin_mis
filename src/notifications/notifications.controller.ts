import { Controller, Get } from '@nestjs/common';

@Controller('notifications')
export class NotificationsController {
  @Get('test')
  testNotification() {
    return { message: 'Notification system is up' };
  }
}
