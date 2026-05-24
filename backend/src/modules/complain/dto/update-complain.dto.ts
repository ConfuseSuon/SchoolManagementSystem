import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateComplainDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  complaint?: string;
}