import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { Student, StudentSchema } from './student.schema';
import { UserModule } from '../user/user.module';
import { Enrollment, EnrollmentSchema } from '../enrollment/enrollment.schema';
import { AcademicYear, AcademicYearSchema } from '../academic-year/academic-year.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: AcademicYear.name, schema: AcademicYearSchema },
    ]),
    UserModule,
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}