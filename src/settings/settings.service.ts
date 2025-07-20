import { Injectable } from '@nestjs/common';

@Injectable()
export class SettingsService {
  private settings: Record<string, any> = {};

  getSetting(key: string) {
    return this.settings[key];
  }

  setSetting(key: string, value: any) {
    this.settings[key] = value;
    return { key, value };
  }

  getWorkflowSettings(type: string) {
    return this.settings[`workflow_${type}`] || {};
  }

  setWorkflowSettings(type: string, config: any) {
    this.settings[`workflow_${type}`] = config;
    return { type, config };
  }
}
