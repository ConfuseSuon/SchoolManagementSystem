import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { envValidationSchema } from './config/env.config';
import { AuthModule } from './modules/auth/auth.module';
import { SchoolModule } from './modules/school/school.module';
import { AdminModule } from './modules/admin/admin.module';
import { AcademicClassModule } from './modules/academic-class/academic-class.module';
import { SubjectModule } from './modules/subject/subject.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { StudentModule } from './modules/student/student.module';
import { NoticeModule } from './modules/notice/notice.module';
import { ComplainModule } from './modules/complain/complain.module';
import { SharedModule } from './modules/shared/shared.module';
import { StatModule } from './modules/stat/stat.module';
import { UserModule } from './modules/user/user.module';
import { AcademicYearModule } from './modules/academic-year/academic-year.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ExamModule } from './modules/exam/exam.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    SharedModule,
    SchoolModule,
    AdminModule,
    AcademicClassModule,
    SubjectModule,
    TeacherModule,
    StudentModule,
    NoticeModule,
    ComplainModule,
    StatModule,
    UserModule,
    AcademicYearModule,
    EnrollmentModule,
    AttendanceModule,
    ExamModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
