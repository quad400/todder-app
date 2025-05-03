import { AbstractRepository } from 'src/common/abstract/abstract.repository';
import { User, UserType } from './model/user.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository extends AbstractRepository<User> {
  private userModel: Model<UserType>;

  constructor(@InjectModel(User.name) userModel: Model<UserType>) {
    super(userModel);
  }

  async findByEmail(email: string): Promise<UserType | null> {
    return await this.model.findOne({ email }).lean();
  }

  async findWithPassword(email: string): Promise<UserType> {
    return (await this.model
      .findOne({ email })
      .select('+password')
      .lean()) as UserType;
  }
}
