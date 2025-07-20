import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSetting(@Query('key') key: string) {
    return this.settingsService.getSetting(key);
  }

  @Post()
  setSetting(@Body() body: { key: string; value: any }) {
    return this.settingsService.setSetting(body.key, body.value);
  }

  @Get('workflow')
  getWorkflowSettings(@Query('type') type: string) {
    return this.settingsService.getWorkflowSettings(type);
  }

  @Post('workflow')
  setWorkflowSettings(@Body() body: { type: string; config: any }) {
    return this.settingsService.setWorkflowSettings(body.type, body.config);
  }

  @Get('test')
  testSettings() {
    return { message: 'Settings system is up' };
  }
}
