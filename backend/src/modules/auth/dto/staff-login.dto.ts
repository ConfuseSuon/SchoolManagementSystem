import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class StaffLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsIn(['Student', 'Teacher'])
  @IsNotEmpty()
  role: string;
}