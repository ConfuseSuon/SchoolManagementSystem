import { IsEmail, IsMongoId, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateStudentDto {
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

  @IsString()
  @IsOptional()
  rollNumber?: string;

  @IsMongoId()
  @IsNotEmpty()
  classId: string;
}