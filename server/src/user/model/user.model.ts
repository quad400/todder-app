import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractSchema } from 'src/common/abstract/abstract.schema';

@Schema({ versionKey: false, timestamps: true, strict: false })
export class User extends AbstractSchema {
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
