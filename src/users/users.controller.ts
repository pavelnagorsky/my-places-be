import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserFromTokenPipe } from '../auth/pipes/user-from-token.pipe';
import { User } from './entities/user.entity';
import { TokenPayload } from '../auth/decorators/token-payload.decorator';
import { AccessTokenPayloadDto } from '../auth/dto/access-token-payload.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidationExceptionDto } from '../shared/validation/validation-exception.dto';
import { RoleNamesEnum } from '../roles/enums/role-names.enum';
import { UserShortInfoDto } from './dto/user-short-info.dto';
import { UsersRequestDto } from './dto/users-request.dto';
import { UsersResponseDto } from './dto/users-response.dto';
import { ModeratorDto } from './dto/moderator.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    description: 'users',
    type: UserShortInfoDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
  })
  @ApiBody({
    type: UsersRequestDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.ADMIN)
  @Post('List')
  async findAll(@Body() dto: UsersRequestDto) {
    const [users, total] = await this.usersService.findAll(dto);
    return new UsersResponseDto(users, {
      requestedPage: dto.page,
      pageSize: dto.pageSize,
      totalItems: total,
    });
  }

  @ApiOperation({ summary: 'Get user data by token' })
  @ApiOkResponse({
    description: 'user',
    type: UserDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Get('userData')
  async userData(@TokenPayload(UserFromTokenPipe) user: User) {
    return new UserDto(user);
  }

  @ApiOperation({ summary: 'Get user info for admin' })
  @ApiOkResponse({
    description: 'user',
    type: UserShortInfoDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User id',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.ADMIN)
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOneById(id);
    if (!user) throw new NotFoundException({ message: 'User was not found' });
    return new UserShortInfoDto(user);
  }

  @ApiOperation({ summary: 'Get moderator info for admin' })
  @ApiOkResponse({
    description: 'user',
    type: ModeratorDto,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User id',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth(RoleNamesEnum.ADMIN)
  @Get(':id/moderator')
  async getModeratorByUserId(@Param('id', ParseIntPipe) id: number) {
    const moderator = await this.usersService.findModeratorByUserId(id);
    if (!moderator)
      throw new NotFoundException({ message: 'Moderator was not found' });
    return new ModeratorDto(moderator);
  }

  @ApiOperation({ summary: 'Confirm user email' })
  @ApiOkResponse({
    description: 'OK',
  })
  @Auth()
  @Post('/confirm')
  async confirmEmail(@TokenPayload() tokenPayload: AccessTokenPayloadDto) {
    await this.usersService.confirmEmail(tokenPayload.id);
    return;
  }

  @ApiOperation({ summary: 'Update user by token' })
  @ApiBody({
    type: UpdateUserDto,
  })
  @ApiOkResponse({
    description: 'OK',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
  })
  @Auth()
  @Put()
  async update(
    @TokenPayload() tokenPayload: AccessTokenPayloadDto,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.usersService.update(tokenPayload.id, updateUserDto);
    return;
  }
}
