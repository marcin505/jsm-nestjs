import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @IsEmail() // <-- Dodaj walidację e-maila
  @IsNotEmpty()
  email!: string; // <-- Dodaj to pole
}
