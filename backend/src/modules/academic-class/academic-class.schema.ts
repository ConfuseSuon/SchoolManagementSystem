import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type AcademicClassDocument = HydratedDocument<AcademicClass>;

@Schema({ timestamps: true })
export class AcademicClass {
  @Prop({ required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true })
  schoolId: mongoose.Types.ObjectId;
}

export const AcademicClassSchema = SchemaFactory.createForClass(AcademicClass);