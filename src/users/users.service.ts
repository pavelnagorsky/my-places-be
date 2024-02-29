import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  Equal,
  ILike,
  In,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { User } from './entities/user.entity';
import { RolesService } from '../roles/roles.service';
import { RoleNamesEnum } from '../roles/enums/role-names.enum';
import { UsersRequestDto } from './dto/users-request.dto';
import { Moderator } from './entities/moderator.entity';
import { LanguagesService } from '../languages/languages.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Moderator)
    private readonly moderatorsRepository: Repository<Moderator>,
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

  async findAll(dto: UsersRequestDto) {
    const getDateWhereOption = () => {
      if (!!dto.dateFrom && !!dto.dateTo)
        return Between(new Date(dto.dateFrom), new Date(dto.dateTo));
      if (!!dto.dateFrom) return MoreThanOrEqual(new Date(dto.dateFrom));
      if (!!dto.dateTo) return LessThanOrEqual(new Date(dto.dateTo));
      return undefined;
    };

    return await this.usersRepository.findAndCount({
      relations: {
        roles: true,
        preferredLanguage: true,
      },
      skip: dto.page * dto.pageSize,
      take: dto.pageSize,
      order: {
        id: 'desc',
      },
      where: {
        blockedUntil:
          dto.isBlocked === true
            ? Not(IsNull())
            : dto.isBlocked === false
            ? IsNull()
            : undefined,
        createdAt: getDateWhereOption(),
        email:
          !!dto.email && dto.email.length > 0
            ? ILike(`${dto.email}%`)
            : undefined,
        roles: {
          name:
            !!dto.roles && dto.roles?.length > 0 ? In(dto.roles) : undefined,
        },
      },
    });
  }

  async findOneById(id: number) {
    return await this.usersRepository.findOne({
      relations: {
        roles: true,
        preferredLanguage: true,
      },
      where: {
        id: Equal(id),
      },
    });
  }

  async deleteModeratorAccess(userId: number) {
    const user = await this.usersRepository.findOne({
      relations: {
        roles: true,
        moderator: true,
      },
      where: {
        id: Equal(userId),
      },
    });
    if (!user) throw new NotFoundException({ message: 'User was not found' });
    user.roles = user.roles.filter((r) => r.name === RoleNamesEnum.USER);
    await this.moderatorsRepository.remove([user.moderator]);
    await this.usersRepository.save(user);
    return;
  }

  async findModeratorByUserId(id: number) {
    return await this.moderatorsRepository.findOne({
      relations: {
        user: true,
      },
      where: {
        user: {
          id: Equal(id),
        },
      },
      select: {
        user: {
          id: true,
        },
        id: true,
        address: true,
        phone: true,
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
}
