import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LandService } from './land.service';
import { CreateLandDto } from './dto/create-land.dto';
import { TransferLandDto } from './dto/transfer-land.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('land')
export class LandController {
  constructor(private readonly landService: LandService) {}

  @Roles('citizen', 'ADMIN')
  @Post('register')
  registerLand(@Body() createLandDto: CreateLandDto, @Request() req) {
    return this.landService.registerLand(createLandDto, req.user.id);
  }

  @Roles('citizen', 'ADMIN')
  @Post('transfer')
  transferLand(@Body() transferLandDto: TransferLandDto, @Request() req) {
    return this.landService.transferLand(transferLandDto, req.user.id);
  }

  @Get(':id')
  getLandById(@Param('id') id: number) {
    return this.landService.getLandById(id);
  }
}
