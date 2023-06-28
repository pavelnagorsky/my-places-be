import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthDto } from './dto/auth.dto';
import { LoginDto } from './dto/login.dto';
import { ValidationExceptionDto } from '../shared/validation/validation-exception.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register' })
  @ApiOkResponse({
    description: 'Ok',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User already exists',
    type: UnauthorizedException,
  })
  @ApiBody({
    type: CreateUserDto,
  })
  @Post('/register')
  async create(@Body() createUserDto: CreateUserDto) {
    await this.authService.register(createUserDto);
    return;
  }

  @ApiOperation({ summary: 'Login' })
  @ApiOkResponse({
    description: 'token response',
    type: AuthDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: UnauthorizedException,
  })
  @ApiBody({
    type: LoginDto,
  })
  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    const token = await this.authService.login(loginDto);
    return new AuthDto(token);
  }
}
