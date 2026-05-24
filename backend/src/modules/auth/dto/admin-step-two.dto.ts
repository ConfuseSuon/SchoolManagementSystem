import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class AdminStepTwoDto {
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @IsMongoId()
  @IsNotEmpty()
  schoolId: string;
}