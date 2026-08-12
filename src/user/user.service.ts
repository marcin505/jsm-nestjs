import { Injectable, NotFoundException } from '@nestjs/common';
import { LoggerService } from './user.logger';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}

  private users: User[] = initialUsers; // Przypisanie początkowej listy użytkowników

  findAllUsers(name: string = ''): User[] {
    this.logger.log('Finding all users');

    return this.users.filter((user) =>
      user.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  getUserById(id: string = ''): User | undefined {
    this.logger.log(`Finding user with id ${id}`);

    return this.users.find((user) => user.id === Number(id));
  }

  createUser(createUserDTO: CreateUserDTO) {
    this.logger.log('Creating a new user');

    // Generowanie nowego ID na podstawie najwyższego obecnego ID
    const newId =
      this.users.length > 0 ? Math.max(...this.users.map((u) => u.id)) + 1 : 1;

    const newUser: User = {
      ...createUserDTO,
      id: newId, // <-- Przeniesione na dół. Teraz to pole ma ostateczny głos!
    };

    this.users.push(newUser);

    return {
      data: newUser,
      message: 'User created successfully',
    };
  }

  updateUser(id: string, updateUserDTO: UpdateUserDTO) {
    this.logger.log(`Updating user with id ${id}`);

    const userIndex = this.users.findIndex((user) => user.id === Number(id));

    // Opcjonalnie: rzucamy błąd NestJS, jeśli użytkownik nie istnieje w tablicy
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Aktualizacja obiektu w tablicy
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateUserDTO,
    };

    return {
      data: this.users[userIndex],
      message: 'User updated successfully',
    };
  }

  deleteUser(id: string): User | undefined {
    this.logger.log(`Deleting user with id ${id}`); // To się teraz na pewno wywoła!

    const numericId = Number(id);
    // 1. Znajdujemy użytkownika, którego chcemy usunąć (żeby go zwrócić na koniec)
    const userToDelete = this.users.find((user) => user.id === numericId);

    if (!userToDelete) {
      this.logger.log(`User with id ${id} not found`);
      return undefined; // Lub: throw new NotFoundException(`User not found`);
    }

    // 2. Nadpisujemy tablicę, zostawiając wszystkich OPRÓCZ usuniętego użytkownika
    this.users = this.users.filter((user) => user.id !== numericId);

    // 3. Zwracamy usuniętego użytkownika
    return userToDelete;
  }
}

// Zmieniłem nazwę zmiennej na initialUsers, aby nie gryzła się z typem "User[] = users"
const initialUsers: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Mel Gibson', email: 'mel@gibson.com' },
  { id: 3, name: 'John Dutton', email: 'john@dutton.com' },
];
