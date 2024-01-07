import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RolesService } from '../roles/roles.service';
import { RoleNamesEnum } from '../roles/enums/role-names.enum';
import { Language } from '../languages/entities/language.entity';
import { LanguagesService } from '../languages/languages.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly rolesService: RolesService,
    private readonly languagesService: LanguagesService,
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

  async confirmEmail(userId: number) {
    await this.usersRepository
      .createQueryBuilder('user')
      .update()
      .set({ isEmailConfirmed: true })
      .where('id = :id', { id: userId })
      .execute();
    return;
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
      loadRelationIds: { relations: ['preferredLanguage'] },
      relations: {
        roles: true,
        admin: true,
      },
      where: {
        id: Equal(id),
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: {
        id: Equal(id),
      },
    });
    if (!user) throw new NotFoundException({ message: 'User was not found' });
    if (updateUserDto.preferredLanguageId) {
      const language = await this.languagesService.findOneById(
        updateUserDto.preferredLanguageId,
      );
      user.preferredLanguage = language;
    } else {
      user.preferredLanguage = null;
    }
    user.lastName = updateUserDto.lastName;
    user.firstName = updateUserDto.firstName;
    user.email = updateUserDto.email;
    await this.usersRepository.save(user);
    return;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
