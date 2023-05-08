import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const alreadyExists = await this.usersService.userByEmailExists(dto.email);
    if (alreadyExists)
      throw new UnauthorizedException('User with this email already exists');
    const hashPassword = await bcrypt.hash(dto.password, 7);
    dto.password = hashPassword;
    const user = await this.usersService.create(dto);
    return await this.generateToken(user);
  }

  async generateToken(user: User) {
    const payload = {
      email: user.email,
      id: user.id,
      roles: user.roles,
    };
    return this.jwtService.sign(payload);
  }
}
