import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail() // <-- Dodaj walidację e-maila
  @IsNotEmpty()
  email!: string; // <-- Dodaj to pole
}
