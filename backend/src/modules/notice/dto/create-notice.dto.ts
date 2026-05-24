import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateNoticeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  details: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}