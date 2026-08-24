// src/user/user.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UserService } from './user.service';
import { RoleGuard } from 'src/guards/role.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(
    @Query('name') name?: string,
  ): Promise<Awaited<ReturnType<UserService['getUsers']>>> {
    if (name) {
      return this.userService
        .getUsers()
        .then((users) => users.filter((user) => user.name === name));
    }
    return this.userService.getUsers();
  }

  @Get(':id')
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Awaited<ReturnType<UserService['getUserById']>>> {
    return this.userService.getUserById(id);
  }

  @Post()
  async createUser(
    @Body() createUserDTO: CreateUserDTO,
  ): Promise<Awaited<ReturnType<UserService['createUser']>>> {
    return this.userService.createUser(createUserDTO);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDTO: UpdateUserDTO,
  ): Promise<Awaited<ReturnType<UserService['updateUser']>>> {
    return this.userService.updateUser(Number(id), updateUserDTO);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  async deleteUser(
    @Param('id') id: string,
  ): Promise<Awaited<ReturnType<UserService['deleteUser']>>> {
    return this.userService.deleteUser(Number(id));
  }
}
