import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AcademicClass, AcademicClassSchema } from '../academic-class/academic-class.schema';
import { Subject, SubjectSchema } from '../subject/subject.schema';
import { Teacher, TeacherSchema } from '../teacher/teacher.schema';
import { ValidationService } from './validation.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AcademicClass.name, schema: AcademicClassSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: Teacher.name, schema: TeacherSchema },
    ]),
  ],
  providers: [ValidationService],
  exports: [ValidationService],
})
export class SharedModule {}