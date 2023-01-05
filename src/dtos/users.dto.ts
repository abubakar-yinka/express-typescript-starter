/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email!: string;

  @IsString()
  public password!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9-_.@]+$/)
  @MinLength(3)
  @MaxLength(32)
  public username?: string;
}
