import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
