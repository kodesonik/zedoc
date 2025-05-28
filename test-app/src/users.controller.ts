import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';

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

@ApiTags('Users')
@Controller('users')
export class UsersController {
  private users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35 },
  ];

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a paginated list of all users in the system',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully retrieved users',
    schema: {
      type: 'object',
      properties: {
        data: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              email: { type: 'string' },
              age: { type: 'number' }
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' }
          }
        }
      }
    }
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
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their unique identifier',
  })
  @ApiParam({ name: 'id', type: String, description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        email: { type: 'string' },
        age: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    const user = this.users.find(u => u.id === parseInt(id));
    if (!user) {
      return { error: 'User not found' };
    }
    return user;
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Create a new user in the system with the provided information',
  })
  @ApiBody({
    description: 'User data for creation',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', format: 'email', example: 'john@example.com' },
        age: { type: 'number', example: 30 }
      },
      required: ['name', 'email']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
        email: { type: 'string' },
        age: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid user data provided' })
  create(@Body() createUserDto: CreateUserDto) {
    const newUser: User = {
      id: Math.max(...this.users.map(u => u.id)) + 1,
      ...createUserDto,
    };
    this.users.push(newUser);
    return newUser;
  }

  @Get('search/by-name')
  @ApiOperation({
    summary: 'Search users by name',
    description: 'Search for users by their name (case-insensitive)',
  })
  @ApiQuery({ name: 'name', required: true, type: String, description: 'Name to search for' })
  @ApiResponse({ 
    status: 200, 
    description: 'Search results',
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              email: { type: 'string' },
              age: { type: 'number' }
            }
          }
        },
        count: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Name parameter is required' })
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