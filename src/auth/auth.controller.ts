import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthDto } from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register' })
  @ApiOkResponse({
    description: 'auth response',
    type: AuthDto,
  })
  @ApiBadRequestResponse({
    description: 'User already exists',
  })
  @ApiBody({
    type: CreateUserDto,
  })
  @Post('/register')
  async create(@Body() createUserDto: CreateUserDto) {
    const token = await this.authService.register(createUserDto);
    return new AuthDto(token);
  }
}
