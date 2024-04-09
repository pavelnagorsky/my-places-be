import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RoleNamesEnum } from './enums/role-names.enum';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    try {
      const role = await this.rolesRepository.create(createRoleDto);
      return await this.rolesRepository.save(role);
    } catch (e) {
      throw new BadRequestException({ message: 'Role already exists' });
    }
  }

  async getRoleByName(roleName: RoleNamesEnum) {
    return this.rolesRepository.findOne({
      where: {
        name: Equal(roleName),
      },
    });
  }
}
