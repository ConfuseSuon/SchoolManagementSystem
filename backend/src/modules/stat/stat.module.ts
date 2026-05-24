import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { School, SchoolSchema } from '../school/school.schema';
import { AcademicClass, AcademicClassSchema } from '../academic-class/academic-class.schema';
import { Teacher, TeacherSchema } from '../teacher/teacher.schema';
import { Student, StudentSchema } from '../student/student.schema';
import { StatController } from './stat.controller';
import { StatService } from './stat.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: School.name, schema: SchoolSchema },
      { name: AcademicClass.name, schema: AcademicClassSchema },
      { name: Teacher.name, schema: TeacherSchema },
      { name: Student.name, schema: StudentSchema }
    ])
  ],
  controllers: [StatController],
  providers: [StatService]
})
export class StatModule {}
