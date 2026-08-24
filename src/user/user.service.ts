import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDTO: CreateUserDTO) {
    const user = await this.prisma.user.create({
      data: createUserDTO,
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
    return user;
  }

  async deleteUser(id: number) {
    const user = await this.prisma.user.delete({
      where: { id },
    });
    return user;
  }
}
