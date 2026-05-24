import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAcademicClassDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}