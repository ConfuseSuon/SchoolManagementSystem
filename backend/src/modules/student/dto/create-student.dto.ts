import { IsMongoId, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  rollNumber?: string;

  @IsMongoId()
  @IsNotEmpty()
  classId: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  gender?: string;
}