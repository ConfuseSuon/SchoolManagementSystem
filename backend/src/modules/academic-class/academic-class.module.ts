import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AcademicClassService } from './academic-class.service';
import { AcademicClassController } from './academic-class.controller';
import { AcademicClass, AcademicClassSchema } from './academic-class.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: AcademicClass.name, schema: AcademicClassSchema }])],
  controllers: [AcademicClassController],
  providers: [AcademicClassService],
  exports: [AcademicClassService],
})
export class AcademicClassModule {}