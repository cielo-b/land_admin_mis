import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreatePermitDto {
  @IsNumber()
  @IsNotEmpty()
  parcelId: number;

  @IsNumber()
  @IsNotEmpty()
  applicantId: number;

  @IsString()
  @IsNotEmpty()
  constructionType: string;

  @IsNumber()
  plannedArea: number;

  @IsNotEmpty()
  documents: any;
}
