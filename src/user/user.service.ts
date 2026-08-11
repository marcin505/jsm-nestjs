import { Injectable, Param } from '@nestjs/common';
import { LoggerService } from './user.logger';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}

  private users: User[] = users;

  findAllUsers(name: string = '') {
    this.logger.log('Finding all users');

    return this.users.filter((user) =>
      user.name.toLowerCase().includes(name.toLowerCase()),
    );
  }

  getUserById(id: string = ''): User | undefined {
    this.logger.log(`Finding user with id ${id}`);

    return this.users.find((user) => user.id === Number(id));
  }
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: `john@example.com` },
  { id: 2, name: 'Mel Gibson', email: `mel@gibson.com` },
  { id: 3, name: 'John Dutton', email: `john@dutton.com` },
];
