import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Roles('CITIZEN', 'ADMIN')
  @Post('submit')
  submitDispute(@Body() createDisputeDto: CreateDisputeDto, @Request() req) {
    return this.disputesService.submitDispute(createDisputeDto, req.user.id);
  }

  @Get(':id')
  getDisputeById(@Param('id') id: number) {
    return this.disputesService.getDisputeById(id);
  }
}
