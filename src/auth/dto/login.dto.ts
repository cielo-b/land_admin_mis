/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email for login', required: true })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Password for login', required: true })
  @IsString()
  @IsNotEmpty()
  password: string;
}
