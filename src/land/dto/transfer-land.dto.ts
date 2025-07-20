import { IsNumber, IsNotEmpty } from 'class-validator';

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

  @IsNotEmpty()
  documents: any;
}
