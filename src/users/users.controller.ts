import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserFromTokenPipe } from '../auth/pipes/user-from-token.pipe';
import { User } from './entities/user.entity';
import { TokenPayload } from '../auth/decorators/token-payload.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    description: 'users',
    type: UserDto,
    isArray: true,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((u) => new UserDto(u));
  }

  @ApiOperation({ summary: 'Get user data' })
  @ApiOkResponse({
    description: 'user',
    type: UserDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Get('/userData')
  async userData(@TokenPayload(UserFromTokenPipe) user: User) {
    return new UserDto(user);
  }

  @ApiOperation({ summary: 'Get user relations (likes, comments)' })
  @ApiOkResponse({
    description: 'user',
    type: UserDto,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Auth()
  @Get('/userRelations')
  async userRelations(@TokenPayload(UserFromTokenPipe) user: User) {
    return new UserDto(user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
