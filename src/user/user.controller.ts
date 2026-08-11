import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import type { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  @Get()
  getUsers(@Query('name') name: string) {
    if (name) {
      const cleanName = name.replace(/[%']/g, '').toLowerCase();
      return users.filter((user) =>
        user.name.toLowerCase().includes(cleanName),
      );
    }

    return users;
  }
  @Get(':id')
  getUserById(@Param('id') id: string) {
    return users.filter((user) => user.id === Number(id));
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
const users = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Killer Joe' },
  { id: 3, name: 'Joe' },
];
