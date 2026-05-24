import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';

export class UpdateTeacherDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  classIds?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  subjectIds?: string[];
}