import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { TokenPayloadDto } from './dto/token-payload.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const alreadyExists = await this.usersService.getUserByEmail(dto.email);
    if (alreadyExists)
      throw new UnauthorizedException({
        message: 'User with this email already exists',
      });
    const hashPassword = await bcrypt.hash(dto.password, 12);
    dto.password = hashPassword;
    const user = await this.usersService.create(dto);
    return this.generateToken(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);
    return this.generateToken(user);
  }

  private async validateUser(loginDto: LoginDto) {
    const user = await this.usersService.getUserByEmail(loginDto.email);
    if (!user)
      throw new UnauthorizedException({
        message: 'No user with this email found',
      });
    const passwordEquals = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!passwordEquals)
      throw new UnauthorizedException({ message: 'Incorrect password' });
    return user;
  }

  private generateToken(user: User) {
    const payload: TokenPayloadDto = {
      email: user.email,
      id: user.id,
      roles: user.roles,
    };
    return this.jwtService.sign(payload);
  }
}
