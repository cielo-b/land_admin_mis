import { Controller, Get, Query } from '@nestjs/common';
import { LandTaxesService } from './land-taxes.service';

@Controller('land-taxes')
export class LandTaxesController {
  constructor(private readonly landTaxesService: LandTaxesService) {}

  @Get('calculate')
  calculate(@Query('area') area: number) {
    return this.landTaxesService.getTaxForParcel({ area: Number(area) });
  }

  @Get('test')
  testTaxes() {
    return { message: 'Land taxes system is up' };
  }
}
