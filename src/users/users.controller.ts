import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
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
  @ApiBadRequestResponse({
    description: 'Validation failed',
    type: ValidationExceptionDto,
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

  @ApiOperation({ summary: 'Update user' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'The ID of the user',
  })
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
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.usersService.update(id, updateUserDto);
    return;
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
