import { Module } from '@nestjs/common';
import { LandTaxesController } from './land-taxes.controller';
import { LandTaxesService } from './land-taxes.service';

@Module({
  controllers: [LandTaxesController],
  providers: [LandTaxesService],
  exports: [LandTaxesService],
})
export class LandTaxesModule {}
