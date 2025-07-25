import { IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class TransferLandDto {
  @IsNumber()
  @IsNotEmpty()
  parcelId: number;

  @IsNumber()
  @IsNotEmpty()
  fromOwnerId: number;

  @IsNumber()
  @IsNotEmpty()
  toOwnerId: number;

  @IsOptional()
  documents: any;
}
