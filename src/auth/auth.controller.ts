import {
  Body,
  Controller,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
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
import { UserAgent } from './decorators/user-agent.decorator';
import { Response } from 'express';
import { CookiesEnum } from './enums/cookies.enum';
import { Cookies } from './decorators/cookies.decorator';
import { TokenPayload } from './decorators/token-payload.decorator';
import { AccessTokenPayloadDto } from './dto/access-token-payload.dto';
import { Auth } from './decorators/auth.decorator';
import { cookieConfig } from './config/cookie.config';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { UserFromTokenPipe } from './pipes/user-from-token.pipe';
import { User } from '../users/entities/user.entity';

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
  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    await this.authService.register(createUserDto);
    return;
  }

  @ApiOperation({ summary: 'Logout' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: UnauthorizedException,
  })
  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
    @TokenPayload() tokenPayload: AccessTokenPayloadDto,
    @Cookies(CookiesEnum.REFRESH_TOKEN) refreshToken: string,
  ) {
    await this.authService.logout(tokenPayload.id, refreshToken);
    response.clearCookie(CookiesEnum.REFRESH_TOKEN, cookieConfig);
    return;
  }

  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: UnauthorizedException,
  })
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(
    @Res({ passthrough: true }) response: Response,
    @TokenPayload(UserFromTokenPipe) user: User,
    @Cookies(CookiesEnum.REFRESH_TOKEN) refreshToken: string,
  ) {
    const tokens = await this.authService.refreshTokens(user, refreshToken);
    response.cookie(
      CookiesEnum.REFRESH_TOKEN,
      tokens.refreshToken,
      cookieConfig,
    );
    return new AuthDto(tokens.accessToken);
  }

  @ApiOperation({ summary: 'Login' })
  @ApiOkResponse({
    description: 'token response',
    type: AuthDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: UnauthorizedException,
  })
  @ApiBody({
    type: LoginDto,
  })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
    @UserAgent() userAgent: string | null,
  ) {
    const tokens = await this.authService.login(loginDto, userAgent);
    response.cookie(
      CookiesEnum.REFRESH_TOKEN,
      tokens.refreshToken,
      cookieConfig,
    );
    return new AuthDto(tokens.accessToken);
  }
}
