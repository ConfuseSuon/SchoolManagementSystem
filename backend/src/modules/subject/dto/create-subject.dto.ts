import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsMongoId()
  @IsNotEmpty()
  classId: string;

  @IsMongoId()
  @IsOptional()
  teacherId?: string;
}