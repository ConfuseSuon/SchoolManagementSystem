import { IsArray, IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  classIds?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  subjectIds?: string[];
}