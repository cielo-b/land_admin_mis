import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(Number(id));
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: any) {
    return this.usersService.update(Number(id), updateUserDto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(Number(id));
  }

  @Get('test')
  testUsers() {
    return { message: 'User management system is up' };
  }
}
