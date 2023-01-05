import mongoose, { Model, Document } from 'mongoose';
import { QueryResult } from '@/modules/paginate/paginate';

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  pocketTag: string;
  isEmailVerified: boolean;
  kycStatus: boolean;
  kybStatus: boolean;
  businessName: string;
}

export interface IUserDoc extends IUser, Document {
  isPasswordMatch(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDoc> {
  isEmailTaken(email: string, excludeUserId?: mongoose.Types.ObjectId): Promise<boolean>;
  paginate(filter: Record<string, any>, options: Record<string, any>): Promise<QueryResult>;
}
