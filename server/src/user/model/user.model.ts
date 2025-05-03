import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
// import { AbstractSchema } from 'src/common/abstract/abstract.schema';

export type UserType = User & Document;
@Schema({ versionKey: false, timestamps: true, strict: false, _id: false })
export class User extends Document {
  @Prop({
    type: String,
  })
  fullname: string;
  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  email: string;
  @Prop({
    type: String,
    select: false,
  })
  password: string;

  @Prop({
    type: String,
  })
  googleId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
