import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AdminStepOneDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}