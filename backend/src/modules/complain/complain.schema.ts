import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ComplainDocument = HydratedDocument<Complain>;

@Schema({ timestamps: true })
export class Complain {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true })
  studentId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true })
  schoolId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  complaint: string;
}

export const ComplainSchema = SchemaFactory.createForClass(Complain);