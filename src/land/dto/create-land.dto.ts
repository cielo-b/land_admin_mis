import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateLandDto {
  @IsString()
  @IsNotEmpty()
  parcelNumber: string;

  @IsNotEmpty()
  location: any; // GeoJSON or WKT

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
