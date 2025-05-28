import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiDoc } from '@kodesonik/zedoc';

@Controller('users')
export class UsersController {
  @Get()
  @ApiDoc({
    summary: 'Get all users',
    description: 'Retrieve a list of all users in the system',
    tags: ['Users'],
  })
  findAll() {
    return [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ];
  }

  @Get(':id')
  @ApiDoc({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their ID',
    tags: ['Users'],
  })
  findOne(@Param('id') id: string) {
    return { id: +id, name: 'John Doe', email: 'john@example.com' };
  }

  @Post()
  @ApiDoc({
    summary: 'Create a new user',
    description: 'Create a new user in the system',
    tags: ['Users'],
  })
  create(@Body() createUserDto: any) {
    return { id: 3, ...createUserDto };
  }
} 