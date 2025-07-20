import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PermitsService } from './permits.service';
import { CreatePermitDto } from './dto/create-permit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permits')
export class PermitsController {
  constructor(private readonly permitsService: PermitsService) {}

  @Roles('CITIZEN', 'ADMIN')
  @Post('apply')
  applyPermit(@Body() createPermitDto: CreatePermitDto, @Request() req) {
    return this.permitsService.applyPermit(createPermitDto, req.user.id);
  }

  @Get(':id')
  getPermitById(@Param('id') id: number) {
    return this.permitsService.getPermitById(id);
  }
}
