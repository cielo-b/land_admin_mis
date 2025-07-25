import { Type } from 'class-transformer';
import { IsString, IsNumber, IsNotEmpty, IsArray, ArrayMinSize, ValidateNested } from 'class-validator';


class PointDto {
  @IsNumber()
  longitude: number;

  @IsNumber()
  latitude: number;
}

export class CreateLandDto {
  @IsArray()
  @ArrayMinSize(4) 
  @ValidateNested({ each: true })
  @Type(() => PointDto)
  points: PointDto[];

  @IsNumber()
  area: number;

  @IsString()
  address: string;

  @IsString()
  district: string;

  @IsString()
  sector: string;

  @IsString()
  cell: string;

  @IsString()
  village: string;

  @IsNumber()
  registeredOwnerId: number;
}
