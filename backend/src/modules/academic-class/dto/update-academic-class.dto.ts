import { IsOptional, IsString } from 'class-validator';

export class UpdateAcademicClassDto {
  @IsString()
  @IsOptional()
  name?: string;
}