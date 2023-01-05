import { hash } from 'bcrypt';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { IUserModel } from '@interfaces/users.interface';
import User from '@models/users.model';
import { isEmpty } from '@utils/util';

class UserService {
  public users = User;

  public async findAllUser(): Promise<IUserModel[]> {
    const users: IUserModel[] = await this.users.find();
    return users;
  }

  public async findUserById(userId: string): Promise<IUserModel> {
    if (isEmpty(userId)) throw new HttpException(400, "You're not userId");

    const findUser: IUserModel | null = await this.users.findOne({ _id: userId });
    if (!findUser) throw new HttpException(409, "You're not user");

    return findUser;
  }

  public async createUser(userData: CreateUserDto): Promise<IUserModel> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: IUserModel | null = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: IUserModel = (await this.users.create({ ...userData, password: hashedPassword })) as unknown as IUserModel;

    return createUserData;
  }

  public async updateUser(userId: string, userData: CreateUserDto): Promise<IUserModel> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    if (userData.email) {
      const findUser: IUserModel | null = await this.users.findOne({ email: userData.email });
      if (findUser && findUser._id.toString() != userId) throw new HttpException(409, `You're email ${userData.email} already exists`);
    }

    if (userData.password) {
      const hashedPassword = await hash(userData.password, 10);
      userData = { ...userData, password: hashedPassword };
    }

    const updateUserById: IUserModel | null = await this.users.findByIdAndUpdate(userId, { userData });
    if (!updateUserById) throw new HttpException(409, "You're not user");

    return updateUserById;
  }

  public async deleteUser(userId: string): Promise<IUserModel> {
    const deleteUserById: IUserModel | null = await this.users.findByIdAndDelete(userId);
    if (!deleteUserById) throw new HttpException(409, "You're not user");

    return deleteUserById;
  }
}

export default UserService;
