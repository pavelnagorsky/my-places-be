import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
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
import { SaveModeratorDto } from './dto/save-moderator.dto';
import { BlockUserDto } from './dto/block-user.dto';
import { RefreshTokenEntity } from '../auth/entities/refresh-token.entity';
import { MailingService } from '../mailing/mailing.service';
import { ConfirmEmail } from '../mailing/emails/confirm.email';
import { EmailDto } from './dto/email.dto';
import { CustomEmail } from '../mailing/emails/custom.email';
import { BlockUserEmail } from '../mailing/emails/block-user.email';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Moderator)
    private readonly moderatorsRepository: Repository<Moderator>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokensRepository: Repository<RefreshTokenEntity>,
    private readonly rolesService: RolesService,
    private readonly languagesService: LanguagesService,
    private readonly mailingService: MailingService,
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
    const user = await this.findOneById(userId);
    if (!user) throw new NotFoundException({ message: 'User was not found' });
    user.isEmailConfirmed = true;
    await this.usersRepository.save(user);
    return;
  }

  async findUserByEmail(email: string) {
    return await this.usersRepository.findOne({
      relations: {
        roles: true,
      },
      where: {
        email: Equal(email),
      },
    });
  }

  async findUsers(dto: UsersRequestDto) {
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
    // delete roles
    user.roles = user.roles.filter((r) => r.name !== RoleNamesEnum.MODERATOR);
    // delete associated info
    if (user.moderator) {
      await this.moderatorsRepository.remove([user.moderator]);
    }
    user.moderator = null;
    await this.usersRepository.save(user);
    return;
  }

  async blockUser(userId: number, dto: BlockUserDto) {
    const user = await this.usersRepository.findOne({
      relations: {
        refreshTokens: true,
      },
      where: {
        id: Equal(userId),
      },
    });
    if (!user) throw new NotFoundException({ message: 'User was not found' });
    user.blockedUntil = new Date(dto.blockEnd);
    user.blockReason = dto.reason;
    await this.refreshTokensRepository.remove(user.refreshTokens);
    user.refreshTokens = [];
    await this.usersRepository.save(user);
    if (!user.receiveEmails) return;
    this.mailingService.sendEmail(
      new BlockUserEmail({ blocked: true, comment: dto.reason }, user),
    );
    return;
  }

  async unblockUser(userId: number) {
    const user = await this.findOneById(userId);
    if (!user) throw new NotFoundException({ message: 'User was not found' });
    user.blockedUntil = null;
    user.blockReason = null;
    await this.usersRepository.save(user);
    if (!user.receiveEmails) return;
    this.mailingService.sendEmail(new BlockUserEmail({ blocked: false }, user));
    return;
  }

  async saveModerator(userId: number, dto: SaveModeratorDto) {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        moderator: true,
        roles: true,
      },
    });
    if (!user) throw new NotFoundException({ message: 'User was not found' });
    const updatedModerator = this.moderatorsRepository.create({
      id: user.moderator?.id,
      phone: dto.phone || user.moderator?.phone,
      address: dto.address || user.moderator?.address,
    });
    user.moderator = updatedModerator;
    if (
      user.roles.findIndex((r) => r.name === RoleNamesEnum.MODERATOR) === -1
    ) {
      const moderatorRole = await this.rolesService.getRoleByName(
        RoleNamesEnum.MODERATOR,
      );
      if (!moderatorRole)
        throw new NotFoundException({ message: 'Moderator role not found' });
      user.roles.push(moderatorRole);
    }
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
    user.receiveEmails = updateUserDto.receiveEmails;
    await this.usersRepository.save(user);
    return;
  }

  async getAllUsers() {
    const users = await this.usersRepository.find({
      select: {
        firstName: true,
        lastName: true,
        id: true,
      },
    });
    return users;
  }

  async updateUserPassword(password: string, user: User) {
    user.password = password;
    await this.usersRepository.save(user);
    return;
  }

  async sendEmail(dto: EmailDto) {
    const email = new CustomEmail(dto);
    await this.mailingService.sendEmail(email);
    return;
  }

  // Cron job for unblocking users
  @Cron(CronExpression.EVERY_12_HOURS)
  private async unblockUsersAutomatic() {
    const users = await this.usersRepository.find({
      where: {
        blockedUntil: And(Not(IsNull()), LessThanOrEqual(new Date())),
      },
    });
    const updatedUsers = users.map((u) => {
      u.blockedUntil = null;
      u.blockReason = null;
      return u;
    });
    await this.usersRepository.save(updatedUsers);
    updatedUsers.forEach((u) => {
      if (!u.receiveEmails) return;
      this.mailingService.sendEmail(new BlockUserEmail({ blocked: false }, u));
    });
  }
}
