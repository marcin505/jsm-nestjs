import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { KafkaService } from 'src/kafka/kafka.service'; // <-- Import Twojego serwisu Kafki

@Injectable()
export class UserService {
  // 1. Wstrzyknięcie KafkaService obok PrismaService
  constructor(
    private prisma: PrismaService,
    private kafkaService: KafkaService,
  ) {}

  async createUser(createUserDTO: CreateUserDTO) {
    const user = await this.prisma.user.create({
      data: createUserDTO,
    });

    // Event: Użytkownik został zarejestrowany
    this.kafkaService.emitEvent('user.created', {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });

    return user;
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (user) {
      user.name = user.name ?? '';
    }

    return user;
  }

  async getUsers() {
    const users = await this.prisma.user.findMany();

    return users.map((user) => ({
      ...user,
      name: user.name ?? '',
    }));
  }

  async updateUser(id: number, updateData: UpdateUserDTO) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Event: Dane użytkownika (lub jego rola w systemie) uległy zmianie
    this.kafkaService.emitEvent('user.updated', {
      id: user.id,
      email: user.email,
      role: user.role,
      updatedAt: user.updatedAt,
      // Przekazujemy klucze, które rzeczywiście się zmieniły
      changes: Object.keys(updateData),
    });

    return user;
  }

  async deleteUser(id: number) {
    const user = await this.prisma.user.delete({
      where: { id },
    });

    // Event: Konto usunięte (np. trigger dla Notification Service, by wysłać pożegnalny e-mail)
    this.kafkaService.emitEvent('user.deleted', {
      id: user.id,
      email: user.email,
    });

    return user;
  }
}
