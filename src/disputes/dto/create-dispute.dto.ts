import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateDisputeDto {
  @IsNumber()
  @IsNotEmpty()
  parcelId: number;

  @IsNumber()
  @IsNotEmpty()
  complainantId: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  supportingDocuments: any;
}
