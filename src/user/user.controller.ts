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
import { User } from './user.type';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(@Query('name') name?: string): Promise<User[]> {
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
  ): Promise<User | null> {
    return this.userService.getUserById(id);
  }

  @Post()
  createUser(@Body() createUserDTO: CreateUserDTO) {
    return this.userService.createUser(createUserDTO);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDTO: UpdateUserDTO,
  ): Promise<User | null> {
    return this.userService.updateUser(Number(id), updateUserDTO);
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  async deleteUser(@Param('id') id: string): Promise<User | null> {
    return this.userService.deleteUser(Number(id));
  }
}
