import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiDoc } from '@kodesonik/zedoc';

interface CreateUserDto {
  name: string;
  email: string;
  age?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

@Controller('users')
export class UsersController {
  private users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35 },
  ];

  @Get()
  @ApiDoc({
    summary: 'Get all users',
    description: 'Retrieve a paginated list of all users in the system',
    tags: ['Users'],
  })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    return {
      data: this.users.slice(startIndex, endIndex),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: this.users.length,
        totalPages: Math.ceil(this.users.length / limitNum),
      },
    };
  }

  @Get(':id')
  @ApiDoc({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their unique identifier',
    tags: ['Users'],
  })
  findOne(@Param('id') id: string) {
    const user = this.users.find(u => u.id === parseInt(id));
    if (!user) {
      return { error: 'User not found' };
    }
    return user;
  }

  @Post()
  @ApiDoc({
    summary: 'Create a new user',
    description: 'Create a new user in the system with the provided information',
    tags: ['Users'],
  })
  create(@Body() createUserDto: CreateUserDto) {
    const newUser: User = {
      id: Math.max(...this.users.map(u => u.id)) + 1,
      ...createUserDto,
    };
    this.users.push(newUser);
    return newUser;
  }

  @Get('search/by-name')
  @ApiDoc({
    summary: 'Search users by name',
    description: 'Search for users by their name (case-insensitive)',
    tags: ['Users'],
  })
  searchByName(@Query('name') name: string) {
    if (!name) {
      return { error: 'Name parameter is required' };
    }
    
    const results = this.users.filter(user => 
      user.name.toLowerCase().includes(name.toLowerCase())
    );
    
    return {
      query: name,
      results,
      count: results.length,
    };
  }
} 