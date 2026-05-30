import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type AcademicYearDocument = HydratedDocument<AcademicYear>;

@Schema({ timestamps: true })
export class AcademicYear {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true })
  schoolId: mongoose.Types.ObjectId;

  @Prop({ required: true, default: false })
  isActive: boolean;
}

export const AcademicYearSchema = SchemaFactory.createForClass(AcademicYear);
