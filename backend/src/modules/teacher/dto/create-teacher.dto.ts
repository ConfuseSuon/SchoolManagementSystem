import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  classIds?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  subjectIds?: string[];
}