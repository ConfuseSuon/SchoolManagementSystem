import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['Admin', 'Teacher', 'Student'] })
  role: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true })
  schoolId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'profileModel' })
  profileId: mongoose.Types.ObjectId;

  @Prop({ required: true, enum: ['Admin', 'Teacher', 'Student'] })
  profileModel: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1, schoolId: 1 }, { unique: true });
