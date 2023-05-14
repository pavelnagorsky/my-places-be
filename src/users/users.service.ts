import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RolesService } from '../roles/roles.service';
import { RoleNamesEnum } from '../roles/enums/role-names.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly rolesService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    const defaultRole = await this.rolesService.getRoleByName(
      RoleNamesEnum.USER,
    );
    if (!defaultRole)
      throw new UnauthorizedException({ message: 'No default role found' });
    user.roles = [defaultRole];
    return await this.usersRepository.save(user);
  }

  async getUserByEmail(email: string) {
    return await this.usersRepository.findOne({
      relations: {
        roles: true,
      },
      where: {
        email: Equal(email),
      },
    });
  }

  async findAll() {
    return await this.usersRepository.find({ relations: { roles: true } });
  }

  async findOneById(id: number) {
    return await this.usersRepository.findOne({
      relations: {
        roles: true,
        admin: true,
      },
      where: {
        id: Equal(id),
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
