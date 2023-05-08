import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RolesService } from '../roles/roles.service';
import { RoleNamesEnum } from '../roles/enums/role-names.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly rolesService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    const defaultRole = await this.rolesService.getRoleByName(
      RoleNamesEnum.USER,
    );
    if (!defaultRole) throw new UnauthorizedException('No default role found');
    user.roles = [defaultRole];
    return await this.usersRepository.save(user);
  }

  async userByEmailExists(email: string): Promise<boolean> {
    const count = await this.usersRepository
      .createQueryBuilder('u')
      .where('u.email = :email', { email })
      .getCount();
    return count > 0;
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
