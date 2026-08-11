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

  @Post() // POST /user
  createUser(@Body() createUserDTO: CreateUserDTO) {
    return { data: createUserDTO, cessage: 'User created successfully' };
  }
  @Put() //user/:id
  updateUser(@Param('id') id: string, @Body() updateUserDTO: UpdateUserDTO) {
    return {
      data: { id, ...updateUserDTO },
      message: 'User updated successfully',
    };
  }
}
