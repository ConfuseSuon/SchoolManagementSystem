import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateComplainDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  complaint: string;
}