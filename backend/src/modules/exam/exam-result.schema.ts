import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ExamResultDocument = HydratedDocument<ExamResult>;

@Schema({ timestamps: true })
export class ExamResult {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true })
  examId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true })
  studentId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true })
  schoolId: mongoose.Types.ObjectId;

  @Prop({ type: Number })
  marksObtained?: number;

  @Prop({ required: true, default: false })
  isAbsent: boolean;

  @Prop({ required: true, default: false })
  isPassed: boolean;
}

export const ExamResultSchema = SchemaFactory.createForClass(ExamResult);
ExamResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });
