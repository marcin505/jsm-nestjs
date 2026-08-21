// src/user/user.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { User } from './user.type';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDTO: CreateUserDTO): Promise<User> {
    const user = await this.prisma.user.create({
      data: createUserDTO,
    });
    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (user) {
      // Ensure that the name property is always a string
      user.name = user.name ?? '';
    }

    return user;
  }

  async getUsers(): Promise<User[]> {
    const users = await this.prisma.user.findMany();

    // Ensure that the name property is always a string for each user
    return users.map((user) => ({
      ...user,
      name: user.name ?? '',
    }));
  }

  async updateUser(
    id: number,
    updateData: UpdateUserDTO,
  ): Promise<User | null> {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });
    return user;
  }

  async deleteUser(id: number): Promise<User | null> {
    const user = await this.prisma.user.delete({
      where: { id },
    });
    return user;
  }
}
