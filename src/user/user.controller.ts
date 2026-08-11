import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UserService, User } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers(@Query('name') name: string): User[] {
    if (name) {
      return this.userService.findAllUsers(name);
    }
    return [];
  }

  @Get(':id')
  getUserById(@Param('id') id: string): User | undefined {
    return this.userService.getUserById(id);
  }

  @Post()
  createUser(@Body() createUserDTO: CreateUserDTO) {
    return this.userService.createUser(createUserDTO);
  }

  @Put(':id') // Poprawione z @Put(), aby @Param('id') łapał wartość z adresu URL
  updateUser(@Param('id') id: string, @Body() updateUserDTO: UpdateUserDTO) {
    return this.userService.updateUser(id, updateUserDTO);
  }
}
