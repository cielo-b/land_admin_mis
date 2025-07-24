import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { Column } from 'typeorm';

export class CreateLandDto {
  @IsString()
  @IsNotEmpty()
  parcelNumber: string;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  location: any;

  // {
  //   "parcelNumber": "ABC-123",
  //   "location": "SRID=4326;POINT(30.0619 -1.9441)",
  //   "area": 1200,
  //   "registeredOwnerId": 5,
  // }

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
