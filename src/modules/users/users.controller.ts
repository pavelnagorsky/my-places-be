import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserFromTokenPipe } from '../auth/pipes/user-from-token.pipe';
import { User } from './entities/user.entity';
import { TokenPayload } from '../auth/decorators/token-payload.decorator';
import { AccessTokenPayloadDto } from '../auth/dto/access-token-payload.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ValidationExceptionDto } from '../../shared/validation/validation-exception.dto';
import { RoleNamesEnum } from '../roles/enums/role-names.enum';
import { UserShortInfoDto } from './dto/user-short-info.dto';
import { UsersRequestDto } from './dto/users-request.dto';
import { UsersResponseDto } from './dto/users-response.dto';
import { ModeratorDto } from './dto/moderator.dto';
import { SaveModeratorDto } from './dto/save-moderator.dto';
import { BlockUserDto } from './dto/block-user.dto';
import { EmailDto } from './dto/email.dto';

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
    description: 'ok',
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

  @ApiOperation({ summary: 'Block user' })
  @ApiOkResponse({
    description: 'ok',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User id',
  })
  @ApiBody({
    type: BlockUserDto,
  })
  @Auth(RoleNamesEnum.ADMIN)
  @Post(':id/block')
  async blockUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BlockUserDto,
  ) {
    await this.usersService.blockUser(id, dto);
    return;
  }

  @ApiOperation({ summary: 'Unblock user' })
  @ApiOkResponse({
    description: 'ok',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User id',
  })
  @Auth(RoleNamesEnum.ADMIN)
  @Post(':id/unblock')
  async unblockUser(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.unblockUser(id);
    return;
  }

  @ApiOperation({ summary: 'Update or create moderator info' })
  @ApiOkResponse({
    description: 'ok',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User id',
  })
  @ApiBody({
    type: SaveModeratorDto,
  })
  @Auth(RoleNamesEnum.ADMIN)
  @Put(':id/moderator')
  async saveModerator(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SaveModeratorDto,
  ) {
    await this.usersService.saveModerator(id, dto);
    return;
  }

  @ApiOperation({ summary: 'Delete moderator' })
  @ApiOkResponse({
    description: 'ok',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'User id',
  })
  @Auth(RoleNamesEnum.ADMIN)
  @Delete(':id/moderator')
  async deleteModerator(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.deleteModeratorAccess(id);
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

  @ApiOperation({ description: 'send email to user' })
  @ApiBody({ type: EmailDto })
  @ApiOkResponse({
    description: 'OK',
  })
  @Auth(RoleNamesEnum.ADMIN)
  @Post('email')
  async sendEmail(@Body() dto: EmailDto) {
    await this.usersService.sendEmail(dto);
  }
}
