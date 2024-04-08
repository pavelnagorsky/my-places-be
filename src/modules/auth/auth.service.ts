import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { hash, compare, compareSync } from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { AccessTokenPayloadDto } from './dto/access-token-payload.dto';
import { MailingService } from '../mailing/mailing.service';
import LoginErrorEnum from './enums/login-error.enum';
import { ConfigService } from '@nestjs/config';
import { IFrontendConfig, IJwtConfig } from '../../config/configuration';
import { ITokens } from './interfaces/interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, LessThan, Repository } from 'typeorm';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { LoginException } from './exceptions/login.exception';
import { ConfirmEmail } from '../mailing/emails/confirm.email';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';
import { ResetPasswordEmail } from '../mailing/emails/reset-password.email';

@Injectable()
export class AuthService {
  private logger = new Logger();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailingService: MailingService,
    private readonly config: ConfigService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokensRepository: Repository<RefreshTokenEntity>,
  ) {}

  // register logic:
  // 1) validate data
  // 2) hash password
  // 3) create user
  // 4) generate email token
  // 5) send confirmation email
  async register(dto: CreateUserDto) {
    // validate user email
    const alreadyExists = await this.usersService.getUserByEmail(dto.email);
    if (alreadyExists)
      throw new UnauthorizedException({
        message: 'User with this email already exists',
      });
    // hash password
    const hashedPassword = await hash(dto.password, 8);
    dto.password = hashedPassword;
    // create user
    const user = await this.usersService.create(dto);
    this.logger.log(`SIGNUP success! ID ${user.id}, Email: ${user.email}`);
    // generate email token
    const emailToken = await this.generateEmailToken(user);
    const domain = this.config.get<IFrontendConfig>('frontend')
      ?.domain as string;
    const confirmLink = `${domain}/auth/confirm/${emailToken}`;
    // send confirmation email
    const email = new ConfirmEmail(user, confirmLink);
    await this.mailingService.sendEmail(email);
    return;
  }

  // login logic:
  // 1) validate data
  // 2) generate new tokens
  // 3) save refresh token in db
  // 4) if count of refresh tokens in db > 10 delete previous tokens
  async login(loginDto: LoginDto, userAgent: string | null): Promise<ITokens> {
    const user = await this.validateUser(loginDto);
    // generate tokens
    const tokens = await this.generateTokens(user);
    // save refresh token in db
    const savedToken = await this.saveRefreshToken(
      user.id,
      tokens.refreshToken,
      userAgent,
    );
    // if count of refresh tokens in db > 10 delete previous tokens
    const totalUserTokens = await this.refreshTokensRepository.count();
    if (totalUserTokens > 10) {
      this.logger.warn(
        `LOGIN warning! User has more than 10 refresh tokens (${totalUserTokens}). ID: ${user.id}, Refresh token: ${tokens.refreshToken}`,
      );
      await this.refreshTokensRepository.delete({
        id: LessThan(savedToken.id),
      });
    }

    this.logger.log(
      `LOGIN success! ID: ${user.id}, Access Token: ${tokens.accessToken}`,
    );
    return tokens;
  }

  // logout logic:
  // 1) delete current refresh token from db
  async logout(userId: number, refreshToken: string) {
    const tokenForDeletion = await this.findUserRefreshToken(
      userId,
      refreshToken,
    );
    if (!tokenForDeletion) return;
    await this.refreshTokensRepository.remove([tokenForDeletion]);
    this.logger.log(`LOGOUT success! user ID: ${userId}`);
    return;
  }

  // refresh tokens logic:
  // 1) find user refresh token in db
  // 3) throw 401 if no token
  // 4) generate a new pair of tokens
  // 5) update refresh token in db (new token value and expiry date)
  // 6) clean user expired tokens
  async refreshTokens(user: User, refreshToken: string): Promise<ITokens> {
    // find user refresh token in db
    const userRefreshToken = await this.findUserRefreshToken(
      user.id,
      refreshToken,
    );
    if (!userRefreshToken) {
      // throw 401 if no token
      this.logger.error(
        `TOKEN REFRESH error: No token found with equal value. Requested with value: ${refreshToken} by user ${user.id}`,
      );
      throw new UnauthorizedException({ message: 'Invalid refresh token' });
    }
    // generate a new pair of tokens
    const tokens = await this.generateTokens(user);
    // update refresh token in db (new token value and expiry date)
    userRefreshToken.expiryDate = this.prepareRefreshTokenExpiryDate();
    userRefreshToken.token = tokens.refreshToken;
    await this.refreshTokensRepository.save(userRefreshToken);
    // clean user expired tokens (await is not needed for optimization)
    this.cleanExpiredTokens(user.id);

    this.logger.log(
      `TOKEN REFRESH success: ID: ${user.id}, Email: ${user.email}, Access Token: ${tokens.accessToken}`,
    );
    return tokens;
  }

  // reset password request logic:
  // 1) check if user with requested email exists
  // 2) generate token
  // 3) send confirmation email with token link
  async resetPasswordRequest(dto: ResetPasswordRequestDto) {
    const user = await this.usersService.getUserByEmail(dto.email);
    if (!user) return;
    // generate token
    const token = await this.generateRefreshPasswordToken(user);
    const domain = this.config.get<IFrontendConfig>('frontend')
      ?.domain as string;
    const confirmLink = `${domain}/auth/reset-password/${token}`;
    // send confirmation email
    const email = new ResetPasswordEmail(user, confirmLink);
    await this.mailingService.sendEmail(email);
    return;
  }

  // reset password logic:
  // 2) hash new password
  // 3) update user in db
  async resetPassword(dto: ResetPasswordDto, user: User) {
    // hash password
    const hashedPassword = await hash(dto.password, 8);
    // update user
    await this.usersService.updateUserPassword(hashedPassword, user);
    return;
  }

  // confirm user email
  async confirmEmail(userId: number) {
    await this.usersService.confirmEmail(userId);
    return;
  }

  // login validation
  private async validateUser(loginDto: LoginDto) {
    const user = await this.usersService.getUserByEmail(loginDto.email);
    if (!user)
      throw new LoginException({
        message: 'No users with this email found',
        loginError: LoginErrorEnum.INVALID_DATA,
      });
    if (!user.isEmailConfirmed)
      throw new LoginException({
        message: 'Email is not confirmed',
        loginError: LoginErrorEnum.EMAIL_NOT_CONFIRMED,
      });
    if (user.blockedUntil && user.blockedUntil.getTime() > new Date().getTime())
      throw new LoginException({
        message: 'User is blocked',
        loginError: LoginErrorEnum.USER_BLOCKED,
        blockedUntil: user.blockedUntil,
      });
    const passwordEquals = await compare(loginDto.password, user.password);
    if (!passwordEquals)
      throw new LoginException({
        message: 'Incorrect password',
        loginError: LoginErrorEnum.INVALID_DATA,
      });
    return user;
  }

  private async findUserRefreshToken(userId: number, token: string) {
    const tokenEntity = await this.refreshTokensRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        token: Equal(token),
      },
      select: {
        id: true,
        token: true,
        user: {
          id: true,
        },
      },
    });

    return tokenEntity;
  }

  private async saveRefreshToken(
    userId: number,
    token: string,
    userAgent: string | null,
  ) {
    const expiryDate = this.prepareRefreshTokenExpiryDate();
    return await this.refreshTokensRepository.save({
      user: {
        id: userId,
      },
      token: token,
      expiryDate: expiryDate,
      userAgent: userAgent,
    });
  }

  private prepareRefreshTokenExpiryDate() {
    const expirationFromConfig = this.config.get<IJwtConfig>('jwt')
      ?.refreshTokenExpiration as string; // as 10s or 10d
    const parseToMilliseconds = (msStr: string): number => {
      const numberPart = +msStr.slice(0, -1);
      const typePart = msStr.substring(msStr.length - 1);
      if (typePart === 's') {
        return numberPart * 1000;
      }
      if (typePart === 'd') return numberPart * 1000 * 86400;
      return numberPart;
    };
    const expirationInMilliseconds = parseToMilliseconds(expirationFromConfig);
    const expirationDate = new Date(
      new Date().getTime() + expirationInMilliseconds,
    );
    return expirationDate;
  }

  private async cleanExpiredTokens(userId: number) {
    return await this.refreshTokensRepository.delete({
      user: {
        id: userId,
      },
      expiryDate: LessThan(new Date()),
    });
  }

  private async generateTokens(user: User): Promise<ITokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  private async generateEmailToken(user: User) {
    const payload: AccessTokenPayloadDto = {
      email: user.email,
      id: user.id,
      roles: user.roles,
    };
    return this.jwtService.signAsync(payload, {
      expiresIn: this.config.get<IJwtConfig>('jwt')
        ?.emailTokenExpiration as string,
      secret: this.config.get<IJwtConfig>('jwt')?.emailTokenSecret as string,
    });
  }

  private async generateRefreshPasswordToken(user: User) {
    const payload: AccessTokenPayloadDto = {
      email: user.email,
      id: user.id,
      roles: user.roles,
    };
    return this.jwtService.signAsync(payload, {
      expiresIn: this.config.get<IJwtConfig>('jwt')
        ?.resetPasswordTokenExpiration as string,
      secret: this.config.get<IJwtConfig>('jwt')
        ?.resetPasswordTokenSecret as string,
    });
  }

  private async generateAccessToken(user: User) {
    const payload: AccessTokenPayloadDto = {
      email: user.email,
      id: user.id,
      roles: user.roles,
    };
    return this.jwtService.signAsync(payload, {
      expiresIn: this.config.get<IJwtConfig>('jwt')
        ?.accessTokenExpiration as string,
      secret: this.config.get<IJwtConfig>('jwt')?.accessTokenSecret as string,
    });
  }

  private async generateRefreshToken(user: User) {
    const payload: AccessTokenPayloadDto = {
      email: user.email,
      id: user.id,
      roles: user.roles,
    };
    return this.jwtService.signAsync(payload, {
      expiresIn: this.config.get<IJwtConfig>('jwt')
        ?.refreshTokenExpiration as string,
      secret: this.config.get<IJwtConfig>('jwt')?.refreshTokenSecret as string,
    });
  }
}
