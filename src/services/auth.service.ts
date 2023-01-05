import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { IUserDoc } from '@interfaces/users.interface';
import User from '@models/users.model';
import { isEmpty } from '@utils/util';

class AuthService {
  public users = User;

  public async signup(userData: CreateUserDto): Promise<IUserDoc> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: IUserDoc | null = await this.users.findOne({ email: userData.email });
    if (findUser) throw new HttpException(409, `You're email ${userData.email} already exists`);

    const hashedPassword = await hash(userData.password, 10);
    const createUserData: IUserDoc = await this.users.create({ ...userData, password: hashedPassword });

    return createUserData;
  }

  public async login(userData: CreateUserDto): Promise<{ cookie: string; findUser: IUserDoc }> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: IUserDoc | null = await this.users.findOne({ email: userData.email });
    if (!findUser) throw new HttpException(409, `You're email ${userData.email} not found`);

    const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
    if (!isPasswordMatching) throw new HttpException(409, "You're password not matching");

    const tokenData = this.createToken(findUser);
    const cookie = this.createCookie(tokenData);

    return { cookie, findUser };
  }

  public async logout(userData: IUserDoc): Promise<IUserDoc> {
    if (isEmpty(userData)) throw new HttpException(400, "You're not userData");

    const findUser: IUserDoc | null = await this.users.findOne({ email: userData.email, password: userData.password });
    if (!findUser) throw new HttpException(409, `You're email ${userData.email} not found`);

    return findUser;
  }

  public createToken(user: IUserDoc): TokenData {
    const dataStoredInToken: DataStoredInToken = { _id: user._id };
    const secretKey: string | undefined = SECRET_KEY;
    const expiresIn: number = 60 * 60;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return { expiresIn, token: sign(dataStoredInToken, secretKey!, { expiresIn }) };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}

export default AuthService;
